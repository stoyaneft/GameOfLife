'use strict';

const CommandParser = require('./command_parser');
const Game = require('./game_engine');
const readLine = require('readline');

let game;
const rl = readLine.createInterface(process.stdin,process.stdout);

function createCommandParser() {
    const parser = new CommandParser();
    parser.addCommand('new', newGame)
        .addCommand('cell', newCell)
        .addCommand('show', show)
        .addCommand('help', help)
        .addCommand('clear', clear)
        .addCommand('simulate', simulate)
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
    console.log('Days passed: ' + game._daysPassed);
    const symbols = ['O', '*'];
    const board = game.getBoard();
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
        '- "simulate" <days> - simulates game stete for <days>\n>' +
        '- "close" - closes the game\n>');
}

function clear() {
    game.restart();
}

function simulate(days) {
    game.simulate(days);
    show();
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



