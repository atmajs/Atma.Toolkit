(function() {
	
	var resource = include;
	
	resource.exports = {
		help: {
			description: 'Run shell commands',
			args: {
				command: '<string> Command'
			},
			examples: [
				'$ atma shell --command "my command"',
				{
					action: 'shell',
					command: 'my command'
				}
			]
		},
		process: function(config, done) {

            if (!config.command){
                done('Shell Command(s) is not defined.');
				return;
            }

			resource
				.js('/src/cli/shell.js::Shell')
				.done(function(resp) {
					
					var shell = new resp.Shell(config.command, done);
					
					shell.process();
				});

		}
	}

}());
