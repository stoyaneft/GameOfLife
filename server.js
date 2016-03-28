const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Game = require('./game_engine');

const game = new Game();
const SHAPES = {
    'Glider': 'glider',
    '10 Cell Row': 'tenCellRow',
    'Small Exploder': 'smallExploder'
};
game.loadShape('glider', 1, 1);
app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', onSocketConnection);

function onSocketConnection(client) {
    console.log('client connected');
    client.on('disconnect', onClientDisconnect);
    client.on('newPlayer', onNewPlayer);
    client.on('boardChanged', onBoardChanged);
    client.on('loadShape', onLoadShape);
    client.on('simulate', onSimulate);
    this.emit('boardChanged', game.getBoard());
}

function onClientDisconnect() {
    console.log('Player has disconnected');
}

function onNewPlayer() {
    console.log('New player in server');
    this.emit('boardChanged', game.getBoard());
}

function onBoardChanged(data) {
    console.log('Board changed');
    this.broadcast.emit('boardChanged', data);
}

function onLoadShape(name) {
    game.restart();
    if (name !== 'Clear') {
        game.loadShape(SHAPES[name], game.size/2, game.size/2);
        console.log('Shape ' + name + ' loaded');
        io.emit('boardChanged', game.getBoard());
    }
}

function onSimulate(days) {
    game.simulate(days);
    io.emit('boardChanged', game.getBoard());
}

server.listen(8000, function(){
    console.log('listening on *:8000');
});