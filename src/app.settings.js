(function(global) {


	global.Settings = {
		initialize: function(setts) {
			if (setts) {
				deepExtend(Settings, setts);
			}
		},
		io: {
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
		}
	};


	global
		.Settings
		.initialize(app.config.settings);



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
