
include.exports = {

	prepairConfig: function prepairConfig(config) {

        interpolate(config, config);

		if (Array.isArray(config) === false) {

            if (typeof config === 'object' && !config.action){
                // assume this is grouped config
                var groups = getCurrentGroups(config),
                    out = [];

                for(var key in config){
                    // action could be also a group name
                    if (typeof config[key] === 'object' && config[key].action == null){
                        config[key].action = key;
                    }
                }

                ruqq.arr.each(groups, function(groupName){

                    var cfg = config[groupName];

                    if (Array.isArray(cfg)){
                        out = out.concat(cfg);
                        return;
                    }

                    out.push(cfg);
                });

                config = out;

            }else{
                config = [config];
            }

		}


		for (var i = 0, x, length = config.length; i < length; i++) {
			x = config[i];

            if (typeof x !== 'object'){
                console.error('Config must be an Object', x);
                return {};
            }

			if ('file' in x) {
				parseFile(x);
				parseType(x);
			}
			if (i == 0) {
				parseOverrides(x);
			}
		}



		return config;
	}

};

/* private */

function parseFile(config) {
	var uri = new net.Uri(config.file);
	if (uri.isRelative()) {
		uri = new net.Uri(net.Uri.combine(process.cwd(), config.file));
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

function parseOverrides(config) {
	var array = process.argv,
		i = 0,
		length = array.length,
		action = config.action,
		actionFound = false,
		key, value, x;


	for (; i < length; i++) {
		x = array[i];

		if (x[0] === '-') {
			key = x.substring(1);

            if (key[0] === '-'){
                key = key.substring(1);
            }else{
                value = i < length - 1 ? array[i + 1] : null;
                if (value && value[0] !== '-') {
                    var c = value[0];

                    if (c === '"' || c === "'") {
                        value = value.substring(1, value.length - 1);
                    }

                    config[key] = value;
					i++
                    continue;
                }
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

        if (action){
            if (x == action) {
                actionFound = true;
            }
        }else{

            /* @TODO - start collection overrides after config file definition */
            actionFound = true;

        }
	}

    return config;
}


function getCurrentGroups(config){
    var overrides = parseOverrides({}),
        groups = [];

    if (overrides.args) {
        ruqq.arr.each(overrides.args, function(x){
            if (config.hasOwnProperty(x)){
                groups.push(x);
            }
        });
    }

    if (!groups.length && config.defaults){
        ruqq.arr.each(config.defaults, function(x){
            if (config.hasOwnProperty(x)){
                groups.push(x);
                return;
            }

            logger.warn('GroupedConfig: Defaults contains not existed group name: ', x);
        });
    }

    //-delete config.defaults;

    if (!groups.length)
        groups = Object.keys(config);
    

    if (!groups.length)
        logger
			.warn('GroupedConfig: Defines no group names', config);
    

    logger(95)
        .log('GroupedConfig - groups/overrides', groups, overrides);

    return groups;
}


function interpolate(config, root){
    if (Array.isArray(config)){
        ruqq.arr.each(config, function(config){
            interpolate(config, root);
        });
        return;
    }

    if (typeof config === 'object'){

        for(var key in config){
            if (typeof config[key] === 'object'){
                interpolate(config[key], root);
                continue;
            }

            if (typeof config[key] === 'string'){

                var value = config[key].trim();

                if (value.substring(0,2) !== '#['){
                    continue;
                }


                value = value.substring(2, value.length - 1).trim();
                value = Object.getProperty(root, value);
                if (!value){
                    console.warn('Seems to be interpolated value, but object doesnt exist', config[key]);
                    continue;
                }

                config[key] = value;
            }
        }
    }
}