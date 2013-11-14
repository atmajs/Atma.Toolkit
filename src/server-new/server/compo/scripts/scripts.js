
var	isDebugMode = app.args.debug || app.config.app.debug,
	handler = isDebugMode
		? './dev.js'
		: './build.js'
		;

include
	.js(handler + '::Handler')
	.done(function(resp){
		
		mask.registerHandler(':scripts', resp.Handler);
	});
	
