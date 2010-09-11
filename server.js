var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('./socketLib'),
		sys = require('sys'),
		
send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
},
		
server = http.createServer(function(req, res){
	// your normal server code
	var path = url.parse(req.url).pathname;
	switch (path){
		case '/':
				res.writeHead(200, {'Content-Type': 'text/html'});
				fs.readFile(__dirname + '/index.html', 'utf8', function(err, data){
				if (!err) res.write(data, 'utf8');
						res.end();
				});

			break;
			
		default:
			if (/\.(js|html|swf|css|jpg|gif|png)$/.test(path)){
				try {
                    var contentType='',
                        encoding='binary';
                    switch (path.substr(path.lastIndexOf('.')-path.length)) {
                        case '.swf': //here comes da FlashFileeeeee
                            contentType = 'application/x-shockwave-flash'; 
                            
                        break;
                        case '.js':
                            contentType = 'text/javascript';
                            encoding='utf8';
                        break;
                        case '.html':
                            contentType = 'text/html';
                            encoding='utf8';
                        break;
                        case '.css':
                            contentType = 'text/css';
                            encoding='utf8';
                        break;
                        case '.jpg':
                            contentType = "image/jpeg";
                        break;
                        case '.gif':
                            contentType = "image/gif";
                        break;
                        case '.png':
                            contentType = "image/png";
                        break;                        
                    }

					res.writeHead(200, {'Content-Type': contentType});
					fs.readFile(__dirname + path, encoding, function(err, data){
						if (!err) res.write(data, encoding);
						res.end();
					});
				} catch(e){ 
					send404(res); 
				}
				break;
			}
		
			send404(res);
			break;
	}
});

server.listen(80);
		
// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server);
      

/////////////////////////
// GAME LOGIC

var Equals=function(b,c){if(!b||!c)return false;if(b.length==c.length){for(var a=0;a<b.length;a++)if(typeof b[a]=="object"){if(!Equals(b[a],c[a]))return false}else if(b[a]!=c[a])return false;return true}else return false};

var speed=500,
    schema = {},
    users={},
    blockClass = {},
    tempCoords={},
    points=0,
    //loggedUsers = {},
    activeBlock = {},
    timeouts={},
    board=[],
    xBoard = 40, //width
    yBoard = 20, //height
    blocks = []; 
//blocks shapes
    blocks.push([[1, 1, 1, 1], [0,0,0,0], [0,0,0,0], [0,0,0,0]]); // I-block
    blocks.push([[1, 1, 1], [0, 1, 0], [0,0,0] ]); // T-block
    blocks.push([[1, 1],[1, 1]]); //O-block
    blocks.push([[1, 1, 1],[1, 0, 0], [0,0,0]]); //L-block
    blocks.push([[1, 1, 1],[0, 0, 1], [0,0,0]]); //J-block
    blocks.push([[0, 1, 1],[1, 1, 0], [0,0,0]]); //S-block
    blocks.push([[1, 1, 0],[0, 1, 1], [0,0,0]]); //Z-block
    
//clearing the board
var clearBoard = function() {
    for( var y = 0; y < yBoard; y++ ) {
        
        board[y] = [];
        
        for( var x = 0; x < xBoard; x++ ) {
            board[y][x]='';
        }
    }
}
clearBoard();

var showBlock = function(blockNumber, clientSessionId) {
//funkcja pokazujaca klocek o danym numerze
    var block = blocks[blockNumber],
        wspX = board[0].indexOf(''), 
        wspY = 0, i, z;
    
    if (wspX === -1) {
        //stanGry=0;
        //clearInterval(petlaGry);
         
        //GameOver
     } else {
        for ( i = 0; i < block.length; i++ ) {
            for ( z=0; z<block[i].length; z++) {
                if (block[i][z] == 1) {
                    var newY = wspY+i, newX = wspX+z;
                    board[newY][newX] = blockClass[clientSessionId];
                    activeBlock[clientSessionId].push([newY, newX]);
                    tempCoords[clientSessionId].push(newY+"_"+newX);
                }
                
            }
        }
        schema[clientSessionId] = block;
    }
};
 
var checkLine = function() {
     
    for( var y = 0; y < yBoard; y++ ) {
        if (board[0].indexOf('')==-1) {
            clearBoard();
            points = 0;
        }
        var isLine = 0;
        for( var x = 0; x < xBoard; x++ ) { 
            if (board[y][x]!=''){
                isLine=1;
            } else {
                isLine=0;
                break;
            }
        }
        if (isLine) {
            points+=10;
            //ZwiekszLinie(); //TU MODYFIKANDO
            for( x = 0; x < xBoard; x++ ) { 
                board[y][x]='';
            }
            for(vy = y; y >= 0; y--) {
                
                for(x = 0; x < xBoard; x++ ) { 
                    
                    if (board[y][x]!=''){
                        
                        board[y+1][x] = board[y][x];
                        board[y][x]='';
                    }
                }
            }
            //SprawdzLinie();
        }
    }
};

