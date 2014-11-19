include.exports = {
	help: {
		description: [
			'Increase version in `package.json | bower.json | component.json`',
			'Commit and push version',
			'npm publish',
			'Resolve release files from `lib/*`',
			'Checkout `release` branch',
			'Ignore files not for `release`',
			'Commit and push changes',
			'Create and push the git tag using current version',
			'Checkout master'
		],
		args: {},
	},
	process: function(config, done){
		
		var includes = app.config.settings && app.config.settings.release || [
			'lib/*',
			'vendor/*',
			'readme.md',
			'package.json',
			'bower.json'
		];
		
		var cwd = io.env.currentDir.toString();
		var files = includes.reduce(function(aggr, path){
			if (path.indexOf('*') !== -1) {
				var files = io
					.glob
					.readFiles(path)
					.map(function(file){
						return file.uri.toRelativeString(cwd);
					});
					
				aggr = aggr.concat(files);
				return aggr;
			}
			
			aggr.push(path);
			return aggr;
		}, []);
		
		app
			.findAction('bump')
			.done(function(action){
				action.process(config, getShellAction)
			});
			
		function getShellAction(error, version){
			if (error) 
				return done(error);
			
			_version = version;
			app
				.findAction('shell')
				.done(function(action) {
					_shell = action;
					
					process();
				})
		}
		
		
		function process() {
			var commands = [
				'git add -A',
				'git commit -a -m "v' + _version + '"',
				'git push origin master',
				(function(){
					if (io.File.exists('package.json') === false) 
						return null;
					
					var pckg = io.File.read('package.json');
					if (typeof pckg === 'string') 
						pckg = JSON.parse(pckg);
					
					var name = pckg.name;
					if (name && name !== '-') 
						return 'npm publish';
					
					return null;
				}()),
				'git checkout -B release',
				function () {
					createIgnore(files, includes)
				},
				'git rm -r --cached .',
				'git add -A',
				'git commit -a -m "v' + _version + '"',
				'git push origin release -ff',
				'git tag v' + _version,
				'git push --tags',
				function () {
					resetIgnore();
				},
				'git checkout master -ff'
			];
			var index = -1;
			function next(){
				if (++index >= commands.length) {
					done();
					return;
				}
				
				var command = commands[index];
				if (command == null) {
					next();
					return;
				}
				if (typeof command === 'function') {
					if (command.length === 1) {
						command(next);
						return;
					}
					command();
					next();
					return;
				}
				
				logger.log('command'.cyan, command);
				_shell.process({
					command: command
				}, next);
			}
			
			next();
		}
	}
};

var _version,
	_gitignore,
	_shell;

var GIT_IGNORE = '.gitignore';
function createIgnore(files, includes) {
	_gitignore = io.File.read(GIT_IGNORE);
	
	var lines = [ '*' ];
	lines = lines.concat(includes
		.filter(function(path){
			return path.indexOf('/') !== -1
		})
		.map(function(path){
			return '!' + path.substring(0, path.indexOf('/') + 1)
		})
	);
	lines = lines.concat(files.map(function(filename){
		return '!' + filename;
	}));
	
	io.File.write(GIT_IGNORE, lines.join('\n'));
	
	logger.log('gitignore:'.cyan, io.File.read(GIT_IGNORE));
}
function resetIgnore() {
	if (!_gitignore) {
		io.File.remove(GIT_IGNORE);
		return;
	}
	io.File.write(GIT_IGNORE, _gitignore);
}