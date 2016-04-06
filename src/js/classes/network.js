
// to build the network and all their attributes

var network = {
    nodes: {},
    links: {},
    
    /* Node class: */
    node: function(label, x,y,r,styles){
        if (!styles){
            var col = Math.random() * 0xffffff;
            this.style = {opacity: 0.5,fill: col,stroke: col,linewidth: r / 50};
        }
        else {this.style = {fill: styles.fill || (Math.random() * 0xffffff)}}
        this.size = r;
        this.node =  two.makeCircle(0, 0, r);
        this.node.fill = parseColor( this.style.fill );
        this.node.noStroke();
        this.text = two.makeText(label,0,0,{
                size: r / label.length * 3,
                stroke: '#555555', //parseColor(.5*(0xffffff - this.style.fill)),
                fill: '#444444' //parseColor(0xffffff - this.style.fill)
        })
        //this.text.noStroke();
        this.group = two.makeGroup(this.node, this.text);
        this.group.translation.set(x,y);
        flags.links[label] = [];
        
        this.view = function(){
            var self = this
            two.update();
            this.docElement = document.getElementById(this.group.id);
            this.docElement.onmouseenter = function(){
                console.log('mouse in');
                // first keep which event this is to be able to remove it after it's done.
                resetEvents(self,1.2);
                //two.bind('update', function(f){smoothPop(self, 1.5);}).play();
            }
            this.docElement.onmouseleave = function(){
                // self.group.scale = 1;
                // two.update();
                console.log('mouse out');
                resetEvents(self,1);
                //two.bind('update', function(f){smoothPop(self, 1);}).play();
            }
            this.docElement.onmousedown = function(){
                console.log('click');
                self.node.fill = '#ffff00';
                two.update();
                self.docElement.addEventListener('mousemove',onMouseMove, false);
                self.docElement.onmousemove = function(){
                    
                }
            }
            
            this.docElement.onmouseup = function(){
                console.log('clack');
                self.node.fill = parseColor( self.style.fill );
                two.update();
                self.docElement.removeEventListener('mousemove',onMouseMove, false);
            }
            mouse = {
        	    x: null,
        	    y: null
        	};
            function onMouseMove (event){
                console.log('mouse at:', event.clientX, event.clientY);
                self.group.translation.set(event.clientX, event.clientY);
                var l = flags.links[label];
                for (i in l){
                    console.log(l[i]);
                    network.links[l[i]].update();
                }
                two.update();
            }
        }
        this.view();
        network.nodes[label] = this;
    },
    
    /* Link class: */
    link: function(label1,label2, styles){
        if (!styles){
            var col = Math.random() * 0xffffff;
            this.style = {opacity: 0.5,fill: col,stroke: col,linewidth: 20};
        }
        else {this.style = {stroke: styles.stroke || (Math.random() * 0xffffff)}}
        this.id = label1+','+label2;
        var p1 = network.nodes[label1].group.translation,
            p2 = network.nodes[label2].group.translation;
        this.link = two.makeLine(p1._x,p1._y,p2._x,p2._y);
        this.link.stroke = parseColor(this.style.stroke);
        this.link.linewidth = network.nodes[label1].size/5;
        
        flags.links[label1].push(this.id);
        flags.links[label2].push(this.id);
        var self = this;
        this.update = function(){
            var p1 = network.nodes[label1].group.translation,
                p2 = network.nodes[label2].group.translation;
            // the line position is its midpoint, the endpoints go in +- dirs
            self.link.translation.set((p1.x+p2.x)/2,(p1.y+p2.y)/2);
            self.link.vertices[0].set((p1.x-p2.x)/2.01,(p1.y-p2.y)/2.01);
            self.link.vertices[1].set(-(p1.x-p2.x)/2.01,-(p1.y-p2.y)/2.01);
            console.log('moving link center to',self.link.translation.x,self.link.translation.y );
        };
        this.group = two.makeGroup();
        this.group.add(this.link);
        this.group.add(network.nodes[label1].group);
        this.group.add(network.nodes[label2].group);
        //two.bind('update', function(f){self.update();});
        two.update();
        network.links[this.id] = this;
        
    }
}