var lowerBlock = function(clientSessionId) {
    
    if (!activeBlock[clientSessionId]) 
        showBlock(~~(Math.random()*blocks.length), clientSessionId);
        
    var i=activeBlock[clientSessionId].length,
        insideActive,
        movePossible = true;  //is it possible to move down?  
    while (i--) {
        var targetCoordsY = activeBlock[clientSessionId][i][0]+1,
            targetCoordsX = activeBlock[clientSessionId][i][1];     
        if ((targetCoordsY<yBoard) && (board[targetCoordsY][targetCoordsX]==='')) {    
        } else {
            insideActive=false;
            for (user in tempCoords) {
                if (tempCoords[user].indexOf(targetCoordsY+"_"+targetCoordsX) != -1) {
                    insideActive=true;
                }
            }
            if (insideActive) {
            } else {
                movePossible = false;
                activeBlock[clientSessionId]=[];
                tempCoords[clientSessionId]=[];
                checkLine();
                showBlock(~~(Math.random()*blocks.length), clientSessionId);
                points++;
                
                //add points and check the line
                break;
            }  
        }
        
    }   
    if (movePossible) {
        tempCoords[clientSessionId] = [];
        i=activeBlock[clientSessionId].length;
        while (i--) {
            var targetCoordsY = activeBlock[clientSessionId][i][0]+1,
                targetCoordsX = activeBlock[clientSessionId][i][1]; 

                //board[targetCoordsY][targetCoordsX] = board[activeBlock[clientSessionId][i][0]][targetCoordsX];
                board[targetCoordsY][targetCoordsX] = blockClass[clientSessionId];
                board[activeBlock[clientSessionId][i][0]][targetCoordsX]='';
                activeBlock[clientSessionId][i] = [targetCoordsY, targetCoordsX];
                tempCoords[clientSessionId].push(targetCoordsY+"_"+targetCoordsX);      
        }
    }
};


var moveBlock = function(side, clientSessionId) {
    var size = activeBlock[clientSessionId].length,
        i=size;
    if (side=="l") {
        var possible=true, newX;
        for (var i=0; i<size; i++) {
            newX=activeBlock[clientSessionId][i][1]-1;
            if (newX < 0) {
                possible=false;
                break;
            }
            if (board[activeBlock[clientSessionId][i][0]][newX]!="" && (tempCoords[clientSessionId].indexOf(activeBlock[clientSessionId][i][0]+"_"+newX)==-1)) {
                possible=false;
                break;            
            }
        }
        if (possible) {
            while (i--) {
                //cleaning old block
                board[activeBlock[clientSessionId][i][0]][activeBlock[clientSessionId][i][1]] = '';
            }
            for (var i=0; i<size; i++) {
                newX=activeBlock[clientSessionId][i][1]-1;
                activeBlock[clientSessionId][i]=[activeBlock[clientSessionId][i][0], newX];
                tempCoords[clientSessionId][i] = activeBlock[clientSessionId][i][0]+"_"+newX;
                
                board[activeBlock[clientSessionId][i][0]][activeBlock[clientSessionId][i][1]] = blockClass[clientSessionId];
            }
        }
    }
    if (side=="r") {
        var possible=true, newX;
        for (var i=0; i<size; i++) {
            newX=activeBlock[clientSessionId][i][1]+1;
            if (newX > xBoard-1) {
                possible=false;
                break;
            }
            if (board[activeBlock[clientSessionId][i][0]][newX]!="" && (tempCoords[clientSessionId].indexOf(activeBlock[clientSessionId][i][0]+"_"+newX)==-1)) {
                possible=false;
                break;            
            }
        }
        if (possible) {
            while (i--) {
                //cleaning old block
                board[activeBlock[clientSessionId][i][0]][activeBlock[clientSessionId][i][1]] = '';
            }
    
            for (var i=0; i<size; i++) {
                newX=activeBlock[clientSessionId][i][1]+1;
                activeBlock[clientSessionId][i]=[activeBlock[clientSessionId][i][0], newX];
                tempCoords[clientSessionId][i] = activeBlock[clientSessionId][i][0]+"_"+newX;
                board[activeBlock[clientSessionId][i][0]][activeBlock[clientSessionId][i][1]] = blockClass[clientSessionId];
            }
        }
    }
}


