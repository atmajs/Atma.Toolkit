include
	.load('./template/env.mask')
	.done(function(resp) {
	
		var File = io.File,
			resource = include,
			globals = app.config.globals;
			
		
		
		include.exports = {
			attach: function(routes){
				routes.register({
					match: /\?debug$/,
					controller: this
				});
			},
			request: function(request, response) {
				
				env_resolveFromRequest(request.url, function(Env){
					
					if (Env == null || Env.process == null) {
						var msg = 'Environment Handler should expose process function';
						logger
							.error(msg);
						
						response.writeHeader(500, {
							'Content-Type': 'text/plain'
						});
						response.end(msg);
						return;
					}
					
					response.writeHeader(200, {
						'Content-Type': 'text/html'
					});
					
					
					var scripts = Env.process(request.url),
						req = new net.Uri(request.url);
					
					scripts.push({
						path: req.toLocalFile()
					});
					
					var content = mask.render(resp.load.env, {
						scripts: scripts
					});
					
					response.write(content);
					response.end();
						
				});
			}
		};
	
	
	
		function env_resolveFromRequest(path, callback) {
			var environments = app.config.environments,
				match = /\?debug=(\w+)/.exec(path),
				env = match && match[1];
			
			if (env && environments[env] == null) {
				console.warn('Requested environment is not defined', env, '(fallback to default "atma")');
				env = null;
			}
			
			if (env == null) {
				env = 'atma';
			}
			
			var src = environments[env];
			
			
			if (src[0] === '{') {
				src = globals.resolvePathFromProject(src);
			}
			
			resource.js(src + '::Env').done(function(resp){
				callback(resp.Env);
			});
		}
	});