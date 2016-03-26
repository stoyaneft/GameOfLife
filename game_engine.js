'use strict';

function Game(size) {
    let daysPassed = 0;
    size = size | 20;
    let board = getNewBoard();

    this.clear = function() {
       board = getNewBoard();
    };

    this.placeAt = function (x, y) {
        board[x][y] = 1;
        return this;
    };
    this.clear();

    function getNewBoard() {
        const row = Array.apply(null, new Array(size)).map(_ => 0);
        return Array.apply(null, new Array(size)).map(_ => row);
    }

    this.getBoard = function () {
        return board;
    };


    function calcNextState(x, y) {
        const DX = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DY = [-1, 0, 1, -1, 1, -1, 0, 1];
        let neighCount = 0;
        for (let i = 0; i < 8; i++) {
            const newX =  x + DX[i];
            const newY = y + DY[i];
            if (newX >= 0 && newX < size &&
                newY >= 0 && newY < size && board[newX][newY] === 1) {
                neighCount++;
            }
        }
        let state = 0;
        if (board[x][y] === 1) {
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

    function calcNextBoard() {
        let nextBoard = getNewBoard();
        nextBoard.forEach((row, i) => {
            row.forEach((_, j) => {
                nextBoard[i][j] = calcNextState(i, j);
            })
        });
        return nextBoard;
    }

    this.simulate = function (days) {
        days = days | 1;
        for (let i = 0; i < days; i++) {
            board = calcNextBoard();
        }
    };
}

let game = new Game();
let board = game.getBoard();
console.log(board);
game.placeAt(3, 4)
    .placeAt(3, 5)
    .placeAt(4, 4);

game.simulate(5);

module.exports = Game;