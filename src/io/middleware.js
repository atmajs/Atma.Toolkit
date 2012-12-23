include.routes({
	middleware: 'middleware/{0}.js'
}).js({
	middleware: ['hint::hint', 'uglify::uglify', 'cssmin::cssmin']
}).done(function(resp) {


	var extensions = {
		'js': ['hint:read', 'uglify:write'],
		'css': ['cssmin:write'],
		'coffee': ['coffee:read', 'hint:read', 'uglify:write'],
		'less': ['less:read', 'cssmin:write']
	};


	var hook = io.File.getHookHandler();

	for (var key in extensions) {
		var handlers = extensions[key];

		handlers.forEach(function(x) {

			var parts = x.split(':'),
				handler = parts[0],
				funcName = parts[1];

			if (resp[handler] == null) {
				return;
			}

			hook.register(new RegExp('\\.' + key + '$'), funcName, resp[handler]);
		});
	}

});