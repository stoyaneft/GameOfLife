'use strict';

const express = require('express');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Game = require('./game_engine');

const patterns = new Map();

app.use(express.static('public'));


app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', onSocketConnection);

loadLifeFiles().then(() => {
    console.log('Patterns loaded');
});

function loadLifeFiles() {
    return new Promise((resolve, reject) => {
        fs.readdir(__dirname + '/patterns', (err, filenames) => {
            if (err) {
                reject(err);
            }
            const namePromises = [];
            filenames.forEach((filename) => {
                const namePromise = Game.parsePatternName(__dirname + '/patterns/' + filename);
                namePromises.push(namePromise);
        });
            Promise.all(namePromises).then((resPatterns) => {
                resPatterns.forEach((pattern) => {
                    patterns.set(pattern.name, pattern.filename);
                });
                io.emit('patternsLoaded', patterns);
                resolve();
            }, reject);
        });
    })
}

function onSocketConnection(client) {
    const game = new Game(50);
    const state = {
        board: game.board,
        population: game.population,
        generation: game.generation,
        isInProcess: false,
        days: 1,
        speed: 5
    };
    let lastNext = 1;
    let intID;

    function onClientDisconnect() {
        console.log('Client has disconnected');
    }

    function onLoadPattern(name) {
        game.restart();
        game.loadPatternFile(patterns.get(name)).then(() => {
            state.board = game.board;
            state.population = game.population;
            state.generation = game.generation;
            state.selectedPattern = name;
            client.emit('stateChanged', state);
        });
    }

    function onClear() {
        game.restart();
        state.board = game.board;
        state.population = game.population;
        state.generation = game.generation;
        state.isInProcess = false;
        client.emit('stateChanged', state);
    }

    function onSimulate(data) {
        if(state.days > 0) {
            lastNext = data.days;
            state.speed = data.speed;
            state.days = data.days;
            state.isInProcess = true;
            client.emit('simulationStarted');
            intID = setInterval(() => {
                game.simulate(1);
                state.board = game.board;
                state.population = game.population;
                state.generation = game.generation;
                client.emit('stateChanged', state);
                state.days--;
                if (state.days === 0 || state.population === 0) {
                    clearInterval(intID);
                    state.isInProcess = false;
                    state.days = 1;
                    client.emit('simulationFinished', lastNext);
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
            client.emit('stateChanged', state);
        }
    }

    function onSimulationStopped() {
        clearInterval(intID);
        state.isInProcess = false;
        client.emit('simulationFinished', state.days);
    }

    console.log('New client has connected');
    client.on('disconnect', onClientDisconnect);
    client.on('loadPattern', onLoadPattern);
    client.on('clear', onClear);
    client.on('simulate', onSimulate);
    client.on('cellChanged', onCellChanged);
    client.on('simulationStopped', onSimulationStopped);
    client.emit('stateChanged', state);

    if (patterns.size !== 0) {
        client.emit('patternsLoaded', Array.from(patterns.keys()));
    }
}


server.listen(8080, function(){
    console.log('listening on *:8080');
});