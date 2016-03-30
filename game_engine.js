'use strict';

const shapes = require('./shapes.json');

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
            const newX =  x + DX[i];
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
        let nextBoard = this.getNewBoard();
        nextBoard.forEach((row, i) => {
            row.forEach((_, j) => {
                nextBoard[i][j] = this._calcNextState(i, j);
            })
        });
        return nextBoard;
    }
    
    loadShape(name, x, y) {
        const shape = shapes[name];
        shape.forEach((row, i) => {
           row.forEach((cell, j) => {
               this._board[x+i][y+j] = cell;
               if (cell) {
                   this._population++;
               }
           }) ;
        });
    };

    simulate(days) {
        days = days | 1;
        for (let i = 0; i < days; i++) {
            this._board = this._calcNextBoard();
        }
        this._generation += days;
    };
}

module.exports = Game;