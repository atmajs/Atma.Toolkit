include.exports = {
	help: {
		description: [
			'Increase version in `package.json | bower.json | component.json`',
			'Resolve release files from `build.js` exports (`release` property)',
			'Checkout branch release',
			'Checkout release files from `master`',
			'Commit and push changes',
			'Add and push the git tag using current version'
		],
		args: {},
	},
	process: function(config, done){
		
		var cwd = io.env.currentDir.toString();
		var files = [
			'lib/*',
			'readme.md',
			'package.json',
			'bower.json'
		].reduce(function(aggr, path){
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
		}, [])
		
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
				'git commit -am "bump ' + _version + '"',
				'git checkout -B release',
				function () {
					createIgnore(files)
				},
				'git rm -r --cached .',
				'git add -A',
				'git commit -am "v' + _version + '"',
				'git push origin release -ff',
				'git tag v' + _version,
				'git push --tags',
				function (args) {
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
				if (typeof command === 'function') {
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
function createIgnore(files) {
	_gitignore = io.File.read(GIT_IGNORE);
	var lines = [
		'*',
		'!*/'
	];
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