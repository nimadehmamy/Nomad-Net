document.mouse = {
    x: 0,
    y: 0
};
document.touch = {
    x: 0,
    y: 0
};
events = {
    getMouse: function(e) {
        document.mouse.x = e.clientX;
        document.mouse.y = e.clientY;
    },

    dragAround: function(id) {

        var elem = document.getElementById(id);
        var loc = elem.getBoundingClientRect();
        elem.newLoc = {
            x: loc.left,
            y: loc.top
        };
        elem.style.left = elem.newLoc.x + "px";
        elem.style.top = elem.newLoc.y + "px";
        elem.draggable = true;

        elem.ondrag = function(e) {
            var curX = parseInt(elem.style.left.slice(0, -2));
            var curY = parseInt(elem.style.top.slice(0, -2));
            console.log('dragging');
            if (e.clientX > 0) {
                var left = (curX + (e.clientX - document.mouse.x)) + "px";
                var top = (curY + (e.clientY - document.mouse.y)) + "px";
                elem.newLoc = {
                    x: left,
                    y: top
                };
            }

        };

        elem.ondragend = function() {
            elem.style.left = elem.newLoc.x;
            elem.style.top = elem.newLoc.y;
        };
        

    },

    nodeEvents: function() {
        var self = this;
        two.update();
        this.docElement = document.getElementById(this.group.id);
        this.docElement.onmouseenter = function() {
            console.log('mouse in');
            // first keep which event this is to be able to remove it after it's done.
            events.resetEvents(self, 1.2);
            //two.bind('update', function(f){smoothPop(self, 1.5);}).play();
        };
        this.docElement.onmouseleave = function() {
            // self.group.scale = 1;
            // two.update();
            console.log('mouse out');
            events.resetEvents(self, 1);
            //two.bind('update', function(f){smoothPop(self, 1);}).play();
        };
        // this.docElement.onmousedown =
        this.docElement.addEventListener('mousedown', onMouseDown, false);
        this.docElement.addEventListener('touchstart', onTouchStart, false);
        this.docElement.addEventListener('touchend', function(e){
            console.log('clack');
            self.node.fill = parseColor(self.style.fill);
            self.node.opacity = 1;
            two.update();
            self.docElement.removeEventListener('touchmove', onTouchMove, false);
        }, false);
        
        self.docElement.onmouseup = function() {
            console.log('clack');
            self.node.fill = parseColor(self.style.fill);
            self.node.opacity = 1;
            two.update();
            self.docElement.removeEventListener('mousemove', onMouseMove, false);
        };
        
        function onTouchStart(event){
            events.getMouse(event.touches[0]);
            self.docElement.addEventListener('touchmove', onTouchMove, false);
        }
        
        function onTouchMove( event ) {
			event.preventDefault();
			event.clientX = event.touches[0].clientX;
			event.clientY = event.touches[0].clientY;
			onMouseMove( event );
		}
        function onMouseDown(event) {
            console.log('click');
            //self.node.fill = '#ffff00';
            self.node.opacity = 0.7;
            two.update();
            self.docElement.addEventListener('mousemove', onMouseMove, false);
            
        }
        function onMouseMove(event) {
            //console.log('mouse at:', event.clientX, event.clientY);
            var x = self.group.translation.x + event.clientX - document.mouse.x ;
            var y = self.group.translation.y + event.clientY - document.mouse.y ;
            document.mouse = {
                x: event.clientX,
                y: event.clientY
            };
            
            self.group.translation.set(x, y);
            var l = flags.links[self.id];
            for (i in l) {
                //console.log(l[i]);
                network.links[l[i]].update();
            }
            two.update();
        }
    },
    
    resetEvents: function(obj,s){
        console.log('check:',obj.group.id,flags.hasEvents[obj.group.id]);
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
            if (two._events.update.length>1){
                flags.hasEvents[obj.group.id] = two._events.update.length;
            }
        }catch(err){
            //flags.hasEvents[obj.group.id] = 1;
        }
        console.log('binding new event for', obj.group.id, flags.hasEvents[obj.group.id]);
        // also keep track of playing event in
        flags.playing.push(obj.group.id);
        two.bind('update', function(f){smoothPop(obj, s);}).play();
    }
};

document.addEventListener('mousedown', events.getMouse,false);
