var resume = include.pause(),
	appConfig = app.config
	;


include
	.js({
		server: ['middleware/static::static']
	})
	.load('./template.mask::env')
	.done(function(resp) {
		
		include.exports = atma
			.server
			.Application({
				
				config: {}
			})
			.done(function(app){
				
				app.responders([
					//rewriteBase,
					responseIndex,
					resp.static(),
					
					response404
				]);
				
				resume();
			});
			
		
		function responseIndex(req, res, next) {
			if (req.url !== '/') 
				return next();
			
			
			res.writeHead(200, {
				'Content-Type': 'text/html'
			});

			var scripts = scripts_resolve(),
				content = mask.render(resp.load.env, {
					scripts: scripts
				});

			res.end(content);
		}
		
		function response404(req, res) {
			
			res.writeHead(404, {
				'Content-Type': 'text/plain'
			});
			
			res.end('404 ' + (req.filePath || ''));
		}
	});
	
	
function scripts_resolve(scripts) {
	if (scripts == null) {
		scripts = [];
	}

	add_source(scripts, '/socket.io/socket.io.js');
	add_source(scripts, '/.reference/atma.toolkit/plugins/utest/utest.browser.js');

	var routes = appConfig.defaultRoutes;
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
