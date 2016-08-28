

// make gui
menu.makeGUI();

def = { //defaults
    r: 5
};

var flags = {
    bound: false, // set if two.bind('update', ... ) is used to avoid animation clashes
    playing: [], // once all animations stop, use this two call two.pause()
    hasEvents: {}, // to know which object has events, to remove if necessary
    links: {}
}

var ViewModel = function(label) {
    this.peopleLabel = ko.observable('Alice');
    var self = this;
    //self.makeNodes
    this.makePeople = function(){
        var ls = misc.splitClean(self.peopleLabel());
        var type = "people";
        ls.forEach(function(name){
            var con = controls.nodes[type];
            network.makeNode(type, name, 500, 300//, {fill: 0x00aaff}
            );
            network.nodes [name].info['Testing'] = {
                form: 'hi'
            };
        });
    };
    
    this.projectsLabel = ko.observable('Nomads');
    this.makeProjects = function(){
        var ls = misc.splitClean(self.projectsLabel());
        var type = "projects";
        ls.forEach(function(a){
            network.makeNode(type, a, 500, 100);
        });
    };
    
    this.subProjectsLabel = ko.observable('Nomadions');
    this.makeSubProjects = function(){
        var ls = misc.splitClean(self.projectsLabel());
        var type = "subProjects";
        ls.forEach(function(a){
            network.makeNode(type, a, 500, 100);
        });
    };
    
    
    this.tasksLabel = ko.observable('Solve');
    this.makeTasks = function(){
        var ls = misc.splitClean(self.tasksLabel());
        var type = "tasks";
        ls.forEach(function(a) {
            network.makeNode(type, a, 500, 500 );
        });
    };
    
    this.linksLabel = ko.observable('Alice, Bob');
    this.makeLinks = function(){network.makeLinks(self.linksLabel());
    };
    
    
    this.changeInfo = function(){
        var el = document.activeElement;
        network.nodes [misc.infoNode].info[el.id.slice(2)] = el.value;
        console.log('submitted ', el.value,' to ',el.id);
        
        
    };
    this.noteText = ko.observable('write your notes here.');
    self.makeNote = function(){
        //
    };
    
    
    //var self = this;
    this.photoUrl = ko.observable('here!!');
    this.fileUpload = function(data, e)
    {
        var file    = e.target.files[0];
        var reader  = new FileReader();

        reader.onloadend = function (onloadend_e)
        {
            var result = reader.result; // Here is your base 64 encoded file. Do with it what you want.
            //console.log(reader.readAsText());
            self.photoUrl(result);
            x = JSON.parse(result);
            for (var type in x.nodes){
                var y = x.nodes[type];
                for (var label in y){
                    //console.log(y[label]);
                    network.makeNode(type, label, y[label] );
                }
            }
            network.makeLinks(x.links);
        };

        if(file)
        {
            //reader.readAsDataURL(file);
            reader.readAsText(file);
        }
        ` The Structure of the json file should be
        {
            "nodes": {
                "type": {
                    "label": {
                        options
                    }
                }
            },
            "links":{
                "label1,label2;..."
            }
        }
        `;
        
    };
    
    

    
};

menu.makeNodeMenu('people');
menu.makeNodeMenu('projects');
menu.makeNodeMenu('subProjects');

menu.makeNodeMenu('tasks');
menu.makeNodeMenu('links');
ko.applyBindings(new ViewModel()); // This makes Knockout get to work

events.dragAround('toolbox');

function readNet(file){
    var x = $.getJSON(file, function(data){
        console.log(data);
        var nd = data.nodes;
        for (var i in nd) {
            console.log("label: ", i);
            network.makeNode(nd[i].type, i);
        }
        network.makeLinks(data.links);
    });
}

var //nodes = null,
    //edges = null,
    //network = null,
    data = null,
    options = null,
    container = null;
    
var LENGTH_MAIN = 350,
    LENGTH_SERVER = 150,
    LENGTH_SUB = 50,
    WIDTH_SCALE = 2,
    GREEN = 'green',
    RED = '#C5000B',
    ORANGE = 'orange',
//GRAY = '#666666',
    GRAY = 'gray',
    BLACK = '#2B1B17';

// CLustering Options
var getClustOpts = function(label){
    // find the head node in the cluster and make cluster options
    var gr = network.nodes[label].type;
    return {
        joinCondition: function(nodeOptions) {
            return (nodeOptions.cid == label)||(nodeOptions.label == label) ;
        },
        clusterNodeProperties: {
            id: "cl:"+label,
            label: label,
            value: 30,
            group: gr
        }
    };
};

// !! Make more general options for clustering
function makeClusters(type){
    type = type || "projects";
    for (var p in network.nodes){
        var nd = network.nodes[p];
        if (nd.type == type){
            network.net.clustering.cluster(getClustOpts(nd.id));
        }
    }
}


// Called when the Visualization API is loaded.
    
function draw(){
    network.data.nodes = new vis.DataSet();
    network.data.edges = new vis.DataSet();
    
    container = $('#network')[0];
    
    var options = {
        nodes: {
            scaling: {
                min: 16,
                max: 32
            }
        },
        edges: {
            color: GRAY,
            smooth: false,
            arrows: {
                from: true
            }
        },
        physics: {
            barnesHut: {
                gravitationalConstant: -30000
            },
            stabilization: {
                iterations: 2500
            }
        },
        groups: {
            projects: {
                shape: 'triangle',
                color: '#FF9900' // orange
            },
            people: {
                shape: 'dot',
                color: "#2B7CE9" // blue
            },
            subProjects: {
                shape: 'diamond',
                color: "#5A1E5C" // purple
            },
            tasks: {
                shape: 'square',
                color: "#C5000B" // red
            },
            internet: {
                shape: 'square',
                color: "#109618" // green
            }
        }
    };
    
    network.net = new vis.Network(container, network.data, options);
    
    network.net.on("doubleClick", function (params) {
        if (params.nodes.length == 1) {
            if (network.net.isCluster(params.nodes[0]) == true) {
                network.net.openCluster(params.nodes[0])
            }
            else {
                network.net.clustering.cluster(getClustOpts(network.nodes[params.nodes[0]].id));
            }
        }
    });
    
    network.net.on('zoom', function (params) {
        if (params.direction == '-') {
            if (params.scale < 0.5) {
                makeClusters();
                
            }
        }
        else if(params.scale > 0.5){
            //openClusters();
        }
    });
    
    network.net.on("click", function (params) {
        try{
            misc.showInfo(params.nodes[0]);
        }catch(err){
            console.log("!! Has no info!!");
        }
    });
    
    
}
