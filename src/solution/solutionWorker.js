include.js({
	parser: ['js', 'css', 'html'],
	script: ['io/files/style', 'solution/solution']
}).done(function() {



	include.exports = {
		process: function(config, done) {

            if (config.uri instanceof net.Uri === false){
                done('File is not defined ' + config.file);
                return;
            }

			if (new io.File(config.uri.toLocalFile()).exists() == false) {
				done('File doesnt exists (404) ' + config.uri.toLocalFile());
				return;
			}
			if (!config.type) {
				done('Unknown solution type ' + config.type);
				return;
			}


			var solution = new Solution(config, function(solution) {
				logger.log(' - resources loaded - ');
				
				switch (solution.config.action) {
				case 'project-import':
				case 'project-reference':
					include.js('resourceSource.js').done(function(resp) {
						resp.resourceSource.action(solution.config.action, done);
					});
					break;
				case 'build':
					include.js({
						script: 'builder/build'
					}).done(function(resp) {
						resp.build.build(solution, function(fileStats){
							solution.onbuild(fileStats);
							done();
						});
					});
					break;
				}
			});
			
			solution.process();
		}
	}
});
