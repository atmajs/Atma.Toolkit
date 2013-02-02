(function() {
	include.exports = {
		process: function(config, done) {
			require('openurl').open(io.env.applicationDir.combine('globals.txt').toString());
			done && done();
		}
	};

}());
