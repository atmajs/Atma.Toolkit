include
	.js([
		'./models/User.es6'
	])
	.ready(function(resp){
	
		var App = Compo({
			/* Properties */
		});
	
		var model = {
			user: new resp.User('Foo')
		},
			ctx = {};
	
		
		window.app = mask.run(model, ctx, App)
	});
