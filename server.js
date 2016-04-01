'use strict';

const express = require('express');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Game = require('./game_engine');
let patterns = [];
let lastNext = 1;

const game = new Game(50);
const state = {
    board: game.board,
    population: game.population,
    generation: game.generation,
    isInProcess: false,
    days: 1,
    speed: 5
    };
let intID;

app.use(express.static('public'));

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/public/index.html');
});


io.on('connection', onSocketConnection);

loadLifeFiles();

function onSocketConnection(client) {
    console.log('new client has connected');
    client.on('disconnect', onClientDisconnect);
    client.on('loadPattern', onLoadPattern);
    client.on('clear', onClear);
    client.on('simulate', onSimulate);
    client.on('cellChanged', onCellChanged);
    client.on('simulationStopped', onSimulationStopped);
    client.emit('stateChanged', state);
    if (patterns.length !== 0)
        client.emit('patternsLoaded', patterns);
}

function onClientDisconnect() {
    console.log('Player has disconnected');
}

function onLoadPattern(name) {
    game.restart();
    game.loadPattern(name);
    state.board = game.board;
    state.population = game.population;
    state.generation = game.generation;
    state.selectedPattern = name;
    io.emit('stateChanged', state);
}

function onClear() {
    game.restart();
    state.board = game.board;
    state.population = game.population;
    state.generation = game.generation;
    state.isInProcess = false;
    io.emit('stateChanged', state);
}

function onSimulate(data) {
    if(state.days > 0) {
        lastNext = data.days;
        state.speed = data.speed;
        state.days = data.days;
        state.isInProcess = true;
        io.emit('simulationStarted');
        intID = setInterval(() => {
            game.simulate(1);
            state.board = game.board;
            state.population = game.population;
            state.generation = game.generation;
            io.emit('stateChanged', state);
            state.days--;
            if (state.days === 0 || state.population === 0) {
                clearInterval(intID);
                state.isInProcess = false;
                state.days = 1;
                io.emit('simulationFinished', lastNext);
            }
        }, Math.floor(1000/data.speed));
    }
}

function onCellChanged(data) {
    const x = data.x, y = data.y;
    if (game.inBoard(x, y)) {
        if (game.isAlive(x, y)) {
            game.removeAt(x, y);
        } else {
            game.placeAt(x, y);
        }
        state.board = game.board;
        state.generation = game.generation;
        state.population = game.population;
        state.inProcess = false;
        state.days = lastNext;
        io.emit('stateChanged', state);
    }
}

function onSimulationStopped() {
    clearInterval(intID);
    state.isInProcess = false;
    io.emit('simulationFinished', state.days);
}

function loadLifeFiles() {
    return new Promise((resolve, reject) => {
        fs.readdir(__dirname + '/patterns', (err, filenames) => {
            if (err) {
                reject(err);
            }
            const filePromises = [];
            filenames.forEach((filename) => {
                const pattern = game.loadPatternFile('patterns/' + filename);
                filePromises.push(pattern);
            });
            Promise.all(filePromises).then(patternNames => {
                patterns = patternNames;
                io.emit('patternsLoaded', patterns);
            });
        });
    })
}

server.listen(8080, function(){
    console.log('listening on *:8080');
});