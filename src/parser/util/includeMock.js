

include.exports = Class({
	Construct: function() {
		this.includes = [];
		ruqq.arr.each(['js', 'css', 'load', 'lazy'], function(x) {
			this[x] = function(pckg) {

				global.includeLib.Routes.each(x, pckg, function(namespace, route) {
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
	cfg: global.include.cfg,
	routes: global.include.routes
});