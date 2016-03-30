'use strict';

class CommandParser {

    constructor() {
        this.commands = new Map();
    }

    addCommand(command, func) {
        this.commands.set(command,func);
        return this;
    }

    execute(line) {
        let command = line.split(' ')[0];
        let args = line.split(' ').slice(1);
        const func = this.commands.get(command);
        if (func) {
            func.apply(null, args);
        } else {
            throw new Error(`Wrong command: ${command}`);
        }
    }
}

module.exports = CommandParser;