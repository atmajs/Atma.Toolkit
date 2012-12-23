
!(function(global){

	var routes = { 
		'/': 'index'
	};
	var Routes = Class({
		Construct: function(){

		},
		register: function(){

		},
		resolve: function(route){
			return routes[route];
		}
	})

	include.exports = new Routes();

})(global);