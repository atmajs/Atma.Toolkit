#!/usr/bin/env node

(function() {

	require('atma-libs/globals');
	
	exports = include
		
		.cfg({
			sync: true,
			path: 'file:///' + __dirname.replace(/\\/g, '/') + '/',
			lockedToFolder: true,
			loader: {
				coffee: '/node_modules/atma-libs/include/loader/coffee/loader.js'
			}
		})
		
		.routes({
			
			handler: '/src/handler/{0}.js',
			parser: '/src/parser/{0}.js',
			action: '/src/action/{0}.js',
			script: '/src/{0}.js',
			helper: '/src/helper/{0}.js',
			base: '/src/base/{0}.js',
			io: '/src/io/{0}.js',
			server: '/src/server/{0}.js'
		})
		
		.js({
			_: [
				'/src/helper/logger.js',
				'/src/utils/exports.js'
			],
			io: 'package',
			script: [ 
				'helper/colorize', 
				'helper/extensions', 
				'io/files/style',
				'solution/solution',
				'builder/build'
			],
			
			parser: [
				'js',
				'css',
				'html'
			]
			//
			
		})
		
		.done(function(resp) {
			
			include.cfg('sync', false);
			
			include.exports = Class({
				Extends: Class.Deferred,
				
				process: function(resources){
					var resource = sln
						.Resource
						.fromMany(resources)
						.load();
					
					var that = this,
						solution = {
							resource: resource
						};
					
					resp.build.build(solution, function(fileStats){
						
						
						that.resolve(solution);
					});
				}
				
			});
	
	
			return 1;
	
		});


}());
