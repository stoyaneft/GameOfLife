'use strict';

const fs = require('fs');
const os = require('os');

class Game {

    constructor(size) {
        this._size = size || 20;
        this._generation = 0;
        this._population = 0;
        this._board = this.getNewBoard();
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
            this._population++;
        } else {
            throw Error('CellOutsideBoard');
        }
        return this;
    }

    removeAt(x, y) {
        if (this.inBoard(x, y)) {
            this._board[x][y] = 0;
            this._population--;
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

    static parsePatternName(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    const searched = 'Name:';
                    data = data.toString().split(os.EOL);
                    const nameLine = data.filter((line) => {
                        return line.indexOf(searched) > -1;
                    });
                    const nameIdx = nameLine[0].indexOf(searched);
                    const name = nameLine[0].slice(nameIdx + searched.length + 1);
                    resolve({filename, name});
                }
            });
        });
    }

    loadPatternFile(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    data = data.toString();
                    const lines = data.split(os.EOL).filter((line) => {
                        return line[0] != '#' || line[1] === 'P';
                    });
                    const centerX = Math.floor(this._size / 2), centerY = Math.floor(this._size / 2);
                    let topLeftX = centerX, topLeftY = centerY;
                    lines.forEach((line, i) => {
                        if (line[0] === '#') {
                            const splitLine = line.split(' ');
                            topLeftX = centerX + parseInt(splitLine[1]);
                            topLeftY = centerY + parseInt(splitLine[2]);
                        } else {
                            line = line.split('');
                            line.forEach((char, j) => {
                                const x = topLeftX + i - 1;
                                const y = topLeftY + j;
                                if (this.inBoard(x, y)) {
                                    if (char === '*') {
                                        this._board[x][y] = 1;
                                        this._population++;
                                    } else {
                                        this._board[x][y] = 0;
                                    }
                                } else {
                                    this.restart();
                                    reject('Pattern does not fit board');
                                }
                            })
                        }
                    });
                    resolve();
                }
            });

        });

    }

    simulate(days) {
        days = days || 1;
        for (let i = 0; i < days; i++) {
            if (this._population === 0) {
                return;
            }
            this._board = this._calcNextBoard();
        }
        this._generation += days;
    };
}

module.exports = Game;