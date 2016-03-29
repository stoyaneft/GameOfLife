'use strict';

class Game {

    constructor(size) {
        this.size = size || 20;
        this._daysPassed = 0;
        this._board = this.getNewBoard();
    }

    restart() {
        this._daysPassed = 0;
        this._board = this.getNewBoard();
    }

    inBoard(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    placeAt(x, y) {
        if (this.inBoard(x, y)) {
            this._board[x][y] = 1;            
        } else {
            throw Error('Cell placed outside board');
        }
        return this;
    }

    getNewBoard() {
        let board = Array.apply(null, new Array(this.size)).map(_ => {
            let row = Array.apply(null, new Array(this.size));
            return row.map(x => 0);
        });
        return board;
    }

    getBoard() {
        return this._board;
    };

    neighboursOf(x, y) {
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

    calcNextState(x, y) {
        const neighCount = this.neighboursOf(x, y);
        let state = 0;
        if (this._board[x][y] === 1) {
            if (neighCount === 2 || neighCount === 3) {
                state = 1;
            }
        } else {
            if (neighCount === 3) {
                state = 1;
            }
        }
        return state;
    }

    calcNextBoard() {
        let nextBoard = this.getNewBoard();
        nextBoard.forEach((row, i) => {
            row.forEach((_, j) => {
                nextBoard[i][j] = this.calcNextState(i, j);
            })
        });
        return nextBoard;
    }
    
    loadShape(name, x, y) {
        const shapes = require('./shapes.json');
        const shape = shapes[name];
        shape.forEach((row, i) => {
           row.forEach((cell, j) => {
               this._board[x+i][y+j] = cell;
           }) ;
        });
    };

    simulate(days) {
        days = days | 1;
        for (let i = 0; i < days; i++) {
            this._board = this.calcNextBoard();
        }
        this._daysPassed += days;
    };
}

module.exports = Game;