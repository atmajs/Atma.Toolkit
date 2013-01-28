(function(global){
	var Routes = global.includeLib.Routes();

	include.exports = Class({
		Construct: function() {
			this.includes = [];
			ruqq.arr.each(['js', 'css', 'load', 'lazy'], function(x) {
				this[x] = function(pckg) {

					Routes.each(x, pckg, function(namespace, route) {
						this.includes.push({
							type: x,
							url: route.path,
							route: route,
							namespace: namespace
						});
					}.bind(this));
					return this;
				}
			}.bind(this));
		},
		cfg: function() {
			return this;
		},
		routes: function(arg){
			if (arg == null){
				return Routes.getRoutes();
			}
			for (var key in arg) {
				Routes.register(key, arg[key]);
			}
			return this;
		}
	});
}(typeof window === 'undefined' ? global : window));