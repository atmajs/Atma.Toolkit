(function() {


	include.routes({
		controller: 'controllers/{0}.js'
	}).js(['routes.js::Routes', 'websocket.js::WebSocket']).done(function(resp) {


		include.exports = {
			start: function(config) {
				var sys = require("sys"),
					http = require("http"),
					port = config.port || 5777;


				var server = http.createServer(function(request, response) {

					var controller = resp.Routes.resolve(request.url) || 'static';

					include.js({
						controller: controller + '::Controller'
					}).done(function(resp) {
						resp.Controller.request(request, response);
					});
				});
                
				resp.WebSocket.listen(server);
				server.listen(port);
				sys.puts(String.format('Server Running on %1', port));

			}
		}

	})


}());