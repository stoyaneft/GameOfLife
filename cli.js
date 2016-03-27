'use strict';

const CommandParser = require('./command_parser');
const Game = require('./game_engine');
const readline = require('readline');

let game;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function createCommandParser() {
    const parser = new CommandParser();
    parser.addCommand('new_game', newGame)
        .addCommand('new_cell', newCell)
        .addCommand('show', show)
        .addCommand('help', help)
        .addCommand('clear', clear)
        .addCommand('simulate', simulate);
    return parser;
}

function newGame(size) {
    game = new Game(parseInt(size));
    show();
}

function newCell(x, y) {
    game.placeAt(x, y);
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
    console.log('Welcome to Game of Life\'s console interface. The available commands are:\n' +
        '- "new_game" <size> - starts new game with board of size <size>\n' +
        '- "new_cell" <x> <y> - places new alive cell at [x, y]\n' +
        '- "show_board" - shows current state of the board\n' +
        '- "help" - shows list of available commands\n' +
        '- "clear" - clears game board\n');
}

function clear() {
    game.clear();
}

function simulate(days) {
    game.simulate(days);
}


function prompt(parser) {
    rl.setPrompt('>');
    rl.prompt();
    help();

    rl.on('line', line => {
        try {
            parser.execute(line);
        } catch(e) {
            console.log('Wrong command! Use "help" to see list of available commands');
        }


    });
    // rl.question('Welcome to Game of Life\'s console interface. The available commands are:\n' +
    //     '- "new_game" <size> - starts new game with board of size <size>\n' +
    //     '- "new_cell" <x> <y> - places new alive cell at [x, y]\n' +
    //     '- "show_board" - shows current state of the board', (command) => {
    //
    //     rl.pause();
    // });

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



