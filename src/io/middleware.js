include.routes({
	middleware: 'middleware/{0}.js'
}).js({
	middleware: ['hint', 'uglify', 'cssmin', 'coffee', 'less', 'condcomments']
}).done(function(resp) {


    // - MOVED to global.Settings.io.extensions
	//var extensions = {
	//	'js': ['condcomments:read','hint:read', 'uglify:write'],
	//	'css': ['cssmin:write'],
	//	'coffee': ['coffee:read', 'hint:read', 'uglify:write'],
	//	'less': ['less:read', 'cssmin:write']
	//};

    var extensions = global.Settings.io.extensions;


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
