'use strict';

const CommandParser = require('./command_parser');
const Game = require('./game_engine');
const readline = require('readline');

let game;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>',
    preserveCursor: true
});

function createCommandParser() {
    const parser = new CommandParser();
    parser.addCommand('new_game', newGame);
    console.log(parser.commands);
    return parser;
}

function newGame(size) {
    game = new Game(parseInt(size));
    const board = game.getBoard();
    printBoard();
}

function printBoard() {
    const symbols = ['O', '*'];
    const board = game.getBoard();
    const boardStr = board.map(row => {
        row = row.map(cell => symbols[cell]);
        row = row.join(' ');
        return row;
    });
    console.log(boardStr.join('\n'));
}

function prompt(parser) {
    rl.question('Welcome to Game of Life\'s console interface. The available commands are:\n' +
        '- "new_game" <size> - starts new game with board of size <size>', (command) => {
        parser.execute(command);
    });

    // catch(e) {
    //     console.log('Wrong command!');
    //     prompt();
    // }
}

function startGame() {
    const parser = createCommandParser();
    prompt(parser);
}

startGame();



