include.routes({
	middleware: 'middleware/{0}.js'
}).js({
	middleware: ['hint', 'uglify', 'cssmin', 'coffee', 'less', 'condcomments', 'importer']
}).done(function(resp) {


    var extensions = Object.getProperty(global, 'Settings.io.extensions') || {
		'js': ['condcomments:read'],
		'css': ['cssmin:write'],
		'coffee': ['coffee:read'],
		'less': ['less:read']
	};



	var hook = io.File.getHookHandler();

	for (var key in extensions) {
		var handlers = extensions[key];

        if (handlers instanceof Array === false){
            console.warn('Middleware list for ', key, 'is not an array');
            continue;
        }

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
