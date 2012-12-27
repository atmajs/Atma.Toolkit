(function() {

	var spawn = require('child_process').spawn

	var ShellExec = Class({
		Construct: function(command, idfr) {
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
            
			this.idfr = idfr;            
		},
		process: function() {

			var command = this.commands.shift();

			if (!command) {
				this.idfr.resolve();
                return;
			}
            
            
			var child = spawn(command.exec, command.args);

			child.stdout.on('data', function(data) {
				console.log('stdout: ' + data);
			});

			child.stderr.on('data', function(data) {
				console.log('stderr: ' + data);
			});

			child.on('exit', function(code) {
				console.log('child process exited with code ' + code);
				this.process();
			}.bind(this));
		}
	});
    
    include.exports = ShellExec;

}());