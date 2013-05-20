
(function() {

	include.exports = {
		process: function(config, done) {

			include.js({
				helper: ['referenceHelper::refHelper', 'globals']
			})
			.done(function(resp) {
				var args = require('commander').args,
					path = config.path || args[1],
					name = config.name || args[2],
					projects = resp.globals && resp.globals.projects;


				if (!projects){
					return done && done(new Error('config/projects.txt contains no projects'));
				}
				
				if (projects.hasOwnProperty(path)){
					path = projects[path].path;
				}

				if (!path || new io.Directory(path).exists() == false) {
					return done && done(new Error('Symbolic link points to undefined path: ' + path));
				}


				resp.refHelper.create(io.env.currentDir, name, path);

                return done && done();
			});
		}
	}
}());
