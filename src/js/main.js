var el = document.getElementById("main"),
    two = new Two({
        fullscreen: true
    });
 
two.appendTo(el);

var curve = two.makeCurve(110, 100, 120, 50, 140, 150, 160, 50, 180, 150, 190, 100, true);
curve.linewidth = 2;
curve.scale = 1.75;
curve.rotation = Math.PI / 2; // Quarter-turn
curve.noFill();

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
    hasEvents: {} // to know which object has events, to remove if necessary
}
function pauseAll(ls){
    if (ls.length == 0){
        two.pause();
        console.log('all done; pausing...');
    }
}
two.bind('update', function(f){pauseAll(flags.playing)});

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

function resetEvents(obj){
    if (flags.hasEvents[obj.group.id]){
        // if an event exists under this object's name
        // get rid of the event and add new event
        two._events.update.pop(flags.hasEvents[obj.group.id]);
        console.log('removed event ', flags.hasEvents[obj.group.id]);
        //flags.hasEvents[obj.group.id] = undefined;
        flags.playing.pop();
    }
    // keep new event
    try{
        flags.hasEvents[obj.group.id] = two._events.update.length - 1;
    }catch(err){
        flags.hasEvents[obj.group.id] = 0;
    }
    console.log('binding new event for', obj.group.id, flags.hasEvents[obj.group.id]);
    // also keep track of playing event in
    flags.playing.push(obj.group.id);
}

/* Node class:
*/
var outFunc;
function node(label, x,y,r,styles){
    if (!styles){
        var col = Math.random() * 0xffffff;
        this.style = {opacity: 0.5,fill: col,stroke: col,linewidth: r / 50};
    }
    else {this.style = {fill: styles.fill || (Math.random() * 0xffffff)}}
    
    this.node =  two.makeCircle(0, 0, r);
    this.node.fill = parseColor( this.style.fill );
    this.node.noStroke();
    this.text = two.makeText(label,0,0,{
            size: r / label.length * 3,
            stroke: parseColor(.5*(0xffffff - this.style.fill)),
            fill: '#444444' //parseColor(0xffffff - this.style.fill)
    })
    //this.text.noStroke();
    this.group = two.makeGroup(this.node, this.text);
    this.group.translation.set(x,y);
    this.view = function(){
        var self = this
        two.update();
        this.docElement = document.getElementById(this.group.id);
        this.docElement.onmouseenter = function(){
            console.log('mouse in');
            // first keep which event this is to be able to remove it after it's done.
            resetEvents(self);
            two.bind('update', function(f){smoothPop(self, 1.5);}).play();
        }
        this.docElement.onmouseleave = function(){
            // self.group.scale = 1;
            // two.update();
            console.log('mouse out');
            resetEvents(self);
            two.bind('update', function(f){smoothPop(self, 1);}).play();
        }
        
    }
}
two.update();


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