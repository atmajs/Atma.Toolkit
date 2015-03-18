module.exports = {
	help: {
		description: 'Run shell commands',
		args: {
			command: '(string | Array<string>) Shell command(s)',
			cwd: '(string) working directory'
		},
		examples: [
			'$ atma shell --command "foo bar -qux"',
			{
				action: 'shell',
				command: 'foo bar -qux'
			}
		]
	},
	process: function(config, done) {

		var process = new atma.shell.Process(config.command, done);
		
		process
			.on('command_exit', function(command, code){
				logger.log('>'.cyan, command, ', returned ', code);
			})
			.fail(done)
			.done(function(){
				done && done()
			})
			.run();
		
		return process;
	}
};
