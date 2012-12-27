(function() {
	include.exports = {
		process: function(config, idfr) {
			require('openurl').open(io.env.applicationDir.combine('globals.txt').toString());
			idfr.resolve && idfr.resolve();
		}
	};

}());