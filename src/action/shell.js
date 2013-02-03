(function() {
	include.exports = {
		process: function(config, done) {

            if (!config.command){
                return done(new Error('Shell Command(s) is not defined.'));
            }

			include.js('/src/cli/shell.js').done(function(resp) {
				new resp.shell(config.command, done).process();
			});

            return 0;
		}
	}

}());
