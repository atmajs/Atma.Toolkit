(function() {

	var spawn = require('child_process').spawn,
        ShellExec;

	include.exports = Class({
		Construct: function(command, done) {
			this.commands = Array.isArray(command)
				?   command  
				: [ command ]
				;

				
			this.commands = this.commands.reduce(function(aggr, command, index){
				
				var exec, args, cwd;
				
				if (typeof command === 'string') {
					exec = command;
					cwd = process.cwd();
				}
				
				else if (command != null) {
					
					exec = command.command;
					cwd = command.cwd;
				}
				
				if (!exec) {
					logger.warn('Command Object is not valid');
					return aggr;
				}
			
				args = exec.trim().split(/\s+/);
				
				var imax = args.length,
					i = -1,
					c, arg;
					
				while ( ++i < imax ){
					
					arg = args[i];
					if (arg.length === 0) 
						continue;
					
					c = arg[0];
					
					if (c !== '"' && c !== "'") 
						continue;
					
					
					var start = i;
					for( ; i < imax; i++ ){
						
						arg = args[i];
						if (arg[arg.length - 1] === c) {
							
							var str = args
									.splice(start, i - start + 1)
									.join(' ')
									.slice(1,  -1)
									;
							
							args.splice(start, 0, str);
							imax = args.length;
							break;
						}
					}
				}
				
				aggr.push({
					exec: args.shift(),
					args: args,
					cwd: cwd
				});
				
				return aggr;
				
			}, []);
			

			this.done = done;
		},
		
		lastCode: 0,
		process: function() {

			var command = this.commands.shift(),
				that = this;

			if (command == null) {
				this.done(that.lastCode);
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
	                cwd: command.cwd || process.cwd(),
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
					logger.log('>'.cyan, command.exec, command.args.join(' '), ', returned ', code);

					that.lastCode = code;
					that.process();
				});
		}
	});

}());
