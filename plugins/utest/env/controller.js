include
.js({
	libjs: 'mask.node::Mask',
	helper: 'globals'
})
.load('./template.mask::env')
.done(function(resp) {

	var File = io.File,
		mask = resp.Mask,
		globals = resp.globals,
		resource = include;
		
	
	
	include.exports = {
		attach: function(routes){
			routes.register({
				match: /^\/?test\/?$/,
				controller: this
			});
		},
		request: function(request, response) {
			
			response.writeHeader(200, {
				'Content-Type': 'text/html'
			});
			
			
			var scripts = scripts_resolve(),
				content = mask.render(resp.load.env, {
					scripts: scripts
				});
			
			response.write(content);
			response.end();
		}
	};

	
	function scripts_resolve(scripts) {
		if (scripts == null) {
			scripts = [];
		}

		add_source(scripts, '/.reference/libjs/include/lib/include.js');
		add_source(scripts, '/.reference/libjs/ruqq/lib/dom/jquery.js');
		add_source(scripts, '/.reference/libjs/mask/lib/mask.js');
		
		add_source(scripts, '/socket.io/socket.io.js');
		add_source(scripts, '/.reference/ijs/plugins/utest/utest.browser.js');
		
		var routes = globals.defaultRoutes;
		if (routes) {
			add_script(scripts, 'include.routes(' + JSON.stringify(routes, null, 4) + ')');
		}
		
		

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