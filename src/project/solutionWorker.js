include.js({
	parser: ['js', 'css', 'html'],
	script: ['io/files/style', 'project/solution']
}).done(function() {
	var config = global.config;


	
	include.exports = {
		process: function(config, idfr) {
       
            if (config.uri instanceof net.URI === false){
                console.error('File is not defined', config.file);
                idfr.resolve && idfr.resolve(1);
                return;
            }
            
			if (new io.File(config.uri.toLocalFile()).exists() == false) {
				console.error('File doesnt exists (404)', config.uri.toLocalFile());
                idfr.resolve && idfr.resolve(1);
				return;
			}
			if (!config.type) {
				console.error('Unknown solution type', config.type);
                idfr.resolve && idfr.resolve(1);
				return;
			}
            
            
            /** @TODO lots of modules, depends on global config, so that current config to global */
            var globalConfig = global.config,
                listener = {
                    resolve: function(){
                        global.config = globalConfig;
                        idfr && idfr.resolve();
                    }
                };
            
            global.config = config;
            

			new Solution(config.type, config.uri, config, {
				resolve: function(solution) {
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
							resp.build.build(solution, listener);
						});
						break;
					}
				}
			}).process();
		}
	}
});