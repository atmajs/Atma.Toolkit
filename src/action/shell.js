(function() {
	include.exports = {
		process: function(config, idfr) {
            
            if (!config.command){
                console.error('Shell Command(s) is not defined.');
                idfr.resolve(1);
                return;
            }
            
			include.js('/src/cli/shell.js').done(function(resp) {
				new resp.shell(config.command, idfr).process();
			});
		}
	}

}());