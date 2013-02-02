(function() {

	include.exports = {
		process: function(config, done) {

			include.js({
				helper: 'referenceHelper::refHelper'
			})
			.load('/globals.txt')
			.done(function(resp) {
				var args = require('commander').args,
					path = config.path || args[1],
					name = config.name || args[2],
					projects;

				if (!resp.load.globals){
					return done && done(new Error('Globals.txt is not under includejs root'));
				}

				try {
					projects = JSON.parse(resp.load.globals).projects;
				}catch(error){
					return done && done(new Error('Globals.txt, in includejs root, contains no valid json data, or contains no projects property'));
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
