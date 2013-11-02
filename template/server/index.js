

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
			
			.use(app.responder({
				middleware: [
					connect.query(),
					connect.cookieParser(),
					connect.urlencoded(),
					connect.json(),
					connect.session({ secret: 'key' }),
					redirect(),
					passport.initialize(),
					passport.session(),
				]
			}))

			.use(connect.static(__dirname))
			.listen(port);
		
		
		if (app.args.debug) {
			app.autoreload(server);
			mask.cfg('allowCache', false);
		}
		
		logger.log('Listen %s'.green.bold, port);
	});	


