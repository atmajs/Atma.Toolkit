module.exports = {
	help: {
		description: [
			'Increase the version in `package.json | bower.json | component.json`',
			'`npm run build` the project',
			'Commit and push version',
			'`npm publish` the project',
			'Checkout `release` branch',
			'Remove files not for `release`',
			'Commit and push changes',
			'Create and push the git tag using current version',
			'Checkout back to master'
		],
		args: {
			release: 'Array, default: lib/**, vendor/**, readme.md, package.json, bower.json',
			branch: 'String, Current active branch, default: master',
			afterBump: 'Array, additional commands after bump',
			afterPublish: 'Array, additional commands after publishing',
		},
	},
	process: function(config, done){
		
		var branch = config.branch || 'master';
		var includes = config.release || (app.config.settings && app.config.settings.release) || [
			'lib/**',
			'vendor/**',
			'readme.md',
			'package.json',
			'bower.json'
		];
		var afterBump     = config.afterBump    || [],
			afterPublish  = config.afterPublish || [];

		this.bump(function(error, version){
			if (error) {
				done(error);
				return;
			}
			
			var publish = [
				'npm run build',
				'git add -A',
				'git commit -a -m "v' + version + '"',
				'git push origin ' + branch,
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
					ignoreFile_create(includes)
				},
				'git rm -r --cached .',
				'git add -A',
				'git commit -a -m "v' + version + '"',
				'git push origin release -ff',
				'git tag v' + version,
				'git push --tags',
				function () {
					ignoreFile_reset();
				},
				'git checkout ' + branch + ' -ff'
			];
			
			var commands = afterBump
				.concat(publish)
				.concat(afterPublish)
				;
			
			runCommands(commands, done);
		});
	},
	includeFiles: {
		create: function(includes){
			ignoreFile_create(includes);
		},
		reset : function(){
			ignoreFile_reset();
		}
	},
	runCommands: function(commands, done){
		runCommands(commands, done);
	},
	bump: function(done){
		app
			.findAction('bump')
			.done(function(action){
				action.process({}, done);
			});
	}
};



var ignoreFile_create,
	ignoreFile_reset;
(function(){
	var GIT_IGNORE = '.gitignore';
	var _gitignore;

	ignoreFile_create = function (includes) {
		_gitignore = io.File.read(GIT_IGNORE);

		var cwd = io.env.currentDir.toString();
		var files = includes.reduce(function(aggr, path){
			if (path.indexOf('*') !== -1) {
				var files = io
					.glob
					.readFiles(path)
					.map(function(file){
						path = file.uri.toRelativeString(cwd);
						addFolder(aggr, path);
						return path;
					});
					
				aggr = aggr.concat(files);
				return aggr;
			}
			
			aggr.push(path);
			return aggr;
		}, []);
		
		
		var lines = [ '*' ];
		lines = lines.concat(includes
			.filter(function(path){
				return path.indexOf('/') !== -1
			})
			.map(function(path){
				return '!' + path.substring(0, path.lastIndexOf('/') + 1)
			})
		);
		lines = lines.concat(files.map(function(filename){
			return '!' + filename;
		}));
		
		io.File.write(GIT_IGNORE, lines.join('\n'));
		
		logger.log('gitignore:'.cyan, io.File.read(GIT_IGNORE));
	};
	ignoreFile_reset = function () {
		if (!_gitignore) {
			io.File.remove(GIT_IGNORE);
			return;
		}
		io.File.write(GIT_IGNORE, _gitignore);
	};

	function addFolder(arr, path) {
		var dir = path.substring(0, path.lastIndexOf('/') + 1);
		if (dir && arr.indexOf(dir) === -1) {
			arr.push(dir);
		}
		if (dir.length > 1) {
			addFolder(arr, dir.substring(0, dir.length - 1));
		}
	}
}());

var runCommands;
(function(){
	var _shell;
	runCommands = function(commands, done){

		if (_shell) 
			return process();
		
		app
			.findAction('shell')
			.done(function (shell) {
				_shell = shell;
				process();
			});

		function process() {
			var index = -1;
			function next(error){
				if (error) {
					done(error);
					return;
				}
				
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
				
				
				_shell
					.process(command)
					.done(function(){
						next();
					})
					.fail(function(error){
						logger.error('Shell error', error);
						next(error);
					})
			}
			
			next();
		}
	};
}());