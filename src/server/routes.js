
(function(global){

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
		}],
		Routes = Class({
		
		register: function(route){
			routes.push(route);
		},
		resolve: function(path, callback){
			
			var controller;
			
			for (var i = 0, imax = routes.length; i < imax; i++){
				x = routes[i];
				
				if (x.match && x.match.test && x.match.test(path)) {
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
						callback(new Error('Controller not loaded: ' + controller));
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

}(global));