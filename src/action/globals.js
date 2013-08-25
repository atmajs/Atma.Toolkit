
include.exports = {
	help: {
		description: 'Opens file which contains projects information for editing'
	},
	process: function(config, done) {
		
		var path =	io
			.env
			.applicationDir
			.combine('globals/projects.txt')
			.toString();
			
		require('openurl').open(path);

		done();
	}
};

