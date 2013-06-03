/**
 * After being attached to includejs as a plugin (@see utest-plugin.js)
 * includejs:server will pipe all matched requests (@see attach function)
 * to this controller
 */

include
	.js({
		libjs: 'mask.node::Mask',
		helper: 'globals',
		server: ['controllers/static::StaticHandler', 'websocket']
	})
	.load('./template.mask::env')
	.done(function(resp) {

	var File = io.File,
		mask = resp.Mask,
		globals = resp.globals,
		resource = include,
		StaticHandler = resp.StaticHandler,
		WebSockets = resp.websocket;

	
	var rgx_utest = /^\/?utest\/?(\/[^\s]+)?$/;

	include.exports = {
		attach: function(routes) {
			routes.register({
				match: rgx_utest,
				controller: this
			});
		},
		request: function(request, response) {

			if (request.url === '/utest') {
				response.writeHead(301, {
					'Location': '/utest/'
				});
				response.end();
			}
			
			var match = rgx_utest.exec(request.url),
				resource = match && match[1];
				
			if (resource) {
				var SocketHandler = WebSockets.getConnectionHandler('/node'),
					config = SocketHandler.getCurrentConfig();
				
				if (Array.isArray(config)) {
					config = ruqq.arr.first(config, function(x){
						return x.base != null;
					});
				}
				
				if (config && config.base) {
					var base = new net.URI(config.base).toLocalDir();
					
					request.url = resource;
					StaticHandler.request(request, response, base);
					return;
					
				}
				
				console.warn('Invalid config - no base path information', config)
				
				response.writeHeader(500, {
					'Content-Type': 'text/html'
				});
				response.end('500 - utest configuration error');
				return;
			}
			

			response.writeHeader(200, {
				'Content-Type': 'text/html'
			});


			var scripts = scripts_resolve(),
				content = mask.render(resp.load.env, {
					scripts: scripts
				});

			response.end(content);

		}
	};


	function scripts_resolve(scripts) {
		if (scripts == null) {
			scripts = [];
		}

		add_source(scripts, '/socket.io/socket.io.js');
		add_source(scripts, '/.reference/ijs/plugins/utest/utest.browser.js');

		var routes = globals.defaultRoutes;
		if (routes) {
			add_script(scripts, 'include.routes(' + JSON.stringify(routes, null, 4) + ')');
		}

		add_script(scripts, 'include.cfg({ path: "utest/" })');		
		return scripts;
	}


	function add_source(collection, path) {
		collection.push({
			path: path
		});
	}

	function add_script(collection, script) {
		collection.push({
			script: script
		});
	}

});