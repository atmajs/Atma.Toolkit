(function() {
	include.exports = {
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

			include
				.js('/src/cli/shell.js')
				.done(function(resp) {
					new resp.shell(config.command, done).process();
				});

		}
	}

}());
