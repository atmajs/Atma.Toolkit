/**
 *  Include Builder Config Parse/Define
 **/

;
(function() {

	var program = require('commander'),
		config;

	var file = new io.File(program.args[0]);

	if (file.uri.extension == 'config') {
		config = JSON.parse(file.read());
	} else {
		config = {
			file: program.args[0],
			minify: program.minify
		};
	}


	var uri = new net.URI(config.file);
	if (uri.isRelative()) {
		uri = io.env.currentDir.combine(config.file);
	}

	var type = {
		htm: 'html',
		html: 'html',
		js: 'js'
	}[uri.extension] || config.type;

	if (!type) {
		return console.error('Unknown Solution Type');
	}

	config.uri = uri;
	config.type = type;


	var array = program.rawArgs;
	for (var i = 0, x, length = array.length; i < length; i++) {
		x = array[i];

		if (x[0] != '-') {
			continue;
		}

		var key = x.substring(1),
			value = array[++i];

		if (!value) {
			continue;
		}

		if (value[0] == '"') {
			value = value.substring(1, value.length - 1);
		}
		config[key] = value;
	}

	config.state = 4;



	return (global.config = config);
})();