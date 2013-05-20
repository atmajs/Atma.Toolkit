(function() {
	include.exports = {
		process: function(config, done) {
			require('openurl').open(io.env.applicationDir.combine('globals/projects.txt').toString());
			done && done();
		}
	};

}());
