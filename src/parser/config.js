/**
 *  Include Builder Config Parse/Define
 **/

include.js({
	script: 'io/file'
}).done(function() {

	var actions = [ //
	'template', //
	'reference', //
	'globals', //
	'git-clone', //
	'server', //
	'shell'],
		program = require('commander'),
		args = program.args,
		config;


	if (!(args && args.length > 0)) {
		args = ['build.json'];
	}


	var entry = args[0].trim();


	if (actions.indexOf(entry) > 1) {
		global.config = {
			action: entry,
			state: 4
		};
		return;
	}

	var file = new io.File(entry);

    
    if (file.exists() == false) {
        console.error('File doesnt exists (404)', file.uri.toLocalFile());
        return;
    }
    
    switch(file.uri.extension){
        case 'config':
            global.config = JSON.parse(file.read());
            break;
        case 'js':
            eval(file.read());
            if (global.config == null){
                console.error('Included Javascript as configuration exposed no config property');
                global.config = {
                    state: 0
                };
                return;
            }
            break;
        default:
            global.config = {
                file: file.uri.toLocalFile()
            }    
            break;
    }
    
    config = global.config;
    
    
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
			parseOverrides(program, config);
		}
	}


	//if (new io.File(config.uri.toLocalFile()).exists() == false) {
	//	console.error('File doesnt exists (404)', config.uri.toLocalFile());
	//	return;
	//}
	//if (!config.type) {
	//	console.error('Unknown solution type', config.type);
	//	return;
	//}

	config.state = 4;


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
	}


	include.exports = (global.config = config);
});