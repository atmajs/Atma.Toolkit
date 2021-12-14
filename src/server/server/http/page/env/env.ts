include.exports = Class({
	Base: atma.server.HttpPage,
	onRenderStart: function(model, ctx){
		
		var request = ctx.req,
			that = this
			;
		
		
		var scripts;
		
		this.model = {
			scripts: scripts = []
		};

		add_source(scripts, '/.reference/atma/include/lib/include.js');
		add_source(scripts, '/.reference/atma/ruqq/lib/dom/jquery.js');
		add_source(scripts, '/.reference/atma/mask/lib/mask.js');
		
		var routes = app.config.defaultRoutes;
		if (routes) {
			
			add_script(scripts, 'include.routes(' + JSON.stringify(routes, null, 4) + ')');
			add_script(scripts, "include.plugin({ atma: 'include/include.autoreload' });");
		}
		
		
		var debugScript = request.url.replace(/\/debug(.)*$/,'');
			
		scripts.push({
			path: debugScript
		});

	}
});


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