
var gui ;

function makeGUI(){
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
        guis[nd.type].add(nd, 'scale', .1, 5).step(.1).onChange(updateNet);
        guis[nd.type].addColor(nd.style, 'fill').onChange(updateNet);
        //active.type = nd.type;
        console.log('menu: ',nd.type);
    }
}

String.prototype.cap = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function makeNodeMenu(type,but,col,func){
    but = but || 'make';
    col = col || 'red';
    func = 'make'+type.cap();
    switch ( type ) {
        case 'people':
            but = 'Summon';
            col = 'blue';
            break;
        case 'projects':
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
    <form class="in" data-bind="submit: `+func+`">
            <input data-bind="value: `+type+`Label" /><button type="submit" >`+but+`</button>
            <ul class="tags `+col+`" id="`+type+`"></ul>
    </form>
    `);
    
}