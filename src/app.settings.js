(function(global) {


    if (!global.config){
        console.error('Config not defined');
        return;
    }

    var config = global.config,
        settings = ruqq.arr.first(config, function(x){
        return x.action == 'settings';
    });

    ruqq.arr.remove(config, function(x){
        return x.action == 'settings';
    });


	global.Settings = {};



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


    deepExtend(Settings, settings);



    function deepExtend(target, source){
        if (!source){
            return target;
        }
        for(var key in source){

            if (source[key].constructor === Object){
                deepExtend(target[key] = {}, source[key]);
                continue;
            }
            target[key] = source[key];
        }
        return target;
    }


}(global));
