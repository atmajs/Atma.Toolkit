global.atma = {};

require('atma-libs/globals-dev');
require('atma-logger/lib/global-dev');
require('atma-io');

var base = 'file://' + __dirname.replace(/\\/g, '/') + '/';

include
	.cfg({
		path: base
	})
	.routes({
		handler: base + 'src/handler/{0}.js',
		parser: base + 'src/parser/{0}.js',
		action: base + 'src/action/{0}.js',
		script: base + 'src/{0}.js',
		helper: base + 'src/helper/{0}.js',
		server: base + 'src/server/{0}.js',
		atma: base + '{0}.js'
	})

