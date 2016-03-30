'use strict';

const express = require('express');
const shapes = require('./shapes.json');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Game = require('./game_engine');

const game = new Game(50);
const shapeOptions = Object.getOwnPropertyNames(shapes);
const state = {
    board: game.board,
    population: game.population,
    generation: game.generation,
    isInProcess: false,
    days: 1,
    speed: 5,
    shapeOptions
    };
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
    this.emit('stateChanged', state);
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
    state.board = game.board;
    state.population = game.population;
    state.generation = game.generation;
    io.emit('stateChanged', state);
}

function onClear() {
    game.restart();
    console.log('board cleared');
    state.board = game.board;
    io.emit('stateChanged', state);
}

function onSimulate(data) {
    if(state.days > 0) {
        state.speed = data.speed;
        state.days = data.days;
        state.isInProcess = true;
        console.log(data);
        io.emit('simulationStarted');
        intID = setInterval(() => {
            game.simulate(1);
            state.board = game.board;
            state.population = game.population;
            state.generation = game.generation;
            io.emit('stateChanged', state);
            state.days--;
            if (state.days === 0) {
                clearInterval(intID);
                state.isInProcess = false;
                state.days = 1;
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
        state.board = game.board;
        io.emit('stateChanged', state);
    }
}

function onSimulationStopped() {
    clearInterval(intID);
    state.isInProcess = false;
    io.emit('simulationFinished');
}

server.listen(8000, function(){
    console.log('listening on *:8000');
});