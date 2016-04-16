
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
        this.node.fill = misc.parseColor( this.style.fill );
        this.node.noStroke();
        this.text = two.makeText(label,0,0,{
                size: Math.max(r / label.length * 3, 10),
                stroke: '#555555', //misc.parseColor(.5*(0xffffff - this.style.fill)),
                fill: 'white'//'#444444' //misc.parseColor(0xffffff - this.style.fill)
        })
        //this.text.noStroke();
        this.text.stroke = misc.parseColor( this.style.fill );
        this.text.weight = (this.text.size > 20) ? 500: 500 + 2*500*10/this.text.size;
        this.text.linewidth = this.text.size /100;
        console.log(this.text.weight,this.text.linewidth);
        this.group = two.makeGroup(this.node, this.text);
        this.group.translation.set(x,y);
        this.group.scale0 = this.group.scale;
        flags.links[label] = [];
        
        this.handleEvents = events.nodeEvents;
        this.handleEvents();
        
        this.info = {
            "Nick Name": label,
            "Name": '',
            href: '#'
        }
        
        this.doc =`
        Set the node.info based on the type of node (i.e. people, projects, etc.).
        If an info field is an object, include a 'type' field to specify
        whether it is a check box, text field or another object:
        example:
        this.info['Milestones'] = {
            type: 'checkbox',
            'Node events': 1,
            'project graph': 0
        }
        
        this.info['Notes'] = {
            type: 'text',
            note:
            'These things still need to be done'
        }
        
        this.info['Skills'] = {
            type:'tags',
            tags: {
                javascript: 5,
                python: 7,
                physics: 9,
                biology: 3
            }
        }
        
        ` // end of multiline notes
    },
    
    /* Link class: */
    link: function(label1,label2, styles){
        if (!styles) {
            var col = Math.random() * 0xffffff;
            this.style = {
                opacity: 0.5,
                fill: col,
                stroke: col,
                linewidth: 20
            };
        }
        else {
            this.style = {
                stroke: styles.stroke || (Math.random() * 0xffffff)
            }
        }
        this.id = label1 + ',' + label2;
        this.id2 = label2 + ',' + label1;
        
        if (flags.links[label1].includes(this.id) || flags.links[label1].includes(this.id2)) {
            console.log(this.id, 'exists');
            try{
                network.links[this.id].link.linewidth += def.r / 5;
            }catch(err){
                network.links[this.id2].link.linewidth += def.r / 5;
            }
        }
        else {
            var p1 = network.nodes[label1].group.translation,
                p2 = network.nodes[label2].group.translation;
            this.link = two.makeLine(p1._x, p1._y, p2._x, p2._y);
            this.link.stroke = misc.parseColor(this.style.stroke);
            this.link.linewidth = network.nodes[label1].size / 5;
            
            var self = this;
            this.update = function() {
                var p1 = network.nodes[label1].group.translation,
                    p2 = network.nodes[label2].group.translation;
                // the line position is its midpoint, the endpoints go in +- dirs
                self.link.translation.set((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
                self.link.vertices[0].set((p1.x - p2.x) / 2.01, (p1.y - p2.y) / 2.01);
                self.link.vertices[1].set(-(p1.x - p2.x) / 2.01, -(p1.y - p2.y) / 2.01);
                //console.log('moving link center to',self.link.translation.x,self.link.translation.y );
            };
            this.group = two.makeGroup();
            this.group.add(this.link);
            this.group.add(network.nodes[label1].group);
            this.group.add(network.nodes[label2].group);
            //two.bind('update', function(f){self.update();});
            network.links[this.id] = this;
        }
        flags.links[label1].push(this.id);
        flags.links[label2].push(this.id);
        
        document.getElementById('ls:'+label1).innerHTML = flags.links[label1].length;
        document.getElementById('ls:'+label2).innerHTML = flags.links[label2].length;
        network.nodes[label1].group.scale = 1+ Math.log(flags.links[label1].length);
        network.nodes[label2].group.scale = 1+ Math.log(flags.links[label2].length);
        network.nodes[label1].group.scale0 = 1+ Math.log(flags.links[label1].length);
        network.nodes[label2].group.scale0 = 1+ Math.log(flags.links[label2].length);
        
        two.update();
        
    },
    
    makeLinks:  function(st){
        var ls = misc.splitClean(st,';');
        console.log(ls);
        ls.forEach(function(a){
            var nd = misc.splitClean(a);
            if (nd.length == 2) {
                new network.link(nd[0], nd[1]);
            }
            console.log(nd);
        });
    }
    
}