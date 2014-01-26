
include.exports = {
	help: {
		description: 'Opens file which contains projects information for editing'
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

