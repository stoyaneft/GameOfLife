'use strict';

const CommandParser = require('./command_parser');
const fs = require('fs');
const Game = require('./game_engine');
const readLine = require('readline');
let patterns = [];

let game;
const rl = readLine.createInterface(process.stdin,process.stdout);

function createCommandParser() {
    const parser = new CommandParser();
    parser.addCommand('new', newGame)
        .addCommand('cell', newCell)
        .addCommand('show', show)
        .addCommand('clear', clear)
        .addCommand('simulate', simulate)
        .addCommand('load', load)
        .addCommand('list', list)
        .addCommand('help', help)
        .addCommand('close', process.exit);
    return parser;
}

function newGame(size) {
    game = new Game(parseInt(size));
    loadLifeFiles().then((res) => {
        patterns = res;
    });
    show();
}

function newCell(x, y) {
    try {
        game.placeAt(x, y);
    } catch(e) {
        if (e.message === 'CellOutsideBoard') {
            console.log('Cell outside board! Try again!');
        }
    }
}

function show() {
    console.log('Days passed: ' + game.generation);
    const symbols = ['O', '*'];
    const board = game.board;
    const boardStr = board.map(row => {
        row = row.map(cell => symbols[cell]);
        row = row.join(' ');
        return row;
    });
    console.log(boardStr.join('\n'));
}

function help() {
    console.log('Welcome to Game of Life\'s console interface. The available commands are:\n>' +
        '- "new" <size> - starts new game with board of size <size>\n>' +
        '- "cell" <x> <y> - places new alive cell at [x, y]\n>' +
        '- "show" - shows current state of the board\n>' +
        '- "help" - shows list of available commands\n>' +
        '- "clear" - clears game board\n>' +
        '- "simulate" <days> - simulates game state for <days>\n>' +
        '- "load" <pattern> - loads <pattern>\n' +
        '- "list" - lists available patterns\n' +
        '- "close" - closes the game\n>');
}

function clear() {
    game.restart();
}

function simulate(days) {
    game.simulate(days);
    show();
}

function load(pattern) {
    try {
        game.loadPattern(pattern);
        show();
    } catch(e) {
        if(e.message === `No pattern: ${pattern}`) {
            console.log(e.message);
            console.log('Enter "list" to see list of available patterns');
        } else {
            throw e;
        }
    }
}

function list() {
    console.log('Available patterns:');
    patterns.forEach((pattern) => {
        console.log('- ' + pattern);
    })
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
                resolve(patternNames);
            });
        });

    })
}

function prompt(parser) {
    rl.prompt();
    help();

    rl.on('line', line => {
        try {
            parser.execute(line);
        } catch (e) {
            console.log(e.message);
            if (e.message.startsWith('Wrong command')) {
                console.log('Use "help" to see list of available commands');
            } else {
                throw e;
            }
        }
    });
}

function startGame() {
    const parser = createCommandParser();
    prompt(parser);
}

startGame();



