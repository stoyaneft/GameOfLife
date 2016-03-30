'use strict';

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Game = require('./game_engine');

const game = new Game(50);
let intID;

game.loadShape('glider', 1, 1);

app.use(express.static('public'));

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', onSocketConnection);

function onSocketConnection(client) {
    console.log('client connected');
    client.on('disconnect', onClientDisconnect);
    client.on('loadShape', onLoadShape);
    client.on('clear', onClear);
    client.on('simulate', onSimulate);
    client.on('cellChanged', onCellChanged);
    client.on('simulationStopped', onSimulationStopped);
    this.emit('boardChanged', game.getBoard());
}

function onClientDisconnect() {
    console.log('Player has disconnected');
}

function onLoadShape(name) {
    game.restart();
    const words = name.split(' ');
    words[0] = words[0].toLowerCase();
    const shape = words.join('');
    console.log(shape);
    game.loadShape(shape, game.size/2, game.size/2);
    console.log('Shape ' + name + ' loaded');
    io.emit('boardChanged', game.getBoard());
}

function onClear() {
    game.restart();
    console.log('board cleared');
    io.emit('boardChanged', game.getBoard());
}

function onSimulate(data) {
    console.log(data);
    if (data.days === 1) {
        game.simulate(data.days);
        io.emit('boardChanged', game.getBoard());
    } else if(data.days > 1) {
        io.emit('simulationStarted');
        intID = setInterval(() => {
            game.simulate(1);
            io.emit('boardChanged', game.getBoard());
            data.days--;
            if (data.days === 0) {
                clearInterval(intID);
                io.emit('simulationFinished');
            }
        }, Math.floor(1000/data.speed));
    }
}

function onCellChanged(data) {
    const x = data.x, y = data.y;
    if (game.inBoard(x, y)) {
        console.log('Cell changed at ' + data.x + ' ' + data.y);
        if (game.isAlive(x, y)) {
            game.removeAt(x, y);
        } else {
            game.placeAt(x, y);
        }
        io.emit('boardChanged', game.getBoard());
    }
}

function onSimulationStopped() {
    clearInterval(intID);
    io.emit('simulationFinished');
}

server.listen(8000, function(){
    console.log('listening on *:8000');
});