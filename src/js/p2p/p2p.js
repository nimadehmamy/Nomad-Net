
/*
For Peer 2 Peer connections using Peer.js wrapper for webRTC
-Nima
*/

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