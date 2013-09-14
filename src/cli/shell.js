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
	                .split(/\s+/);
				
				// merge quotet arg, as: git commit -m "some value with spaces"
				var c, index;
				for (var j = 0; j < x.length; j++) {
					if (x[j].length < 1) {
						continue;
					}
					c = x[j][0];
					
					if (c !== '"' && c !== "'") 
						continue;
					
					index = j;
					for (;j < x.length; j++) {
						if (x[j][x[j].length - 1] === c) {
							
							var str = x.splice(index, j - index + 1).join(' ');
							
							x.splice(index, 0, str.substring(1, str.length - 1));
							break;
						}
					}
				}

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

			if (command == null) {
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
					.error('Could not run the command', command);

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
