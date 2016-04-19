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

var ViewModel = function(label) {
    this.nodeLabel = ko.observable(label);
    var self = this;
    self.makeNode = function(){
        var ls = misc.splitClean(self.nodeLabel());
        ls.forEach(function(name){
            misc.makeNode("people", name, 500, 300, def.r, 0, {fill: 0x00aaff});
            network.nodes[name].info['Testing'] = {
                form: 'hi'
            };
        });
    }
    
    this.linkNodes = ko.observable('Alice, Bob');
    self.makeLink = function(){network.makeLinks(self.linkNodes())
    };
    
    this.projectLabel = ko.observable('Nomad Net');
    self.makeProject = function(){
        var ls = misc.splitClean(self.projectLabel());
        ls.forEach(function(a){
            misc.makeNode("projects", a, 500, 100, 2*def.r, 3, {fill: 0xff5533});
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
    
    this.changeInfo = function(){
        var el = document.activeElement;
        network.nodes[misc.infoNode].info[el.id.slice(2)] = el.value;
        console.log('submitted ', el.value,' to ',el.id);
        
        
    };
    this.noteText = ko.observable('write your notes here.');
    self.makeNote = function(){
        //
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
        two.bind('update', self.repel).play();
    }
    
    this.repel = function(frame){
        console.log('fizzzix');
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
                    var f = misc.physics.force(dist);
                    console.log(f);
                    
                    if (f.length()>2){
                        nd2.sub(nd2,f);
                    }
                }
            }
        }
    };
    
};
 
var streamer = new Streamer();
document.querySelector('input[type=file]').onchange = function () {
    streamer.stream(this.files[0]);
};
streamer.push = function (chunk) {
            p2p.conn.send({
                type: 'stream',
                stream: chunk
            });
        };
ko.applyBindings(new ViewModel()); // This makes Knockout get to work

events.dragAround('toolbox')

