module.exports = Class({
    Base: Class.Deferred,
    
    read: function(rootConfig){
		var file = getFile(rootConfig.$cli),
			action = getAction(rootConfig),
			config = this
			;
        
		if (action != null) {
			this.config = {
				tasks: prepairTasks({
					action: action
				}, rootConfig)
			};
			return this.resolve();
		}
		
		if (file == null) 
            return this.resolve();
        
		rootConfig
			.constructor
			.fetch([{
				path: file.uri.toLocalFile()
			}])
			.done(function(){
				
				config.config = {
					tasks: prepairTasks(this.toJSON(), rootConfig)
				};
				
				config.resolve();
			});
    },
	
	data: {
		sync: true
	}
});


// PRIVATE

function getFile($cli){
	
    var configName = $cli.args[0],
        file
        ;
    
	if (configName) {
		file = new io.File(configName);
		if (file.exists()) 
			return file;	
	}
	
    file = new io.File('build.js');
    if (file.exists()) 
        return file;
}

function getAction(rootConfig){
	var action = rootConfig.$cli.args[0];
	
	if (action in rootConfig.actions) 
		return action;
	
	return null;
}



function prepairTasks(tasks, rootConfig) {


    if (Array.isArray(tasks) === false) {
		
        if (typeof tasks === 'object' && tasks.action == null){
            // assume this is grouped tasks
            var groups = getCurrentGroups(tasks, rootConfig),
                out = [];

            for(var key in tasks){
                // action could be also a group name
                if (typeof tasks[key] === 'object' && tasks[key].action == null){
                    tasks[key].action = key;
                }
            }
			
			

            ruqq.arr.each(groups, function(groupName){

                var cfg = tasks[groupName];

                if (Array.isArray(cfg)){
                    out = out.concat(cfg);
                    return;
                }

                out.push(cfg);
            });

            tasks = out;

        }else{
            tasks = [tasks];
        }

    }


    for (var i = 0, x, length = tasks.length; i < length; i++) {
        x = tasks[i];

        if (typeof x !== 'object'){
            logger.error('Config must be an Object', x, i, length, tasks);
            return {};
        }

        if ('file' in x) {
            parseFile(x);
            parseType(x);
        }
    }



    return tasks;
}

function parseFile(config) {
	config.uri = new net.Uri(config.file);
}

function parseType(config) {
	if (config.type)
        return;

    
	var ext = config.uri.extension,
        types = {
            htm: 'html',
			html: 'html',
			js: 'js'
        };
        
	config.type = types[ext];
	
}



function getCurrentGroups(config, rootConfig){
    var overrides = rootConfig.$cli,
        groups = [];

    if (overrides.args) {
        ruqq.arr.each(overrides.args, function(x){
            if (config.hasOwnProperty(x)){
                groups.push(x);
            }
        });
    }

    if (groups.length === 0 && config.defaults){
        ruqq.arr.each(config.defaults, function(x){
            if (config.hasOwnProperty(x)){
                groups.push(x);
                return;
            }

            logger.warn('GroupedConfig: Defaults contains not existed group name: ', x);
        });
    }

    //-delete config.defaults;

    if (groups.length === 0)
        groups = Object.keys(config);
    

    if (groups.length === 0)
        logger
			.warn('GroupedConfig: Defines no group names', config);
    

    logger(95)
        .log('GroupedConfig - groups/overrides', groups, overrides);

    return groups;
}

