import { env, File } from 'atma-io';
import { Shell } from 'shellbee';

declare let include, app;

export default {

	help : {
		description: 'Install Atma Plugins to the CWD or to the global Atma path',
	},

	strategy: {

		['^install/:pluginName??:global(g|global):save-dev']: function (params, config, done) {
			var pluginName = params.pluginName;
			if (params.global != null) {

				install_npmGlobal(pluginName, function(code){

					if (code === 0)
						install_writeMetaGlobal(pluginName);

					done(code);
				});
				return;
			}

			install_npmLocal(pluginName, params['save-dev'] != null, function(error){
				if (error == null)
					install_writeMetaLocal(pluginName);

				done(error);
			});

		}
	}
};

function install_writeMetaLocal(pluginName){

	var file = new File('package.json'),
		package_ = {} as any;
	if (file.exists())
		package_ = file.read();

	if (package_.atma == null)
		package_.atma = {};

	if (package_.atma.plugins == null)
		package_.atma.plugins = [];

	var shouldWrite = false;
	if (package_.atma.plugins.indexOf(pluginName) === -1) {
		shouldWrite = true;
		package_.atma.plugins.push(pluginName);
	}
	if (package_.atma.settings == null) {
		package_.atma.settings = {};
	}
	if (package_.atma.settings[pluginName] == null) {
		shouldWrite = true;
		package_.atma.settings[pluginName] = {};

		var pluginPackage = 'node_modules/' + pluginName + '/package.json';
		if (File.exists(pluginPackage)) {
			var obj = File.read<any>(pluginPackage).defaultSettings;
			if (obj) {
				package_.atma.settings[pluginName] = obj;
			}
		}
	}


	shouldWrite && file.write(package_);
}

function install_writeMetaGlobal(pluginName) {

	var plugins = app.config.$get('plugins');
	if (plugins && plugins.indexOf(pluginName) !== -1)
		return;

	app.config.$write({
		plugins: [ pluginName ]
	});
}

async function install_npmLocal(pluginName, saveDev, done){
	var save = saveDev ? '--save-dev' : '--save';
	var process = await Shell.run({
		command: 'npm install ' + save + ' ' + pluginName
	});
	process.onCompleteAsync().then(done, done);
}

async function install_npmGlobal(pluginName, done){
	var path = env.applicationDir.toLocalDir();

	var process = await Shell.run({
		command: 'npm install ' + pluginName,
		cwd: path
	});

	process.onCompleteAsync().then(done, done);
}
