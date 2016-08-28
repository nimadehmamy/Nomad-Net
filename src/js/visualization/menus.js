String.prototype.cap = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


function nodeProps(type, sides, style){
    this.type = type || 'generic';
    this.sides = sides || 0;
    this.radius = 20;
    this.scale = 1;
    this.scale0 = 1;
    this.style = style || {
        fill: 0xff0000,
        stroke: 0xffffff,
        linewidth: 2,
    };
    this.fontSize = 16;
}

function linkProps(type, directed){
    this.type = 'generic';
    this.directed = directed || false;
    this.scale = 1;
    this.scale0 = 1;
    this.style = {
        fill: 0xf00,
        stroke: 0xfff,
        linewidth: 2,
    };
}

var TYPES ={nodes:['people', 'projects', 'tasks']};

var controls = new function(){
    this.scale = 1;
    this.nodes = {
        people: new nodeProps('people' ,0, {fill: '#4531dc'}),
        projects: new nodeProps('projects' ,5, {fill: '#ff5533'}),
        tasks : new nodeProps('tasks', 4, {fill: '#b12176'}),
    };
    this.links = new linkProps();
    
}();


var gui ;

var menu = new function(){
    this.makeGUI = function() {
        gui = new dat.GUI();

        var guiNet = gui.addFolder('Network Properties');
        var guiNode = guiNet.addFolder("Nodes");
        var active = {
            type: '',
            element: ''
        };
        var guis = {};
        for (var k in controls.nodes) {
            var nd = controls.nodes[k];
            guis[nd.type] = guiNode.addFolder(nd.type);
            guis[nd.type].add(nd, 'scale', 0.1, 5).step(0.1).onChange(menu.updateNet);
            guis[nd.type].addColor(nd.style, 'fill').onChange(menu.updateNet);

            guis[nd.type].add(nd, 'fontSize').onChange(menu.resizeText);
            this.fontSize = 16;
            //active.type = nd.type;
            console.log('menu: ', nd.type);
        }


    }


    this.updateNet = function() {
        var nd = network.nodes;
        for (var i in nd) {
            var con = controls.nodes[nd[i].type];
            nd[i].group.scale *= con.scale / con.scale0;
            console.log(i, nd[i]);
            for (var v in con.style) {
                nd[i].node[v] = con.style[v];
            }
        }
        //this.node.fill = misc.parseColor( this.style.fill );
        for (var t in TYPES.nodes) {
            var con = controls.nodes[TYPES.nodes[t]];
            con.scale0 = con.scale;
        }
        two.update();
    }
    
    this.resizeText = function(){
        var nd = network.nodes;
        for (var i in nd) {
            var con = controls.nodes[nd[i].type];
            if (con.fontSize === 0){
                nd[i].text.size = Math.max(nd[i].size / nd[i].text.value.length * 2, 10);
            }else nd[i].text.size = con.fontSize;
        }
        two.update();
    };

    this.makeNodeMenu = function(type, but, col, func) {
        but = but || 'make';
        col = col || 'red';
        func = 'make' + type.cap();
        switch (type) {
            case 'people':
                but = 'Summon';
                col = 'blue';
                break;
            case 'projects':
                but = 'Commence';
                col = 'red';
                break;
            case 'subProjects':
                but = 'Commence';
                col = 'red';
                break;
            case 'tasks':
                but = 'Oblige';
                //col = 'blue';
                break;
            case 'links':
                but = "Link'em";
                col = 'blue';
                break;
        }

        var tbox = $('#toolbox');
        tbox.append(type.cap());
        tbox.append(`
    <form class="in" data-bind="submit: ` + func + `">
            <input data-bind="value: ` + type + `Label" /><button type="submit" >` + but + `</button>
            <ul class="tags ` + col + `" id="` + type + `"></ul>
    </form>
    `);

    };
};