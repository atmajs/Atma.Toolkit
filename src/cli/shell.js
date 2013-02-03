(function() {

	var spawn = require('child_process').spawn,
        ShellExec;

	include.exports = Class({
		Construct: function(command, done) {
			this.commands = typeof command === 'string' ? [command] : command;

            for(var i = 0, x, length = this.commands.length; i<length; i++){
				x = this //
                .commands[i] //
                .trim() //
                .replace(/[ ]{2,}/g,' ') //
                .split(' ');

                this.commands[i] = {
                    exec: x.shift(),
                    args: x
                };

			}

			this.done = done;
		},
		process: function() {

			var command = this.commands.shift();

			if (!command) {
				this.done();
                return;
			}


			var child = spawn(command.exec, command.args, {
                cwd: process.cwd(),
                env: process.env,
                stdio: 'inherit'
            });

			child.on('exit', function(code) {
				console.log('child process exited with code ' + code);
				this.process();
			}.bind(this));
		}
	});

}());
