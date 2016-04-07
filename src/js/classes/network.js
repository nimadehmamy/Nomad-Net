
// to build the network and all their attributes

var network = {
    nodes: {},
    links: {},
    
    /* Node class: */
    node: function(label, x,y,r,sides,styles){
        network.nodes[label] = this;
        
        var n = sides || 0;
        this.id = label;
        if (!styles){
            var col = Math.random() * 0xffffff;
            this.style = {opacity: 0.5,fill: col,stroke: col,linewidth: r / 50};
        }
        else {this.style = {fill: styles.fill || (Math.random() * 0xffffff)}}
        this.size = r;
        if (n===0){
            this.node =  two.makeCircle(0, 0, r);
        }else{
            this.node =  two.makePolygon(0, 0, r, n);
        }
        this.node.fill = parseColor( this.style.fill );
        this.node.noStroke();
        this.text = two.makeText(label,0,0,{
                size: r / label.length * 3,
                stroke: '#555555', //parseColor(.5*(0xffffff - this.style.fill)),
                fill: 'white'//'#444444' //parseColor(0xffffff - this.style.fill)
        })
        //this.text.noStroke();
        this.text.stroke = parseColor( this.style.fill );
        // this.text.weight = 600;
        this.text.linewidth = .5;
        this.group = two.makeGroup(this.node, this.text);
        this.group.translation.set(x,y);
        flags.links[label] = [];
        
        this.handleEvents = events.nodeEvents;
        this.handleEvents();
        
        this.info = {
            "Nick Name": label,
            "Name": '',
            href: '#',
            skills: 'js'
        }
        
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
        document.getElementById('ls:'+label1).innerHTML = flags.links[label1].length;
        document.getElementById('ls:'+label2).innerHTML = flags.links[label2].length;
        network.nodes[label1].node.scale = 1+ Math.log(flags.links[label1].length);
        network.nodes[label2].node.scale = 1+ Math.log(flags.links[label2].length);
        
        var self = this;
        this.update = function(){
            var p1 = network.nodes[label1].group.translation,
                p2 = network.nodes[label2].group.translation;
            // the line position is its midpoint, the endpoints go in +- dirs
            self.link.translation.set((p1.x+p2.x)/2,(p1.y+p2.y)/2);
            self.link.vertices[0].set((p1.x-p2.x)/2.01,(p1.y-p2.y)/2.01);
            self.link.vertices[1].set(-(p1.x-p2.x)/2.01,-(p1.y-p2.y)/2.01);
            //console.log('moving link center to',self.link.translation.x,self.link.translation.y );
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