module.exports = Class({
	Base: Class.Deferred,

	read: function(rootConfig) {
		var file = getFile(rootConfig.$cli),
			action = getAction(rootConfig),
			that = this;
		
		if (action != null) {
			delete rootConfig.tasks;
			this.config = {
				tasks: [action]
			};
			return this.resolve();
		}

		if (file == null) {
			if (rootConfig['tasks'] != null) {
				var tasks = rootConfig.tasks;
				delete rootConfig.tasks;
				
				
				this.config = {
					tasksAll: obj_extend({}, tasks),
					tasks: prepairTasks(obj_extend({}, tasks), rootConfig),
					$prepairTasks: prepairTasks
				};
			}
			return this.resolve();
		}

		rootConfig
			.constructor
			.fetch([{
				path: file.uri.toLocalFile()
			}])
			.done(function() {
				// toJSON: to create clone objects
				that.config = {
					tasksAll: this.toJSON(),
					tasks: prepairTasks(this.toJSON(), rootConfig),
					$prepairTasks: prepairTasks
				};
	
				that.resolve();
			});
	},

	data: {
		sync: true
	}
});


// PRIVATE

function getFile($cli) {

	var configName = $cli.args[0],
		file;

	if (configName) {
		file = new io.File(configName);
		if (file.exists())
			return file;
	}

	file = new io.File('build.js');
	if (file.exists())
		return file;
}

function getAction(rootConfig) {
	var cli = rootConfig.$cli,
		action = cli.args[0];

	if (action in rootConfig.actions === false)
		return null;

	var config = {
		action: action,
		args: cli.args.slice(1)
	};

	for (var key in cli.params) {
		config[key] = cli.params[key];
	}

	return config;
}



function prepairTasks(tasks, rootConfig) {
	var _tasks = tasks;
	if (Array.isArray(tasks) === false) {

		if (typeof tasks === 'object' && tasks.action == null) {
			// assume this is grouped tasks
			var groups = getCurrentGroups(tasks, rootConfig),
				out = [];

			for (var key in tasks) {
				// action could be also a group name
				if (typeof tasks[key] === 'object' && tasks[key].action == null) {
					tasks[key].action = key;
				}
			}

			ruqq.arr.each(groups, function(groupName) {

				var cfg = tasks[groupName];
				if (cfg == null) {
					logger.error('Config group name is undefined %s. Tasks: %s'
						, groupName
						, tasks
					);
				}
				if (Array.isArray(cfg)) {
					ruqq.arr.each(cfg, function(x){
						if (x == null) {
							return;
						}
						if (typeof x === 'string') {
							var config = tasks[x];
							if (config == null) {
								logger.error('Subarray contains no taks with the name: ', x);
								return;
							}
							var obj = obj_extend({}, config);
							obj.name = x;
							out.push(obj);
							return;
						}
						out.push(x);
					});
					return;
				}

				out.push(cfg);
			});

			tasks = out;

		} else {
			tasks = [tasks];
		}

	}

	var i = -1,
		imax = tasks.length;
	while( ++i < imax ) {
		x = tasks[i];

		if (typeof x === 'string' && _tasks[x]) {
			if (_tasks[x] == null) {
				logger.error(
					'Config name `%s` must be an Object or name of existing Task. Tasks: %s, All: %s'
					, x
					, tasks
					, _tasks);
				return {};
			}
			x = tasks[i] = _tasks[x];
		}

		if (typeof x !== 'object') {
			logger.error('Config must be an Object or name of existing Task', x, i, imax, tasks);
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
	var uri = new net.Uri(config.file);
	if (uri.isRelative())
		uri = new net.Uri(net.Uri.combine(process.cwd(), config.file));

	config.uri = uri.toString();
}

function parseType(config) {
	if (config.type)
		return;


	var ext = config.uri.extension,
		types = {
			htm: 'html',
			html: 'html',
			js: 'js',
			es6: 'js'
		};

	config.type = types[ext];

}

function getDefaults(obj) {
	return obj['defaults'] || obj['default'];
}

function getCurrentGroups(config, rootConfig) {
	var overrides = rootConfig.$cli,
		groups = [];

	if (overrides.args) {
		ruqq.arr.each(overrides.args, function(x) {
			if (config.hasOwnProperty(x)) {
				groups.push(x);
			}
		});
	}

	if (groups.length === 0 && getDefaults(config)) {
		ruqq.arr.each(getDefaults(config), function(x) {
			if (config.hasOwnProperty(x)) {
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