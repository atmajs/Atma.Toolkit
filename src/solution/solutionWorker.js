include.js({
	parser: ['js', 'css', 'html'],
	script: ['io/files/style', 'solution/solution']
}).done(function() {
	var config = global.config;



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


            /** @TODO lots of modules, depends on global config, so put that current config to global */
            var globalConfig = global.config,
                listener = function(){
					global.config = globalConfig;
					done();
				};
            global.config = config;


			var solution = new Solution(config, function(solution) {
				console.log('Resources Loaded');
				
				switch (solution.config.action) {
				case 'project-import':
				case 'project-reference':
					include.js('resourceSource.js').done(function(resp) {
						resp.resourceSource.action(solution.config.action, listener);
					});
					break;
				case 'build':
					include.js({
						script: 'builder/build'
					}).done(function(resp) {
						resp.build.build(solution, function(fileStats){
							solution.onbuild(fileStats);
							listener();
						});
					});
					break;
				}
			});
			
			solution.process();
		}
	}
});
