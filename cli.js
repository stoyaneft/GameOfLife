'use strict';

const CommandParser = require('./command_parser');
const os = require('os');
const loadLifeFiles = require('./helpers');
const Game = require('./game_engine');
const readLine = require('readline');
let patterns = new Map();

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
    console.log(boardStr.join(os.EOL));
}

function help() {
    console.log('Welcome to Game of Life\'s console interface. The available commands are:\n' +
        '- "new" <size> - starts new game with board of size <size>\n' +
        '- "cell" <x> <y> - places new alive cell at [x, y]\n' +
        '- "show" - shows current state of the board\n' +
        '- "help" - shows list of available commands\n' +
        '- "clear" - clears game board\n' +
        '- "simulate" <days> - simulates game state for <days>\n' +
        '- "load" <pattern> - loads <pattern>\n' +
        '- "list" - lists available patterns\n' +
        '- "close" - closes the game\n');
}

function clear() {
    game.restart();
}

function simulate(days) {
    days = parseInt(days);
    game.simulate(days);
    show();
}

function load(patternName) {
    game.restart();
    const args = Array.from(arguments);
    patternName = args.join(' ');
    const patternFile = patterns.get(patternName);
    if (!patternFile) {
        console.log(`No pattern: ${patternName}`);
        console.log('Enter "list" to see list of available patterns');
    } else {
        game.loadPatternFile(patternFile).then(show).catch(console.log);
    }
}

function list() {
    console.log('Available patterns:');
    patterns.forEach((_, name) => {
        console.log('- ' + name);
    })
}

function prompt(parser) {
    rl.message = '>';
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
    loadLifeFiles(__dirname + '/patterns').then((data) => {
        patterns = data;
    });
    const parser = createCommandParser();
    prompt(parser);
}

startGame();

