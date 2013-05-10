(function() {

	var resource = include;

	include
		.js(['routes.js::Routes', 'websocket.js::WebSocket'])
		.done(function(resp) {
			
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
			}
	
		});


}());