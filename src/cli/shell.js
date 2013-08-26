(function() {

	var spawn = require('child_process').spawn,
        ShellExec;

	include.exports = Class({
		Construct: function(command, done) {
			this.commands = typeof command === 'string' 
				? [command] 
				: command
				;

            for(var i = 0, x, length = this.commands.length; i<length; i++){
				x = this 
	                .commands[i] 
	                .trim() 
	                .replace(/[ ]{2,}/g,' ') 
	                .split(' ');

                this.commands[i] = {
                    exec: x.shift(),
                    args: x
                };

			}

			this.done = done;
		},
		process: function() {

			var command = this.commands.shift(),
				that = this;

			if (!command) {
				this.done();
                return;
			}

			var child;

			if (global.process.platform === 'win32'){
				if (command.exec !== 'cmd'){

					command
						.args
						.unshift('/C', command.exec)

					command.exec = 'cmd';
				}
			}

			try {
				child = spawn(command.exec, command.args, {
	                cwd: process.cwd(),
	                env: process.env,
	                stdio: 'inherit'
	            });
			}catch(error){

				logger
					.error('Could not run command');

				this.process();
			}

			child
				.on('exit', function(code) {
					logger.log(command.exec + ' ' + command.args.join(' '), ' - exite with code ', code);

					that.process();
				});
		}
	});

}());
