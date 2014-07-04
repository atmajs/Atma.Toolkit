

require('atma-server');


var resource = include
	.js(
		'./server/middleware/Middleware.js',
		'./server/middleware/static.js',
		'./server/middleware/proxy.js'
	)
	
	.done(function(resp){
		
		var appConfig = app.config;
		
		resource.exports = {
		
			start: function(config) {
				
				var port = config.port || process.env.PORT || 5777,
					proxyPath = config.proxy;
				
				
				var configs = new net
					.Uri(resource.location)
					.combine('server/config/')
					.toString()
					;
				
				var base = io
						.env
						.applicationDir
						.combine('src/server/')
						.toString();
						
				resource.cfg({
					path: base
				});
				
				atma.server.app = atma
					.server
					.Application({
						configs: configs,
						config: {
							debug: true
						},
						args: {
							debug: true
						}
					})
					.done(function(app) {
						
						mask.cfg('allowCache', false);
						
						var bodyParser = require('body-parser'),
							Url = require('url')
							;
						
						
						app.responders([
							app.responder({
								middleware: [
									function(req, res, next){
										var url = Url.parse(req.url, true);
										req.query = url.query;
										next();
									},
									bodyParser.json()
								]
							}),
							atma.server.StaticContent.respond,
							resp.proxy(proxyPath)
						]);
						var server = require('http')
							.createServer(app.process.bind(app))
							.listen(port);
						
						
						
						var serverCfg = appConfig.server,
							
							handlers, websockets, subapps;
						
						if (serverCfg) {
							handlers = serverCfg.handlers,
							websockets = serverCfg.websockets,
							subapps = serverCfg.subapps;
						}
							
						
						handlers && app
							.handlers
							.registerHandlers(handlers, app.config.handler)
							;	
						
						websockets && app
							.handlers
							.registerWebsockets(websockets, app.config)
							;
						
						subapps && app
							.handlers
							.registerSubApps(subapps)
							;
							
						app
							.autoreload(server);
						//	.getWatcher()
						//	.on('fileChange', function(path){
						//		
						//		io.File.clearCache(path);
						//	})
						//	;
						
						
						
						
						logger.log('Listen %s'.green.bold, port);
					});	
			}
		};
		
	});
	