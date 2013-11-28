/**
 * After being attached to includejs as a plugin (@see utest-plugin.js)
 * includejs:server will pipe all matched reqs (@see attach function)
 * to this controller
 */

include
	.js({
		server: ['middleware/static::static']
	})
	.load('./template.mask::env')
	.done(function(resp) {

	var File = io.File,
		globals = app.config.globals,
		resource = include,
		
		processStatic = resp.static(),
		WebSockets = resp.websocket;

	
	var rgx_utest = /^\/?utest\/?(\/[^\s]+)?$/;

	include.exports = Class({
		Base: Class.Deferred,
		
		process: function(req, res) {

			if (req.url === '/utest') {
				res.writeHead(301, {
					'Location': '/utest/'
				});
				
				res.end();
				
				return this;
			}
			
			var match = rgx_utest.exec(req.url),
				resource = match && match[1];
			
			if (resource) {
				var app = atma.server.app;
				if (app.handlers.has(resource)) {
					
					req.url = resource;
					app.respond(req, res);
					
					return this;
				}
				
				var webSockets = app.webSockets,
					SocketHandler = webSockets.getHandler('/node'),
					config = SocketHandler.getCurrentConfig();
				
				if (Array.isArray(config)) {
					config = ruqq.arr.first(config, function(x){
						return x.base != null;
					});
				}
				
				if (config && config.base) {
					var base = new net.Uri(config.base).toLocalDir();
					
					req.url = resource;
					processStatic(req, res, _404Delegate(req, res), config);
					return this;
				}
				
				logger.warn('<utest handler: invalid config> No base path', config)
				
				res.writeHeader(500, {
					'Content-Type': 'text/plain'
				});
				res.end('500 - utest configuration error');
				return this;
			}
			

			res.writeHeader(200, {
				'Content-Type': 'text/html'
			});


			var scripts = scripts_resolve(),
				content = mask.render(resp.load.env, {
					scripts: scripts
				});

			res.end(content);
			
			return this;
		}
	});

	
	function _404Delegate(req, res) {
		return function(){
			_404(req, res);
		};
	}
	function _404(req, res){
		res.writeHead(404, {
			'Content-Type': 'text/plain'
		});
		res.end('404');
	}

	function scripts_resolve(scripts) {
		if (scripts == null) {
			scripts = [];
		}

		add_source(scripts, '/socket.io/socket.io.js');
		add_source(scripts, '/.reference/atma.toolkit/plugins/utest/utest.browser.js');

		var routes = globals.defaultRoutes;
		if (routes) {
			add_script(scripts, 'include.routes(' + JSON.stringify(routes, null, 4) + ')');
		}

		add_script(scripts, 'include.cfg({ path: "/utest/" })');		
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