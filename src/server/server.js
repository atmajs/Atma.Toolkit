(function() {

	var resource = include;

	include
		.js('routes.js::Routes', 'websocket.js::WebSocket')
		.js({
			helper: 'globals'
		})
		.done(function(resp) {
			
			var globals = resp.globals,
				routes = resp.Routes,
				sockets = resp.WebSocket;
			
			include.exports = {
				start: function(config) {
					var http = require("http"),
						port = config.port || 5777;
	
	
					var server = http.createServer(function(request, response) {
	
						resp.Routes.resolve(request.url, function(error, Controller){
							
							Controller.request(request, response);
							
						});
						
					});
	
					resp.WebSocket.listen(server);
					
					server.listen(port);
					
					console.log('Server Running on bold{green{%1}}'.format(port).colorize());
	
				}
			};
			
			
			
			if (globals.server) {
				// Extend Controllers
				
				var controllers = globals.server.controllers;
				if (controllers) {
					var attachToRoutes = function(controller, src) {
						if (!controller || !controller.attach) {
							console.error([ //
							'Defined controller has no attach function,', //
							'that defines routes.', src].join(' '));
							return;
						}
						
						controller.attach(routes);
					}
					
					ruqq.arr.each(controllers, function(x){
						
						if (typeof x === 'string') {
							include.js(x + '::Controller').done(function(resp){
								attachToRoutes(resp.Controller, x);
							});
							return;
						}
						
						// assume this is already an instance
						attachToRoutes(x);
					});
					
				}
				
				// Extend websockets
				
				var websockets = globals.server.websockets;
				if (websockets) {
					var attachSocketListener= function(namespace, handler){
						if (typeof handler !== 'function') {
							console.error('WebSocket Listener - should be a class function')
							console.error('\t', namespace, handler);
							return;
						}
						
						sockets.register(namespace, handler);
					};
					
					var createListener = function(namespace, handler){
						if (typeof handler === 'string') {
							include.js(handler + '::Listener').done(function(resp){
								attachSocketListener(namespace, resp.Listener);
							});
							return;
						}
						
						attachSocketListener(namespace, handler)
					};
					
					
					for (var key in websockets) {
						createListener(key, websockets[key]);
					}
				}
			}
	
		});


}());