var rotateBlock= function(clientSessionId) {  
      
    var temp=[],  
        size = schema[clientSessionId].length;
    
    //inicjujemy j¹ zerami
    for (var i=0; i<size; i++) {
        temp[i]=[];
        for (var j=0; j<size; j++) {
            temp[i][j]=0;
        }
    } 

    for(i=0; i<size; i++) {
        
        for(var j=0; j<size; j++){
            //odwracamy
            temp[(size-1)-j][i]=schema[clientSessionId][i][j]; 
        }
    }
    
    var full = 0;
    for(i=0; i<size; i++) {
        if (temp[0][i]==1) {
            full=1;
            //break;
        }
    }
    if (!full) {
        temp.push(temp.shift());
    }

    full=0;

    for(i=0; i<size; i++) {
        if (temp[i][0]==1) {
            full=1;
            //break;
        }
    }
    if (!full) {
        for(i=0; i<size; i++) {
            temp[i].push(temp[i].shift());
        }
        
    }
        
    var possible = true;
    
    for ( var i = 0, j=temp.length; i < j; i++ ) {
        for (var z=0, v =temp[i].length; z<v; z++) {
            if (temp[i][z] == 1) {
            var x = (activeBlock[clientSessionId][0][1])+z, y=(activeBlock[clientSessionId][0][0])+i;
                if ((x > xBoard-1) || (y > yBoard-1) || ((board[y][x]!="") && (tempCoords[clientSessionId].indexOf(y+"_"+x)==-1))){
                    
                    possible=false;
                    break;
                
                }
            }
        }
    }
    
    if(possible) {
        //wyrownywanie klocka po obrocie do punktu 0-0 w schematKlocka

        
        //czyscimy stary klocek
        i=activeBlock[clientSessionId].length;
        while (i--) {
            board[activeBlock[clientSessionId][i][0]][activeBlock[clientSessionId][i][1]] = '';
        }
        
        //rysujemy nowy
        var newY = activeBlock[clientSessionId][0][0], newX = activeBlock[clientSessionId][0][1];
        activeBlock[clientSessionId] = [];
        tempCoords[clientSessionId]=[];
        for ( var i = 0, j=temp.length; i < j; i++ ) {
            for (var z=0, v =temp[i].length; z<v; z++) {
                if (temp[i][z] == 1) {
                    var newerX = newX+z, newerY=newY+i;
                    
                    board[newerY][newerX] = blockClass[clientSessionId];
                    activeBlock[clientSessionId].push([newerY, newerX]);
                    tempCoords[clientSessionId].push(newerY+"_"+newerX); 
                    
                }
                
            }
        }
        schema[clientSessionId] = temp;
    }
};


io.on('connection', function(client){
	//client.broadcast({ announcement: client.sessionId + ' connected' });
    var message = { board: board, points: points };
    
    //delete that:
    client.send(message);
    client.broadcast(message);
            
	client.on('message', function(message){
        var comm=''
        if (message.avatar) {
            //first connection
            activeBlock[client.sessionId] = [];
            tempCoords[client.sessionId] = [];
            users[client.sessionId] = message.login || client.sessionId.slice(-10);
            schema[client.sessionId] = [];
            blockClass[client.sessionId] = 'style'+message.avatar;
            showBlock(~~(Math.random()*blocks.length), client.sessionId);
            
            (function(){
            //Main game loop
                var message = { board: board, points: points, users:users, avatars:blockClass };
                lowerBlock(client.sessionId);
                client.send(message);
                client.broadcast(message);
                timeouts[client.sessionId] = setTimeout(arguments.callee, 800);
            })();
        } else {
            if (message==38 || message==119) {//up
                rotateBlock(client.sessionId);
            } else if (message==37 || message==97) { //left
                moveBlock("l", client.sessionId);
            } else if (message==39 || message==100) { //right
                moveBlock("r", client.sessionId);
            } else if (message==40 || message==115) { //down
                lowerBlock(client.sessionId);
            }
        }
        
		var message = { board: board, points: points};
		
            client.send(message);
            client.broadcast(message);
        
		
	});
    
	client.on('disconnect', function(){
        clearTimeout(timeouts[client.sessionId]);
        for (var i=0, aB=activeBlock[client.sessionId].length;i<aB;i++) {
            board[activeBlock[client.sessionId][i][0]][activeBlock[client.sessionId][i][1]]='';
        }
        delete activeBlock[client.sessionId];
        delete tempCoords[client.sessionId];
        delete schema[client.sessionId];
        delete users[client.sessionId];
        delete blockClass[client.sessionId];
        var message = { board: board, points: points, users:users, avatars:blockClass };
        client.broadcast(message);       
        //clearBoard();
		//client.broadcast({ announcement: client.sessionId + ' disconnected' });
	});
});