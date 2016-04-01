'use strict';

let chai = require('chai');
let expect = chai.expect;
let Game = require('../game_engine');
let fs = require('fs');


describe('Game', () => {
    let game;

    beforeEach(next => {
        game = new Game();
        return new Promise((resolve, reject) => {
            fs.readdir(__dirname + '/../patterns', (err, filenames) => {
                if (err) {
                    reject(err);
                }
                const filePromises = [];
                filenames.forEach((filename) => {
                    const pattern = game.loadPatternFile('patterns/' + filename);
                    filePromises.push(pattern);
                });
                Promise.all(filePromises).then(_ => {
                    next();
                });
            });

        })
    });

    describe('#restart()', () => {
       it('should restart game', () => {
           game.load
           game.loadPattern('Glider');
           game.restart();
           const emptyBoard = game.getNewBoard();
           expect(game.board).to.eql(emptyBoard);
       })
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

    describe('#loadPattern(name)', () => {
        it('should load pattern with the given name from initially loaded patterns', () => {
            game.loadPattern('10 Cell Row');
            const expectedBoard = game.getNewBoard();
            for (let i = game.size/2 - 5; i < game.size/2 + 5; i++) {
                expectedBoard[game.size/2][i] = 1;
            }
            expect(expectedBoard).to.eql(game.board);
        })
    });

    describe('#getNeighboursOf(x, y)', () => {
        it('should calculate neighbours of cell [x, y]', () => {
            game.loadPattern('Glider');
            const pattern = game._patterns.get('10 Cell Row');
            const n1 = game.getNeighboursOf(game.size/2 + 1, game.size/2);
            expect(n1).to.equal(3);
            const n2 = game.getNeighboursOf(game.size/2, game.size/2);
            expect(n2).to.equal(5);
            const n3 = game.getNeighboursOf(game.size -1 , game.size-1);
            expect(n3).to.equal(0);
        })
    });

    describe('#_calcNextState(x, y)', () => {
        it('should calculate next state for cell [x, y]', () => {
            game.loadPattern('10 Cell Row');
            const pattern = game._patterns.get('10 Cell Row');
            const x = game.size/2, y = game.size/2 - pattern.topLeft[1];
            const first = game._calcNextState(x, y);
            const second = game._calcNextState(x, y + 1);
            expect(first).to.equal(0);
            expect(second).to.equal(1);
        })
    });

    describe('#_calcNextBoard()', () => {
        it('should calculate board state after one day', () => {
            game.loadPattern('10 Cell Row');
            const nextBoard = game._calcNextBoard();
            let expectedBoard = game.getNewBoard();
            const pattern = game._patterns.get('10 Cell Row');
            const x = game.size/2, y = game.size/2 - pattern.topLeft[1];
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
           game.loadPattern('10 Cell Row');
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
