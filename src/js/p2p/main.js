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


//------------------

var p2p = {
    myid:null,
    peer:null,
    otherPeer:null,
    conn:null,
    myData:null,
    peerData:null,
    mediaStream:null,
    streamer: new Streamer(),
    setupPeer: function(myid){
        p2p.myid = myid;
        p2p.peer = new Peer(myid, //{key: 'get a free key from Peer.js'},
            options = {
                config: {
                    'iceServers': [{
                        'url': 'stun:stun.l.google.com:19302'
                    }]
                }
            });
            
        p2p.peer.on('open', function(id) {
          console.log('My peer ID is: ' + id);
        });
        p2p.peer.on('connection', function(conn1) {
            console.log('Peer: connected to peer');
            conn1.on('data', function(data){
                //p2p.peerData = data;
                p2p.handleData(data);
                console.log('logging:',data.type);
            });
        });
    },
    peerConnect: function(peerid){
        p2p.otherPeer = peerid;
        console.log('COnnecting...');
        p2p.conn = p2p.peer.connect(p2p.otherPeer);
        p2p.conn.on('open', function() {
            console.log('connected to ', p2p.otherPeer);
            // Receive messages
            p2p.conn.on('data', function(data) {
                console.log('Peer '+p2p.otherPeer+' says:\n', data);
                p2p.peerData = data;
            });
            
            // Send messages
            p2p.conn.send({client: {
                id: p2p.myid,
                t0: window.performance.now()// new Date().getTime()
            }
            });
        });
        
    },
    
    handleData: function(data){
        if (data.stream){
            console.log('receiving stream chunk');
            if (data.stream.end) p2p.streamer.end();
            else p2p.streamer.append(data.stream);
        }
        
        
    },
    
    reset: function(){
        p2p.peer.disconnect();
        p2p.peer.destroy();
        p2p.peer = null;
    }
    
    
}

p2p.streamer.video = $('#yovid')[0];
p2p.streamer.receive();

p2p.streamer.push = function (chunk) {
            p2p.conn.send({
                type: 'stream',
                stream: chunk
            });
        };