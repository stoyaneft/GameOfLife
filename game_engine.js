'use strict';

const shapes = require('./shapes.json');
const fs = require('fs');

class Game {

    constructor(size) {
        this._size = size || 20;
        this._generation = 0;
        this._population = 0;
        this._board = this.getNewBoard();
        this._patterns = new Map();
    }

    get size() {
        return this._size;
    }

    get generation() {
        return this._generation;
    }

    get population() {
        return this._population;
    }

    get board() {
        return this._board;
    };

    restart() {
        this._generation = 0;
        this._population = 0;
        this._board = this.getNewBoard();
    }

    inBoard(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    placeAt(x, y) {
        if (this.inBoard(x, y)) {
            this._board[x][y] = 1;
        } else {
            throw Error('CellOutsideBoard');
        }
        return this;
    }

    removeAt(x, y) {
        if (this.inBoard(x, y)) {
            this._board[x][y] = 0;
        } else {
            throw Error('CellOutsideBoard');
        }
        return this;
    }

    isAlive(x, y) {
        if (this.inBoard(x, y)) {
            return this._board[x][y];
        } else {
            throw Error('CellOutsideBoard');
        }
    }

    getNewBoard() {
        let board = Array.apply(null, new Array(this.size)).map(_ => {
            let row = Array.apply(null, new Array(this.size));
            return row.map(x => 0);
        });
        return board;
    }

    getNeighboursOf(x, y) {
        const DX = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DY = [-1, 0, 1, -1, 1, -1, 0, 1];
        let neighCount = 0;
        for (let i = 0; i < 8; i++) {
            const newX = x + DX[i];
            const newY = y + DY[i];
            if (this.inBoard(newX, newY) && this._board[newX][newY] === 1) {
                neighCount++;
            }
        }
        return neighCount;
    }

    _calcNextState(x, y) {
        const neighCount = this.getNeighboursOf(x, y);
        let state = 0;
        if (this._board[x][y] === 1) {
            if (neighCount === 2 || neighCount === 3) {
                state = 1;
            } else {
                this._population--;
            }
        } else {
            if (neighCount === 3) {
                state = 1;
                this._population++;
            }
        }
        return state;
    }

    _calcNextBoard() {
        if (this._population === 0) {
            return this._board;
        }
        let nextBoard = this.getNewBoard();
        nextBoard.forEach((row, i) => {
            row.forEach((_, j) => {
                nextBoard[i][j] = this._calcNextState(i, j);
            })
        });
        return nextBoard;
    }

    loadPattern(name) {
        this.restart();
        const pattern = this._patterns.get(name);
        const topLeftX = pattern.topLeft[0];
        const topLeftY = pattern.topLeft[1];
        const board = pattern.board;
        board.forEach((row, i) => {
            row.forEach((cell, j) => {
                this._board[topLeftX + i][topLeftY + j] = cell;
                if (cell) {
                    this._population++;
                }
            });
        });
        console.log('Pattern ' + name);
    };

    loadPatternFile(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    let board = [], topLeft, name;
                    data = data.toString();
                    const lines = data.split('\r\n').filter((line) => {
                        return line[0] != '#' || line[1] === 'P' || line.indexOf('Name:') > -1;
                    });
                    const centerX = this._size / 2, centerY = this._size / 2;
                    let topLeftX = centerX, topLeftY = centerY;
                    lines.forEach((line) => {
                        const row = [];
                        if (line[0] === '#') {
                            const splitLine = line.split(' ');
                            if (line[1] === 'P') {
                                topLeftX = centerX + parseInt(splitLine[2]);
                                topLeftY = centerY + parseInt(splitLine[1]);
                                topLeft = [topLeftX, topLeftY];
                            } else {
                                const idx = line.indexOf('Name:');
                                name = line.slice(idx + 6);
                            }
                        } else {
                            line = line.split('');
                            line.forEach((char) => {
                                if (char === '*') {
                                    row.push(1);
                                } else {
                                    row.push(0);
                                }
                            })
                        }
                        board.push(row);
                    });
                    this._patterns.set(name, {board, topLeft});
                    resolve(name);
                }
            })
        });

    }

    simulate(days) {
        if (this._population === 0) {
            return;
        }
        days = days | 1;
        for (let i = 0; i < days; i++) {
            this._board = this._calcNextBoard();
        }
        this._generation += days;
    };
}


var game = new Game(20);
// game.loadPatternFile('./patterns/glider.lif').then((res) => {
//     console.log(res);
//     console.log(game._patterns);
//     game.loadPattern('Glider');
//     console.log(game.board)
// });

module.exports = Game;