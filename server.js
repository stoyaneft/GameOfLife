const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Game = require('./game_engine');

const game = new Game(50);
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
    client.on('loadShape', onLoadShape);
    client.on('simulate', onSimulate);
    client.on('newCell', onNewCell);
    this.emit('boardChanged', game.getBoard());
}

function onClientDisconnect() {
    console.log('Player has disconnected');
}

function onNewPlayer() {
    console.log('New player in server');
    this.emit('boardChanged', game.getBoard());
}

function onLoadShape(name) {
    game.restart();
    if (name !== 'Clear') {
        game.loadShape(SHAPES[name], game.size/2, game.size/2);
        console.log('Shape ' + name + ' loaded');
    }
    io.emit('boardChanged', game.getBoard());
}

function onSimulate(data) {
    console.log(data);
    if (data.days === 1) {
        game.simulate(data.days);
        io.emit('boardChanged', game.getBoard());
    } else if(data.days > 1) {
        const intId = setInterval(() => {
            game.simulate(1);
            io.emit('boardChanged', game.getBoard());
            data.days--;
            if (data.days === 0) {
                clearInterval(intId);
            }
        }, Math.floor(1000/data.speed));
    }
}

function onNewCell(data) {
    const x = data.x, y = data.y;
    console.log('New cell at ' + data.x + ' ' + data.y);
    if (game.isAlive(x, y)) {
        game.removeAt(x, y);
    } else {
        game.placeAt(x, y);
    }
    io.emit('boardChanged', game.getBoard());
}

server.listen(8000, function(){
    console.log('listening on *:8000');
});