(function() {

	include.exports = {
		process: function(config, idfr) {

			include.js({
				helper: 'referenceHelper::refHelper'
			}).done(function(resp) {
				var args = require('commander').args,
					path = config.path || args[1],
					name = config.name || args[2];

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