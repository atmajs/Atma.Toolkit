

if (typeof includeLib === 'undefined'){
    require('libjs-class');
    require('./src/libjs/include.node.js');
    require('socket.io');
}

var dir = __dirname.replace(/\\/g, '/') + '/';

if (typeof io === 'object' && io.env){
    dir = io.env.applicationDir.toLocalDir();
}

include.cfg({
	path: 'file:///' + dir,
	lockedToFolder: true,
    sync: true,
	loader: {
		coffee: '/src/libjs/loader/coffee/loader.js'
	}
}).routes({
	ruqq: '/src/libjs/{0}.js',
	handler: '/src/handler/{0}.js',
	parser: '/src/parser/{0}.js',
	action: '/src/action/{0}.js',
	script: '/src/{0}.js',
	helper: '/src/helper/{0}.js',
	base: '/src/base/{0}.js',
	io: '/src/io/{0}.js'
}).js({
	_: '/src/helper/logger.js',
	ruqq: ['net/uri', 'utils', 'arr'],
    script: [ //
	'sys', //
	'helpers', //
	'helper/stdout', //
	],
	io: 'package',
    action: 'action-processor::ActionProcessor'
}).done(function(resp){
    module.exports = resp;

    include.cfg({
        path: 'file:///' + process.cwd().replace(/\\/g, '/') + '/'
    });

    global.include = include.instance(module.parent && module.parent.id);
    global.include.location = include.cfg('path');

});
