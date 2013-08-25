/**
 * Run IncludeJS Config(Actions on file changes)
 */

include
	.js({
		script: [
			'solution/resource::Resource',
			'config/utils/config::configHelper'
		]
	})
	.done(function(resp) {
	
		function prepairConfig(config) {
			config = resp.configHelper.prepairConfig(config);
	
			ruqq.arr.remove(config, function(x) {
				return x.action === 'watch';
			});
	
			return config;
		}
	
	
		include.exports = {
			help: {
				description: 'Watch for file change and run tasks',
				
				args: {
					files: '<string|array> glob is supported',
					config: '<?array> configuration / tasks / actions to run',
					actions: '<array> task names'
				}
			},
			process: function(_config, done) {
				var files = _config.files,
					config = _config.config,
					ignore = _config.ignore;
				
				
				if (!config && _config.actions && app.config.raw) {
					var actions = _config.actions;
					
					actions.forEach(function(action, index){
						actions[index] = app.config.raw[action];
					});
					
					config = actions.slice(0);
				}
	
				if (!config) {
					done('Config to run on file change is not defined');
					return;
				}
	
				this.config = prepairConfig(config);
	
	
				var onFileChanged = this.onFileChanged.bind(this),
					collection = new io.Directory().readFiles(files).files;
	
				ruqq.arr.each(collection, function(file) {
					io.File.watcher.watch(file, onFileChanged);
				});
	
				logger.log('Listen %s files'.bold.green, collection.length);
			},
	
			onFileChanged: function(path) {
				logger.log('changed file', path);
				
				var watcher = this;
	
				if (watcher.isBusy) {
					logger.warn('Watcher is busy, path changed:', path);
					return;
				}
	
				watcher.isBusy = true;
	
				/** shallow copy config, as array will be empty after action processor is done */
				var config = ruqq.arr.map(watcher.config, function(x) {
					return x;
				});
	
				io.File.clearCache(path);
				resp.Resource.clearCache(path);
				
				
				app
					.run(config)
					.done(function(){
						setTimeout(function() {
							watcher.isBusy = false;
							logger.log('Listen...'.green);
						}, 400);
					});
	
			}
		}
	
	});
