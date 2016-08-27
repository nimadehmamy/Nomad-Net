

// make gui
menu.makeGUI();

def = { //defaults
    r: 20
};

var flags = {
    bound: false, // set if two.bind('update', ... ) is used to avoid animation clashes
    playing: [], // once all animations stop, use this two call two.pause()
    hasEvents: {}, // to know which object has events, to remove if necessary
    links: {}
}
function pauseAll(ls){
    if (ls.length == 0){
        two.pause();
        console.log('all done; pausing...');
    }
}

//two.bind('update', function(f){pauseAll(flags.playing)});
//two.bind('update', function(f){redrawLinks(flags.links)});

var smoothPop = function(obj,scale, speed) {
    var s = scale || 0.9999,
        sp = speed || 0.125;
    // This code is called everytime two.update() is called.
    // Effectively 60 times per second.
    if (Math.abs(obj.group.scale -s) < 0.001) {
        //two.unbind('update',null);
        console.log(obj.group.id+s, 'done');
        two._events.update.pop(flags.hasEvents[obj.group.id]);
        //two.pause();
        flags.playing.pop();
    }
    var t = (s - obj.group.scale) * sp;
    //console.log(sp,s,obj.group.scale,t);
    obj.group.scale += t;
};

var ViewModel = function(label) {
    this.peopleLabel = ko.observable('Alice');
    var self = this;
    //self.makeNodes
    self.makePeople = function(){
        var ls = misc.splitClean(self.peopleLabel());
        var type = "people";
        ls.forEach(function(name){
            var con = controls.nodes[type]
            misc.makeNode(type, name, 500, 300//, {fill: 0x00aaff}
            );
            network.nodes[name].info['Testing'] = {
                form: 'hi'
            };
        });
    }
    
    this.projectsLabel = ko.observable('Nomads');
    self.makeProjects = function(){
        var ls = misc.splitClean(self.projectsLabel());
        var type = "projects";
        ls.forEach(function(a){
            misc.makeNode(type, a, 500, 100);
        });
    };
    
    
    this.tasksLabel = ko.observable('Solve');
    self.makeTasks = function(){
        var ls = misc.splitClean(self.tasksLabel());
        var type = "tasks";
        ls.forEach(function(a) {
            misc.makeNode(type, a, 500, 500 );
        });
    };
    
    this.linksLabel = ko.observable('Alice, Bob');
    self.makeLinks = function(){network.makeLinks(self.linksLabel());
    };
    
    
    // self.showInfo = function(){
    //     var node = {info:{
    //          hi: 'there',
    //          how: 'are you'
    //      }
    //      };
    //     str = "";
    //     for (i in node.info){
    //         s += i+": "+node.info[i] +"<br>";
    //     }
    //     $('#info').innerHTML = s;
    // }
    
    this.changeInfo = function(){
        var el = document.activeElement;
        network.nodes[misc.infoNode].info[el.id.slice(2)] = el.value;
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
                    misc.makeNode(type, label, y[label][0], y[label][1]);
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
                    "label": [x, y]
                }
            },
            "links":{
                "label1,label2;..."
            }
        }
        `;
        
    };
    
    
    
    
    
    
    
    
    
    /// Peer to Peer parts
    
    this.userId = ko.observable('enter your ID');
    this.peerId = ko.observable('other Peer ID');
    this.setupUser = function(){
        p2p.setupPeer(self.userId());
    };
    this.peerConnect = function(){
        p2p.peerConnect(self.peerId());
    };
    this.p2preset = function(){p2p.reset()};
    
    this.vid = ko.observable('default');
    this.videoStream = function(){
        //streamer.stream($('#myvid')[0].src);
        
        
    };
    
    this.fizzix = function(){
        two.unbind('update',null);
        two.bind('update', self.repel).play();
    }
    
    this.repel = function(frame){
        var done=true;
        //console.log('fizzzix');
        for (var i in network.nodes){
            for (var j in network.nodes){
                if (i!=j){
                    //console.log(i,j);
                    var nd1 = network.nodes[i].group.translation;
                    var nd2 = network.nodes[j].group.translation;
                    //console.log(nd1,nd2);
                    var dist = new Two.Vector(0,0).sub(nd1, nd2);
                    dist = dist.sub(dist, new Two.Vector(Math.random()-0.5,Math.random()-0.5));
                    //console.log(dist);
                    var f = misc.physics.force(dist,[100,20]);
                    //console.log(f);
                    nd2.sub(nd2,f);
                    var link1 = i + ',' + j;
                    var link2 = j + ',' + i;
                    var k = 1;
                    //console.log(dist.length(), controls.scale/20);
                    if (dist.length()>controls.scale/20){
                        if (flags.links[i].includes(link1) || flags.links[j].includes(link2)) {
                            //console.log(link1, 'exists');
                            try {
                                k = network.links[link1].link.linewidth / (controls.nodeSize / 5);
                            }
                            catch (err) {
                                k = network.links[link2].link.linewidth / (controls.nodeSize / 5);
                            }
                            var fp = misc.physics.linkPull(dist, 20 * k);
                            //console.log('pull:',fp);
                            nd2.sub(nd2, fp);
                        }
                    }
                    var l = flags.links[j];
                    for (var ii in l) {
                        //console.log(l[ii]);
                        network.links[l[ii]].update();
                    }
                    
                    if (f.length()<0.1){
                        done = done && true;
                    }else done=false;
                }
            }
        }
        if (done){
            //two.bind('update', function(f){pauseAll(flags.playing)});
            two.unbind('update',null);
            two.pause();
        }
    };
    
};
 
// var streamer = new Streamer();
// document.querySelector('input[type=file]').onchange = function () {
//     streamer.stream(this.files[0]);
// };
// streamer.push = function (chunk) {
//             p2p.conn.send({
//                 type: 'stream',
//                 stream: chunk
//             });
//         };


menu.makeNodeMenu('people');
menu.makeNodeMenu('projects');
menu.makeNodeMenu('tasks');
menu.makeNodeMenu('links');
ko.applyBindings(new ViewModel()); // This makes Knockout get to work

events.dragAround('toolbox');

function readNet(file){
    var x = $.getJSON(file, function(data){
        console.log(data);
        var nd = data.nodes;
        for (var i in nd) {
            var sides, col, rad;
            if (nd[i].type == "people") {
                sides = 0;
                col = {
                    fill: 0x00aaff
                };
                rad = controls.nodeSize;
            }
            else if (nd[i].type == "projects") {
                sides = 3;
                col = {
                    fill: 0xff5533
                };
                rad = 2 * controls.nodeSize;
            }
            console.log("label: ", i);
            misc.makeNode(nd[i].type, i, 500, 200, rad, sides, col);
            //network.nodes[i];
        }
        network.makeLinks(data.links);
    });
};
