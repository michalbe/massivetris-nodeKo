 //IE fix Array.indeOf
 if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    };
}


// Main Variables
var xFields = 40, //width
    yFields = 20, //height
    fieldSize = 20,
    fields =[],
    start=false,
    pointsDiv = document.getElementById('points'),
    container = document.getElementById('container'),
    //construction Vars
    table = document.createElement('table'),
    tbody = document.createElement('tbody');

container.appendChild(table); 
table.appendChild(tbody);

for( var y = 0; y < yFields; y++ ) { //'draw' rows
    var row = document.createElement('tr');
    fields[y] = [];
    tbody.appendChild(row);
    for( var x = 0; x < xFields; x++ ) { //and cols
        var field = document.createElement('td');
        field.width = fieldSize;
        field.height = fieldSize;
        field.id = x+"_"+y;
        fields[y][x] = field;
        //field.innerHTML="<img src='/shapes/fill.gif'/>";
        row.appendChild(field);
    }
}

var redrawBoard = function(board) {
    for( var y = 0; y < yFields; y++ ) { //'draw' rows
        for( var x = 0; x < xFields; x++ ) { //and cols
            
            fields[y][x].className = board[y][x];
        }
    }
}


var addUsers = function(users, avatars) {
    var text = 'Online players: ';
    //console.log(users, avatars);
    for (var user in users) {
        text += '<img style="margin-right:5px;" src="/shapes/'+avatars[user].slice(5)+'.png" />'+users[user]+' ';
    }
    document.getElementById('users').innerHTML = text;
}
///////////////////////////
// creating socket stuff based on socket.io & socket.io-node
io.setPath('/socketIO/');

var socket = new io.Socket(null, {port: 80});
      socket.connect();
      socket.on('message', function(obj){

        redrawBoard(obj.board);
        if (obj.users ) {
            //console.log(obj);
            addUsers(obj.users, obj.avatars);
        }
        pointsDiv.innerHTML = obj.points;
      });      


//keys

document.onkeypress = function (e){
    if (start) {
        var evtobj=window.event? event : e,
            unicode=evtobj.charCode? evtobj.charCode : evtobj.keyCode;
        socket.send(unicode);
    }
}

var LoginIn = function() {
    var message = {avatar:choosenOne, login:document.getElementById('name').value}
    socket.send(message);
    document.getElementById('login').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    start=true;
}
        