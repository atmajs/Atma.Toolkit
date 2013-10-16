(function(resp){

	var resource = include.routes({
		controller: 'controllers/{0}.js'
	});
	
	
	/**
	 * Route
	 * { match: RegExp | String, controller: Function | String }
	 */

	var routes = [{
			match: /\?debug/,
			controller: 'env'
		},{
			match: /^\/\-\-compos/,
			controller: 'compo-dev/index'
		}];
	
	var Routes = Class({
		
		register: function(route){
			routes.push(route);
		},
		resolve: function(path, callback){
			
			var controller;
			
			for (var i = 0, imax = routes.length; i < imax; i++){
				x = routes[i];
				
				if (!x.match)
					continue;
				
				if (typeof x.match === 'function' && x.match(path)) {
					controller = x.controller;
					break;
				}
				
				if (x.match.test && x.match.test(path)) {
					controller = x.controller;
					break;
				}
			}
			
			if (controller == null) {
				controller = 'static';
			}
			
			if (typeof controller === 'string') {
				resource.js({
					controller: controller + '::Controller'
				}).done(function(resp){
					if (resp.Controller == null) {
						callback('Controller not loaded: ' + controller);
						return;
					}
					callback(null, resp.Controller);
				});
				return;
			}
			
			callback(null, controller);
		}
	});
	

	include.exports = new Routes();

}());