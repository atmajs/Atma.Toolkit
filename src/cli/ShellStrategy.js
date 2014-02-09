
module.exports = Class({
	Construct: function(strategy){
		
		this.routes = new ruta.Collection();
		this.strategy = strategy;
		
		for (var key in strategy){
			
			this.routes.add(key, strategy[key]);
		}
	},
	
	process: function(path, config, done) {
		
		
		var route = this.routes.get(path);
		if (route == null) {
			
			logger
				.warn('[available strategy]:'.bold)
				.log(Object.keys(this.strategy))
				;
			
			done('Invalid arguments `' + path + '`');
		}
		
		route.value(route.current.params, config, done);
	}
});