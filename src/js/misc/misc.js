var misc ={
    splitNoSpace: function(l){
        var ls=[];
        l.split(',').forEach(function(a){
            ls.push(a.replace(' ', ''))
        ;});
    },
    
    splitClean: function(l,ch){
        var sep = ch || ',';
        var ls = (sep ==';') ? l.replace(/[\s]*;[\s]*/ig,';') : l.replace(/[\s]*,[\s]*/ig,',') // removes spaces around sep.
        ls = ls.replace(/[\s]+/ig,' ') // replaces multiple spaces with a single space.
        if (ls[0]== ' '){
            ls = ls.slice(1,ls.length);
        }
        if (ls[ls.length-1]== ' '){
            ls = ls.slice(0,ls.length-1);
        }
        
        return (sep ==';') ? ls.split(';') : ls.split(',');
    },
    // to parse colors as strings
    parseColor : function (color, toNumber) {
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
    },
    makeNode: function(where,label, x,y,r,sides,style){
        
        console.log(label);
        new network.node(label, x,y,r,sides, style)
        var node = document.createElement("LI");
        var nodeA = document.createElement("A");
        //nodeA.href = '#';
        node.setAttribute("onclick", "misc.showInfo($(this)[0].childNodes[0].id.slice(2))");//("data-bind", "click: showInfo");
        var textnode = document.createTextNode( label);
        nodeA.appendChild(textnode);
        nodeA.id = "n:"+label;
        node.appendChild(nodeA);    // Append the text to <li>
        var links = document.createElement("SPAN");
        links.id = "ls:"+label;
        links.innerHTML = 0;
        nodeA.appendChild(links);
        document.getElementById(where).appendChild(node);     // Append <li> to <ul>
        document.getElementById("nodeLabel").value = '';
        
    },
    
    showInfo: function(el){
        console.log('info: ', el);
        var node = network.nodes[el];//.id.slice(2)];
        misc.infoNode = el;//.id.slice(2); //save node label;
        
        $('#info')[0].innerHTML = ''
        var s = '';//'<div style="width:90%; display:table">';
        console.log('here');
        for (var i in node.info){ // style="background-color:green"
            if (node.info[i].form){
                s += '<tr><td>'+i+':</td><td><button type="submit" style="background-color:blue;">'+'Open'+'</button></td></tr>';
            }
            else{
                s += '<tr><td>' + i + ':</td><td><input id="i:' + i +
                '" value="' + node.info[i] + //data-bind="value: infoValue"
                '"/><button type="submit" style="width:0;padding:0;"></button></td></tr>';
            }
        }
        $('#info')[0].innerHTML = s;
        //console.log(s);
    },
    
    sum: function(ls){
        var s = 0;
        for (var i in ls) {
            s += ls[i];
        }
        return s;
    },
    
    infoNode: '',
    
    physics: new function(){
        this.force = function(v,weights){
            `Takes a distance vector and assigns a force vector`
            q = weights || [10,10];
            var mag = 1.0*q[0]*q[1]/(0.1+v.length());
            //console.log(mag,v.length());
            var f = v;
            return f.multiplyScalar(mag/v.length());
        }
    }
    
}
