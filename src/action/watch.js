/**
 * Run IncludeJS Config(Actions on file changes)
 */

include.js({
	helper: 'configHelper::configHelper',
	script: 'project/resource::Resource'
}).done(function(resp) {

	console.warn(typeof obj_each);

	function prepairConfig(config) {
		config = resp.configHelper.prepairConfig(config);

		ruqq.arr.remove(config, function(x) {
			return x.action === 'watch';
		});

		return config;
	}


	include.exports = {
		process: function(_config, done) {
			var files = _config.files,
				config = _config.config,
				ignore = _config.ignore;

			if (config == null) {
				done && done(new Error('Config to run on file change is not defined'));
				return;
			}

			this.config = prepairConfig(config);


			var onFileChanged = this.onFileChanged.bind(this),
				collection = new io.Directory().readFiles(files).files;

			ruqq.arr.each(collection, function(file) {
				io.File.watcher.watch(file, onFileChanged);
			});

			console.log('Listen %d files'.bold.green, collection.length);
		},

		onFileChanged: function(path) {
			var watcher = this;

			if (watcher.isBusy) {
				console.warn('Watcher is busy, path changed:', path);
				return;
			}

			watcher.isBusy = true;

			/** shallow copy config, as array will be empty after action processor is done */
			global.config = ruqq.arr.map(watcher.config, function(x) {
				return x;
			});

			io.File.clearCache(path);
			resp.Resource.clearCache(path);

			include.js({
				action: 'action-processor::Processor'
			}).done(function(resp) {
               
				(new resp.Processor()).run(global.config, function(){
					setTimeout(function() {
						watcher.isBusy = false;
						console.log('Listen...'.green);
					}, 500);
				});
			});

		}
	}

});
