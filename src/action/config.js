
include.exports = {
	help: {
		description: 'Opens Atma.Toolkit global configuration file'
	},
	process: function(config, done) {
		
		var file = new io.File(io
				.env
				.appdataDir
				.combine('config.yml')
			);
		
		if (!file.exists()) {
			
			file
				.write({ projects: {} });
		}
		
		
		require('openurl').open(file.uri.toString());

		done();
	}
};

