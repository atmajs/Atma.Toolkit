(function(){
  
	var Routes = global.includeLib.Routes();

	include.exports = Class({
		Construct: function(resource) {
			
			var that = this;
			
			this.url = resource.url;
			this.location = resource.location;
			this.includes = [];
			
			['js', 'css', 'load', 'lazy'].forEach(function(x) {
				
				this[x] = function(pckg) {
					
					if (typeof pckg === 'string' && arguments.length > 1) {
						pckg = Array.prototype.slice.call(arguments);
					}
					
					
					var base = this.base;
					Routes.each(x, pckg, function(namespace, route) {
						
						this.includes.push({
							type: x,
							url: base && net.Uri.combine(base, route.path) || route.path,
							route: route,
							namespace: namespace
						});
					}.bind(this));
					
					return this;
				};
				
			}, this);
		},
		cfg: function() {
			return this;
		},
		routes: function(arg){
			if (arg == null){
				return Routes.getRoutes();
			}
			for (var key in arg) {
                Routes.register(key, arg[key], this);
			}
			return this;
		},
		setBase: function(path){
			this.base = path;
			return this;
		},
        Static: {
            Routes: Routes,
			toJsonRoutes: function(){
				var result = {},
					routes = Routes.getRoutes();
				
				for (var key in routes) {
					result[key] = _join(routes[key]);
				}
				
				function _join(route) {
					var result = '';
					for (var i = 0, x, imax = route.length; i < imax; i++){
						x = route[i];
						
						if (i % 2 === 0) {
							result += x;
							continue;
						}
						
						result += '{%1}'.format(x);
					}
					
					return result;
				}
				
				return result;
			}
        }
	});
}());
