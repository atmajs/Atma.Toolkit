(function() {

	var sys = require("sys"),
		http = require("http");

	include.routes({
		controller: 'controllers/{0}.js'
	}).js(['routes.js::Routes', 'websocket.js::WebSocket']).done(function(resp) {
        
        
        
        
		var server = http.createServer(function(request, response) {

			var controller = resp.Routes.resolve(request.url) || 'static';

			include.js({
				controller: controller + '::Controller'
			}).done(function(resp) {
				resp.Controller.request(request, response);
			});


		});
        
        resp.WebSocket.listen(server);
        
        server.listen(5777);
        
		sys.puts("Server Running on 5777");
	})


}());