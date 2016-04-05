const fs = require('fs');
const Game = require('./game_engine');

function loadLifeFiles() {
    return new Promise((resolve, reject) => {
        fs.readdir(__dirname + '/patterns', (err, filenames) => {
            if (err) {
                reject(err);
            }
            const namePromises = [];
            const patterns = new Map();
            filenames.forEach((filename) => {
                const namePromise = Game.parsePatternName(__dirname + '/patterns/' + filename);
                namePromises.push(namePromise);
            });
            Promise.all(namePromises).then((resPatterns) => {
                resPatterns.forEach((pattern) => {
                    patterns.set(pattern.name, pattern.filename);
                });
                resolve(patterns);
            }, reject);
        });
    })
}

module.exports = loadLifeFiles;