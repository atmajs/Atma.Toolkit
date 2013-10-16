(function(resp) {

	include.exports = {
		process: function(url, scripts) {
			if (scripts == null) {
				scripts = [];
			}

			add_source(scripts, '/.reference/atma/include/lib/include.js');
			add_source(scripts, '/.reference/atma/ruqq/lib/dom/jquery.js');
			add_source(scripts, '/.reference/atma/mask/lib/mask.js');
			
			var routes = app.config.globals.defaultRoutes;
			if (routes) {
				
				add_script(scripts, 'include.routes(' + JSON.stringify(routes, null, 4) + ')');
				add_script(scripts, "include.plugin({ atma: 'include/include.autoreload' });");
				
			}
			
			

			return scripts;
		}
	};


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

}());