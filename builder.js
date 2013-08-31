


include
	
	.cfg('sync', true)	
	
	.js({
		script: [ 
			'solution/solution',
			'builder/build',
			'io/files/style'
		],
		
		parser: [
			'js',
			'css',
			'html'
		]
		
	})
	.done(function(resp) {
		
		
		include.cfg('sync', false);
		
		include.exports = Class({
			Extends: Class.Deferred,
			
			/**
			 *	- config (Object) - {}
			 */
			process: function(resources, config){
				
				global.solution = {
					directory: net.Uri.combine(process.cwd(), '/'),
					uri: io.env.currentDir,
					uris: {
						outputDirectory: io.env.currentDir.combine(config.outputSources)
					}
				};
				
				var resource = sln
					.Resource
					.fromMany(resources)
					.load();
				
				var that = this;
				
				
				solution.resource = resource;
				
				resp.build.build(solution, function(fileStats){
					
					
					that.resolve(solution);
				});
				
				return this;
			}
			
		});

	});

