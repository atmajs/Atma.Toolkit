include
.js({
	helper: 'globals::Projects'
})
.done(function(resp) {

	include.exports = {
		process: function(url, scripts) {
			if (scripts == null) {
				scripts = [];
			}

			add_source(scripts, '/.reference/libjs/include/lib/include.js');
			add_source(scripts, '/.reference/libjs/ruqq/lib/dom/jquery.js');
			add_source(scripts, '/.reference/libjs/mask/lib/mask.js');
			
			var routes = resp.Projects() && resp.Projects().defaultRoutes;
			if (routes) {
				
				add_script(scripts, 'include.routes(' + JSON.stringify(routes, null, 4) + ')');
				add_script(scripts, "include.plugin({ lib: 'include/include.autoreload' });");
				
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

});