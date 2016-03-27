'use strict';

class CommandParser {

    constructor() {
        this.commands = {};
    }

    addCommand(command, func) {
        this.commands[command] = func;
        return this;
    }

    execute(line) {
        let command = line.split(' ')[0];
        let args = line.split(' ').slice(1);
        if (command in this.commands) {
            this.commands[command].apply(null, args);
        } else {
            throw 'NoSuchCommand';
        }
    }
}

module.exports = CommandParser;