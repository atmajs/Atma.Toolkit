

require('atma-libs/globals-dev');
require('atma-logger');
require('atma-io');
require('atma-server');


global.app = atma

	.server
	.Application()
	.done(function(app) {
		
		var connect = require('connect'),
			passport = require('passport'),
			redirect = require('connect-redirection'),
			port = process.env.PORT || 5777;
	
	
		var server = connect()
			.use(connect.favicon())
			
			.use(connect.query())
			.use(connect.cookieParser())
			.use(connect.session({ secret: 'key' }))
			.use(redirect())
			.use(passport.initialize())
			.use(passport.session())
			
			.use(app.responder())

			.use(connect.static(__dirname))
			.listen(port);
		
		
		if (app.args.debug) {
			app.autoreload(server);
			mask.cfg('allowCache', false);
		}
		
		logger.log('Listen %s'.green.bold, port);
	});	


