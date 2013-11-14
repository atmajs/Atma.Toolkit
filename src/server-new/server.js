

require('atma-server');


var resource = include
	.js(
		'server/middleware/Middleware.js',
		
		'server/middleware/static.js',
		'server/middleware/proxy.js'
	)
	
	.done(function(resp){
		
		var appConfig = app.config;
		
		resource.exports = {
		
			start: function(config) {
				
				var port = config.port || 5777,
					proxyPath = config.proxy;
				
				
				var configs = new net
					.Uri(resource.location)
					.combine('server/config/')
					.toString()
					;
					
				resource.cfg({
					path: io
						.env
						.applicationDir
						.combine('src/server-new/')
						.toString()
				})
				
				atma.server.app = atma
					.server
					.Application({
						configs: configs,
						args: {
							debug: true
						}
					})
					.done(function(app) {
						
						mask.cfg('allowCache', false);
						
						var server,
							middleware = new resp.Middleware()
								.add(app.responder())
								.add(resp.static())
								.add(resp.proxy(proxyPath))
								;
						
						server =  require('http')
							.createServer(middleware.listener);
						server
							.listen(port);
						
						
						var serverCfg = appConfig.server,
							handlers = serverCfg && serverCfg.handlers,
							websockets = serverCfg && serverCfg.websockets
							;
						
						handlers && app
							.handlers
							.registerHandlers(handlers, app.config.handler)
							;	
						
						websockets && app
							.handlers
							.registerWebsockets(websockets, app.config)
							;
						
						
						app
							.autoreload(server)
							.getWatcher()
							.on('fileChange', function(path){
								
								io.File.clearCache(path);
							})
							;
						
						
						
						
						logger.log('Listen %s'.green.bold, port);
					});	
			}
		};
		
	});
	