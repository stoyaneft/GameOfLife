'use strict';

let chai = require('chai');
let expect = chai.expect;
let Game = require('../game_engine');
let fs = require('fs');


describe('Game', () => {
    let game;
    const dir = __dirname + '/../patterns/';

    beforeEach(next => {
        game = new Game();
        next();
    });

    describe('#restart()', () => {
       it('should restart game', () => {
           const filePromise = game.loadPatternFile(dir + 'glider.lif');
           return filePromise.then(() => {
               game.restart();
               const emptyBoard = game.getNewBoard();
               expect(game.board).to.eql(emptyBoard)
           });
       });
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

    describe('#removeAt(s, y', () => {
        it('should remove a living cell from [x, y]', () => {
            game.placeAt(0, 0);
            game.removeAt(0, 0);
            const board = game.board;
            const expected = game.getNewBoard();
            expect(board).to.eql(expected);
            expect(game.removeAt).to.throw(Error);
        });
    });

    describe('#inBoard(x, y)', () => {
       it('should check if cell is in board', () => {
           expect(game.inBoard(-1, 0)).to.not.be.true;
           expect(game.inBoard(game.size-1, game.size)).to.not.be.true;
           expect(game.inBoard(game.size-1, game.size-1)).to.be.true;
       })
    });

    describe('#loadPatternFile(name)', () => {
        it('should load pattern from file with the given name', () => {
            const filePromise = game.loadPatternFile(dir + 'tenCellRow.lif');
            return filePromise.then(() => {
                const expectedBoard = game.getNewBoard();
                for (let i = game.size / 2 - 5; i < game.size / 2 + 5; i++) {
                    expectedBoard[game.size / 2][i] = 1;
                }
                expect(game.board).to.eql(expectedBoard);
            });
        });
    });

    describe('#getNeighboursOf(x, y)', () => {
        it('should calculate neighbours of cell [x, y]', () => {
            const filePromise = game.loadPatternFile(dir + 'glider.lif');
            return filePromise.then(() => {
                const n1 = game.getNeighboursOf(game.size/2 + 1, game.size/2);
                expect(n1).to.equal(3);
                const n2 = game.getNeighboursOf(game.size/2, game.size/2);
                expect(n2).to.equal(5);
                const n3 = game.getNeighboursOf(game.size -1 , game.size-1);
                expect(n3).to.equal(0);
            });
        });
    });

    describe('#_calcNextState(x, y)', () => {
        it('should calculate next state for cell [x, y]', () => {
            const filePromise = game.loadPatternFile(dir + 'tenCellRow.lif');
            return filePromise.then(() => {
                const x = game.size/2, y = game.size/2 - 5;
                const first = game._calcNextState(x, y);
                const second = game._calcNextState(x, y + 1);
                expect(first).to.equal(0);
                expect(second).to.equal(1);
            });
        })
    });

    describe('#_calcNextBoard()', () => {
        it('should calculate board state after one day', () => {
            const filePromise = game.loadPatternFile(dir + 'tenCellRow.lif');
            return filePromise.then(() => {
                const nextBoard = game._calcNextBoard();
                let expectedBoard = game.getNewBoard();
                const x = game.size/2, y = game.size/2 - 5;
                expectedBoard.forEach((row, i) => {
                    row.forEach((cell, j) => {
                        if (i >= x - 1 && i <= x + 1 && j >= y + 1 && j <= y + 8)
                            expectedBoard[i][j] = 1;
                    });
                });
                expect(nextBoard).to.eql(expectedBoard);
            });

        });
    });

    describe('#simulate(days)', () => {
       it('should simulate board state after several days', () => {
           const x = game.size/2, y = game.size / 2 - 5;
           const filePromise = game.loadPatternFile(dir + 'tenCellRow.lif');
           return filePromise.then(() => {
               game.simulate(61);
               let expectedBoard = game.getNewBoard();
               expectedBoard.forEach((row, i) => {
                   row.forEach((cell, j) => {
                       if (i >= x - 1 && i <= x + 1 && j >= y + 1 && j <= y + 8)
                           expectedBoard[i][j] = 1;
                   });
               });
               expectedBoard[x][y + 2] = 0;
               expectedBoard[x][y + 7] = 0;
               expect(game.board).to.eql(expectedBoard);
               expect(game.generation).to.equal(61);
               expect(game.population).to.equal(22);
           });
       });
    });
});
