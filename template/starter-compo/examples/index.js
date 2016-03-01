(function(){
	io.File.disableCache()
	
	var server = require('atma-server');	


	include.exports = {
		process: function () {
			app.config.server.handlers = {
				'^/foo/' : FooService
			};

			app
				.findAction('server')
				.done(function(action){
					action.process({
						port: 5771,
					}, function(){});
				});
		}
	};
	
	var FooStore   = {
		'foo' : { name: 'FooName' },
		'baz' : { name: 'BazName' }
	};
	var FooService = server.HttpService({
		meta: {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
			}
		}
	});
	
}());