'use strict';

let chai = require('chai');
let expect = chai.expect;
let Game = require('../game_engine');


describe('Game', () => {
    let game;

    beforeEach(next => {
        game = new Game();
        next();
    });

    describe('#placeAt(x, y)', () => {
        it('should place a living cell at [x, y]', () => {
            game.placeAt(3, 4);
            const board = game.board;
            const expected = game.getNewBoard();
            expected[3][4] = 1;
            expect(board).to.eql(expected);
            expect(game.placeAt).to.throw(Error);
        });
    });

    describe('#inBoard(x, y)', () => {
       it('should check if cell is in board', () => {
           expect(game.inBoard(-1, 0)).to.not.be.true;
           expect(game.inBoard(game.size-1, game.size)).to.not.be.true;
           expect(game.inBoard(game.size-1, game.size-1)).to.be.true;
       })
    });

    describe('#getNeighboursOf(x, y)', () => {
        it('should calculate neighbours of cell [x, y]', () => {
            game.loadShape('smallExploder', 0, 0);
            const n1 = game.getNeighboursOf(0, 0);
            expect(n1).to.equal(3);
            const n2 = game.getNeighboursOf(1, 1);
            expect(n2).to.equal(5);
            const n3 = game.getNeighboursOf(game.size -1 , game.size-1);
            expect(n3).to.equal(0);
        })
    });

    describe('#_calcNextState(x, y)', () => {
        it('should calculate next state for cell [x, y]', () => {
            const x = game.size/2, y = game.size / 2 - 5;
            game.loadShape('tenCellRow', x, y);
            const first = game._calcNextState(x, y);
            const second = game._calcNextState(x, y + 1);
            expect(first).to.equal(0);
            expect(second).to.equal(1);
        })
    });

    describe('#_calcNextBoard()', () => {
        it('should calculate board state after one day', () => {
            const x = game.size/2, y = game.size / 2 - 5;
            game.loadShape('tenCellRow', x, y);

            const nextBoard = game._calcNextBoard();
            let expectedBoard = game.getNewBoard();
            expectedBoard.forEach((row, i) => {
                row.forEach((cell, j) => {
                    if (i >= x - 1 && i <= x + 1 && j >= y + 1 && j <= y + 8)
                        expectedBoard[i][j] = 1;
                });
            });
            expect(expectedBoard).to.eql(nextBoard);
        });
    });

    describe('#simulate()', () => {
       it('should simulate board state after several days', () => {
           const x = game.size/2, y = game.size / 2 - 5;
           game.loadShape('tenCellRow', x, y);
           game.simulate(61);
           let expectedBoard = game.getNewBoard();
           expectedBoard.forEach((row, i) => {
               row.forEach((cell, j) => {
                   if (i >= x - 1 && i <= x + 1 && j >= y + 1 && j <= y + 8)
                       expectedBoard[i][j] = 1;
               });
           });
           expectedBoard[x][y+2] = 0;
           expectedBoard[x][y+7] = 0;
           expect(game.board).to.eql(expectedBoard);
           expect(game.generation).to.equal(61);
           expect(game.population).to.equal(22);
       });
    });
});
