var program = require('commander');

include.exports = {

	prepairConfig: function prepairConfig(config) {
		if (config instanceof Array === false) {
			config = [config];
		}

		for (var i = 0, x, length = config.length; i < length; i++) {
			x = config[i];
			if ('file' in x) {
				parseFile(x);
				parseType(x);
			}
			if (i == 0) {
				parseOverrides(program, x);
			}
		}
		return config;
	}

}



function parseFile(config) {
	var uri = new net.URI(config.file);
	if (uri.isRelative()) {
		uri = new net.URI(net.URI.combine(process.cwd(), config.file));
	}
	config.uri = uri;
}

function parseType(config) {
	if (!config.type) {

		var ext = config.uri.extension;
		config.type = {
			htm: 'html',
			html: 'html',
			js: 'js'
		}[ext];
	}
}

function parseOverrides(program, config) {
	var array = program.rawArgs,
		i = 0,
		length = array.length,
		action = config.action,
		actionFound = false,
		key, value, x;


	for (; i < length; i++) {
		x = array[i];

		if (x[0] === '-') {
			key = x.substring(1);
			value = i < length - 1 ? array[i + 1] : null;
			if (value) {
				var c = value[0];

				if (c == '"' || c == "'") {
					value = value.substring(1, value.length - 1);
				}

				config[key] = value;
				continue;
			}

			config[key] = true;
			continue;
		}

		if (actionFound) {
			var c = x[0];
			if (c == '"' || c == "'") {
				x = x.substring(1, x.length - 1);
			}

			(config.args || (config.args = [])).push(x);

			continue;
		}

		if (x == action) {
			actionFound = true;
		}
	}
}
