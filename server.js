const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Game = require('./game_engine');

const game = new Game();

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', onSocketConnection);

function onSocketConnection(client) {
    console.log('client connected');
    client.on('disconnect', onClientDisconnect);
    client.on('newPlayer', onNewPlayer);
    client.on('boardChanged', onBoardChanged);
    this.emit('boardChanged', game.getBoard());
}

function onClientDisconnect() {
    console.log('Player has disconnected');
}

function onNewPlayer() {
    console.log('New player in server');
    this.emit('boardChanged');
}

function onBoardChanged(data) {
    console.log('Board changed');
    this.broadcast.emit('boardChanged', data);
}

server.listen(8000, function(){
    console.log('listening on *:8000');
});