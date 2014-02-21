(function() {

	var child_process = require('child_process'),
        ShellExec;

	include.exports = Class({
		Construct: function(command, done) {
			this.commands = Array.isArray(command)
				?   command  
				: [ command ]
				;

				
			this.commands = this.commands.reduce(function(aggr, command, index){
				
				var exec, args, cwd, detached;
				
				if (typeof command === 'string') {
					exec = command;
					cwd = process.cwd();
				}
				
				else if (command != null) {
					
					exec = command.command;
					cwd = command.cwd;
					detached = command.detached;
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
					cwd: cwd,
					detached: detached
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

			var detached = command.detached === true,
				stdio = detached ? null : 'inherit',
				child;

			if (global.process.platform === 'win32'){
				if (command.exec !== 'cmd'){

					command
						.args
						.unshift('/C', command.exec)

					command.exec = 'cmd';
				}
			}
			

			try {
				child = child_process.spawn(command.exec, command.args, {
	                cwd: command.cwd || process.cwd(),
	                env: process.env,
	                stdio: stdio,
					detached: detached
	            });
			}catch(error){

				logger
					.error('Could not run the command', command);

				this.process();
			}
			
			if (detached) {
				that.process();
				return;
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
