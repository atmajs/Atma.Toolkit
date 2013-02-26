(function(global) {



	function resolveSettings(config) {
		if (config.action == 'settings') {
			return config;
		}

		var setts = config.settings;

		if (setts) {
			delete config.settings;
			return setts;
		}

		if (config instanceof Array) {

			setts = ruqq.arr.first(config, 'action', '==', 'settings');
			if (setts) {
				ruqq.arr.remove(config, 'action', '==', 'settings');
			}

			return setts;
		}

		for (var key in config) {
			var groupe = config[key];
			if (groupe.action === 'settings') {
				setts = groupe;
				delete config[key];
				return setts;
			}

			return resolveSettings(groupe);
		}

		return null;
	}

	global.Settings = {
		initialize: function(config) {
			var setts = resolveSettings(config);

			if (setts) {
				deepExtend(Settings, setts);
			}
		}
	};



	/** DEFAULT */
	/* IO */
	Object.extend(Settings.io = {}, {
		extensions: {
			'js': ['condcomments:read', 'hint:read', 'uglify:write'],
			'css': ['cssmin:write'],
			'coffee': ['coffee:read', 'hint:read', 'uglify:write'],
			'less': ['less:read', 'cssmin:write']
		},
		middleware: {
			/** CUSTOM MIDDLEWARE:
			 handlerName: INCLUDE_PATH
			 */
		}
	});






	function deepExtend(target, source) {
		if (!source) {
			return target;
		}
		for (var key in source) {

			if (source[key].constructor === Object) {
				deepExtend(target[key] = {}, source[key]);
				continue;
			}
			target[key] = source[key];
		}
		return target;
	}


}(global));
