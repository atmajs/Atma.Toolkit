(function() {

	include.exports = {
		process: function(config, idfr) {

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
					console.error('Globals.txt is not in includejs root');
					idfr.resolve && idfr.resolve(1);
				}

				try {
					projects = JSON.parse(resp.load.globals).projects;
				}catch(error){
					console.error('Globals.txt, in includejs root, contains no valid json data, or contains no projects property');
					idfr.resolve && idfr.resolve(1);
					return;
				}

				if (projects.hasOwnProperty(path)){
					path = projects[path].path;
				}

				if (!path || new io.Directory(path).exists() == false) {

					console.error('Symbolic link points to undefined path', path);
					idfr.resolve && idfr.resolve(1);
					return;
				}


				resp.refHelper.create(io.env.currentDir, name, path);
				idfr.resolve && idfr.resolve();
			});
		}
	}
}());