if (atma.shell == null) {
	atma.shell = {};
}

/*
 *	Events:
 *		- process_start     { command }
 *		- process_exception { command, error }
 *		- process_exit      { command, code }
 *		- process_ready     { command }
 *		- process_stdout    { command, buffer }
 *		- process_stderr    { command, buffer }
 *
 *	Promise
 *		- fail (Array<{ command, error }> errors)
 *		- done (Process self)
 */
module.exports = atma.shell.Process = Class({
	Extends: [ Class.Deferred, Class.EventEmitter ],
	
	children: null,
	errors: null,
	lastCode: 0,
	
	Construct: function(mix, done) {
		var params = mix;
		
		if (typeof mix === 'string') {
			params = {
				command : mix,
				detached: false
			};
		}
		
		var command  = params.command,
			detached = params.detached || false,
			cwd      = params.cwd || process.cwd(),
			rgxReady = params.matchReady;
		
		this.silent   = params.silent;
		this.errors   = [];
		this.children = [];
		this.commands = Array.isArray(command)
			?   command  
			: [ command ]
			;

			
		this.commands = command_parseAll(this.commands, detached, cwd, rgxReady);
		this.callback = done;
	},
	
	process: function(){
		this.run();
	},
	kill: function(done){
		var child = this.children.pop();
		if (child == null) {
			return done && done();
		}
		this.once('process_exit', done);
		child.kill('SIGINT');
	},
	run: function() {
		if (this.commands.length === 0) {
			if (this.errors.length === 0) {
				this.resolve(this);
			} else {
				this.reject(this.errors);
			}
			
			this.callback && this.callback(this.lastCode);
			return;
		}
		
		var options  = this.commands.shift(),
			command  = options.command,
			rgxReady = options.matchReady,
			detached = options.detached === true,
			silent   = this.silent,
			stdio = detached ? (void 0) : 'pipe',
			child;
		
		if (global.process.platform === 'win32'){
			if (options.exec !== 'cmd'){
				
				options.args.unshift('/C', options.exec);
				options.exec = 'cmd';
			}
		}
		
		try {
			child = child_process.spawn(options.exec, options.args, {
				cwd: options.cwd || process.cwd(),
				env: process.env,
				stdio: stdio,
				detached: detached
			});
			this.children.push(child);
		}catch(error){

			logger.error('Could not run the command', command, error);
			this.errors.push({
				command: command,
				error: error
			});
			this.emit('process_exception', {
				command: command,
				error: error
			});
			this.run();
			return;
		}
		
		var that = this;
		child.on('exit', function(code) {
			that.emit('process_exit', {
				command: command,
				code: code
			});
			that.lastCode = code;
			if (code > 0) {
				that.errors.push({
					command: command,
					error: new Error('Exit code: ' + code)
				});
			}
			that.run();
		});
		
		child.stdout.on('data', function(buffer){
			if (detached !== true && silent !== true) {
				process.stdout.write(buffer);
			}
			if (rgxReady != null && rgxReady.test(buffer.toString())) {
				rgxReady = null;
				that.emit('process_ready', {
					command: command
				});
			}
			that.emit('process_stdout', {
				command: command,
				buffer: buffer
			});
		});
		child.stderr.on('data', function(buffer){
			if (detached !== true && silent !== true) {
				process.stderr.write(buffer);
			}
			that.emit('process_stderr', {
				command: command,
				buffer: buffer
			});
		});
		
		that.emit('process_start', {
			command: command
		});
		
		if (detached === true) {
			this.run();
		}
		if (rgxReady == null) {
			setTimeout(function(){
				that.emit('process_ready', {
					command: command
				});
			}, 200);
		}
	}
});

function command_parseAll(commands, detachedAll, cwdAll, rgxReadyAll) {
	return commands.reduce(function(aggr, command, index){

		var detached = detachedAll || false,
			cwd = cwdAll || process.cwd(),
			matchReady = rgxReadyAll,
			exec;
		
		if (typeof command === 'string') {
			exec = command;
			cwd  = process.cwd();
		}
		else if (command != null) {
			var obj = command;
			exec    = obj.command;
			if (obj.cwd) {
				cwd  = obj.cwd;
			}
			if (obj.detached) {
				detached = obj.detached;
			}
			if (obj.matchReady) {
				matchReady = obj.matchReady;
			}
		}
		
		if (exec == null || exec === '') {
			logger.warn('Command Object is not valid');
			return aggr;
		}
		
		var args = command_parse(exec);
		aggr.push({
			exec: args.shift(),
			args: args,
			cwd: cwd,
			//stdio: 'pipe',
			detached: detached,
			command: exec,
			matchReady: matchReady
		});
		return aggr;
		
	}, []);
}
function command_parse(command) {
	var parts = command.trim().split(/\s+/);
	var imax = parts.length,
		i = -1,
		c, arg;
		
	while ( ++i < imax ){
		
		arg = parts[i];
		if (arg.length === 0) 
			continue;
		
		c = arg[0];
		
		if (c !== '"' && c !== "'") 
			continue;
		
		
		var start = i;
		for( ; i < imax; i++ ){
			
			arg = parts[i];
			if (arg[arg.length - 1] === c) {
				
				var str = parts
					.splice(start, i - start + 1)
					.join(' ')
					.slice(1,  -1)
					;
				
				parts.splice(start, 0, str);
				imax = parts.length;
				break;
			}
		}
	}
	return parts;
}

var child_process = require('child_process');