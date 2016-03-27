class CommandParser {

    constructor() {
        this.commands = {};
    }

    add_command(command, func) {
        this.commands[command] = func;
    }

    execute(line) {
        let command = line[0];
        let args = [].slice.call(arguments, 1);
        if (command in this.commands) {
            this.commands[command].apply(null, args);
        } else {
            throw 'NotSuchCommand';
        }
    }
}

module.exports = CommandParser;