
// to parse colors as strings
parseColor = function (color, toNumber) {
  if (toNumber === true) {
    if (typeof color === 'number') {
      return (color | 0); //chop off decimal
    }
    if (typeof color === 'string' && color[0] === '#') {
      color = color.slice(1);
    }
    return window.parseInt(color, 16);
  } else {
    if (typeof color === 'number') {
      //make sure our hexadecimal number is padded out
      color = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
    }

    return color;
  }
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

two.bind('update', function(f){pauseAll(flags.playing)});
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





//var nodes = {}, links = {};


// var mouse,
//     container = document.getElementById('two_0');

// var clickNode = function(){
// 	mouse = {
// 	    x: null,
// 	    y: null
// 	};

// 				container.addEventListener( 'mousedown', onDocumentMouseDown, false );
// 				container.addEventListener( 'touchstart', onDocumentTouchStart, false );
				
// 				window.addEventListener( 'resize', onWindowResize, false );

// 			}

// 			function onWindowResize() {
// 				//camera.aspect = window.innerWidth / window.innerHeight;
// 			}
			
// 			function onDocumentTouchStart( event ) {
				
// 				event.preventDefault();
				
// 				event.clientX = event.touches[0].clientX;
// 				event.clientY = event.touches[0].clientY;
// 				onDocumentMouseDown( event );

// 			}

// 			function onDocumentMouseDown( event ) {

// 				event.preventDefault();

// 				mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
// 				mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

				

// 				var intersects = raycaster.intersectObjects(
// 				  scene.children.slice(4,scene.children.length) ); // to skip non-network objects
        
// 				if ( intersects.length > 0 ) {
          
// 					//intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
//           console.log(intersects[ 0 ].object.geometry.type);
//           var obid = intersects[ 0 ].object.id;
//           // if (intersects[ 0 ].object.geometry.type == "TetrahedronGeometry"){
//           // vars.nodeGeometry.includes(inter...)
//           if (intersects[ 0 ].object.geometry.type == vars.nodeGeometry ){
//             intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
//             for (i in nodes){
//               if (nodes[i].node.id == obid){
//                 console.log("Node ", nodes[i].id);
//                 clicked.type = nodes[i].type;
//                 clicked.id = nodes[i].id;
                
//                 eventlogger.innerHTML = "Node " + nodes[i].id;
//                 break;
//               }
//             }
//           }
//           //else
//           // if (intersects[ 0 ].object.geometry.type == "CylinderGeometry"){
//           if (intersects[ 0 ].object.geometry.type == vars.edgeGeometry ){
//             for (i in edges){
//               //console.log(i);
//               try{
//                 if (edges[i].link.mesh.id == obid){
//                   console.log("Edge ", edges[i].endpoints);
//                   clicked.type = edges[i].type;
//                   clicked.id = edges[i].endpoints;
                  
//                   eventlogger.innerHTML = "Link " + edges[i].endpoints;
//                   break;
//                 }
//               }catch(err){continue}
//             }
//           }
//     }

// }



// Here's my data model
// var ViewModel = function(first, last) {
//     this.firstName = ko.observable(first);
//     this.lastName = ko.observable(last);
 
//     this.fullName = ko.pureComputed(function() {
//         // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
//         return this.firstName() + " " + this.lastName();
//     }, this);
// };
 
//ko.applyBindings(new ViewModel("Planet", "Earth")); // This makes Knockout get to work

var ViewModel = function(label) {
    this.nodeLabel = ko.observable(label);
    var self = this;
    self.makeNode = function(){
        var ls = misc.splitClean(self.nodeLabel());
        ls.forEach(function(a){
            misc.makeNode("people", a, 200, 300, 50, 0, {fill: 0x00aaff});
        });
    }
    
    this.linkNodes = ko.observable('Alice, Bob');
    self.makeLink = function(){
        var nd = misc.splitClean(self.linkNodes());
        if (nd.length ==2){
            new network.link(nd[0],nd[1]);
        }
        console.log(nd);
    }
    this.projectLabel = ko.observable('Nomad Net');
    self.makeProject = function(){
        var ls = misc.splitClean(self.projectLabel());
        ls.forEach(function(a){
            misc.makeNode("projects", a, 500, 100, 100, 3, {fill: 0xff5533});
        });
    }
    
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
};
 
ko.applyBindings(new ViewModel()); // This makes Knockout get to work

events.dragAround('toolbox')