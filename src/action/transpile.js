include.exports = {
	help: {
		description: 'Use Atma.IO middlewares read/write the files and in between preprocess them',
		args: {
			'many': [ { source: 'see @source', output: 'see @output', extension: 'see @extension' } ],
			'source': 'Glob pattern to search',
			'output': 'Output directory. Default is the original file directory',
			'extension': 'Output file extension',
			'watch': 'Boolean. Watch found files for changes'
		},
	},
	process: function(config, done){
		logger.cfg('logCaller', false);
		
		var watch = Boolean(config.watch || app.config.$cli.params.watch);
		var arr = config.many;
		if (arr == null) {
			arr = [
				{
					source: config.source,
					output: config.output,
					extension: config.extension
				}
			];
		}
		
		if (!watch) {
			process(arr, { checkHooks: true }, done);
			return;
		}
		
		io.File.enableCache();
		Watcher(arr);
	}
};

function Watcher(arr) {
	var busy = false;
	var shouldRecompile = false;
	function complete() {
		busy = false;
		if (shouldRecompile) {
			shouldRecompile = false;
			start();
			return;
		}
		logger.log('green<Watching files...>'.color);
		shouldRecompile = false;
	}
	function start(opts) {
		busy = true;
		process(arr, opts, complete);
	}
	function onFileChange(path) {
		io.File.clearCache(path);
		if (busy === true) {
			shouldRecompile = true;
			logger.warn('Filechanged {0} but Transpiler is BUSY. Job is deferred', path);
			return;
		}
		start();
	}
	
	start({
		onFileChange: onFileChange,
		checkHooks: true
	});
}

function process (many, opts, done) {
	arrayAsync(many, done, function(x, next){
		transpileByPattern(x.source, x, opts, next);
	})
}

function transpileByPattern(pattern, config, opts, done) {
	// check
	if (opts && opts.checkHooks) {
		var path = pattern.replace(/\*/g, 'x');
		var hook = io.File.getHookHandler();
		if (hook.getHooksForPath(path).length === 0) {
			logger
				.error('Atma IO has no transpiler for', pattern)
				.warn('\t 1) Make sure PLUGIN is in node_modules/PLUGIN_NAME')
				.warn('\t 2) Make sure `package.json contains atma: { plugins : [] } Array and the plugin name is inside');
			return;
		}
		
		if (config.extension == null) {
			logger.error('Atma IO: output extension is not set. run `atma transpile --help for more info');
		}
	}
	
	pattern = pattern
		.replace(/\\/g, '/')
		.replace(/^\/+/, '');
	
	var files = io.glob.readFiles(pattern);
	arrayAsync(files, done, function(file, next){
		transpileFile(file, config, next);
		if (opts && opts.onFileChange) {
			file.watch(opts.onFileChange);
		}
	});
}
function transpileFile(file, config, next) {
	
	var uri = file.uri.combine();
	uri.file = uri.file.replace(uri.extension, config.extension);
	if (uri.toLocalFile() === file.uri.toLocalFile()) {
		throw Error('Configuration failed. Transpiler will overwrite the original path ' + file.uri.toLocalFile() + '.');
	}
	
	read(write);
	
	function read(fn) {
		logger.log('File:', file.uri.toRelativeString(io.env.currentDir).green);
		file
			.readAsync()
			.done(function(content){
				logger.getTransport().put(' bold<OK> '.color);
				fn(content);
			})
			.fail(function(error) {
				logger.error(file.uri.toLocalFile(), error);
				next();
			})
	}
	function write(content) {
		io
			.File
			.writeAsync(uri, content)
			.always(next)
			.fail(function(error){
				logger.error(uri.toLocalFile(), error);
			})
	}
}

function arrayAsync(arr, done, next) {
	arr = arr.slice();
	function handle() {
		if (arr.length === 0) {
			return done();
		}
		next(arr.shift(), handle);
	}
	handle();
}