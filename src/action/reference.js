
(function() {

	include.exports = {
		help: {
			description: 'Reference a library: Create symlink to its folder',
			args: {
				path: '<string> Path to a library OR project name to get from globals',
				name: '<?string> folder name in .reference/, @default is a referenced folder name'
			},
			examples: [
				'$ atma reference atmajs'
			]
		},
		process: function(config, done) {

			include
				.js({
					helper: ['referenceHelper::refHelper']
				})
				.done(function(resp) {
					var args = process.argv,
						path = config.path || args[3],
						name = config.name || args[4],
						projects = app.config.globals.projects;
	
	
					if (!projects){
						return done('config/projects.txt contains no projects');
					}
					
					if (projects.hasOwnProperty(path)){
						name = path;
						path = projects[name].path;
						
					}
	
					if (!path || new io.Directory(path).exists() === false) {
						return done('Symbolic link points to undefined path: ' + path);
					}
	
					
					
					resp.refHelper.create(io.env.currentDir, name, path);
					return done && done();
				});
		}
	}
}());
