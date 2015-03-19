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

		var process = new atma.shell.Process(config, done);
		
		process
			.on('process_start', function(data){
				logger.log('[exec]'.cyan, data.command.bold);
			})
			.on('process_exit', function(data){
				logger.log('[done]'.cyan, data.command, ' with ', String(data.code).bold);
			})
			.fail(done)
			.done(function(){
				done && done()
			})
			.run();
		
		return process;
	}
};
