include.js('io.utils.js::IOUtils').done(function(resp) {


	global.io == null && (global.io = {});

	var utils = resp.IOUtils,
		_cache = {},
		_hook, _factory;

	io.File = Class({
		Construct: function(path, data) {
			
			if (path instanceof net.URI){
				path = path.toLocalFile();
			}
			
			if (_cache.hasOwnProperty(path)) {				
				return _cache[path];
			}

			this.uri = new net.URI(path);


			if (this.__proto__ == io.File.prototype) {

				var handler = _factory && _factory.resolveHandler(this.uri);
				if (handler) {
					return new handler(this.uri, data);
				}
			}

			return (_cache[path] = this);
		},
		read: function(asBuffer) {

			if (this.content) {
				return this.content;
			}

			this.content = utils.file.readSync(this.uri.toLocalFile(), asBuffer);

			_hook && _hook.trigger('read', this);

			return this.content;
		},
		write: function(content) {

			this.content = content;

			_hook && _hook.trigger('write', this);

			utils.file.save(this.uri.toLocalFile(), this.content);
			return this;
		},
		copyTo: function(targetUri) {
			console.log('Copy:', this.uri.toLocalFile(), targetUri.toLocalFile());

			utils.file.copySync(this.uri.toLocalFile(), targetUri.toLocalFile());
			return this;
		},
		exists: function() {
			return utils.file.exists(this.uri.toLocalFile());
		},
		Static: {
			clearCache: function(path) {
				if (!path) {
					_cache = {};
				} else {
					if (_cache.hasOwnProperty(path) == false) {
						console.log('Try to clear not existend cache item', path);
					}
					delete _cache[path];
				}

			},
			registerFactory: function(factory) {
				_factory = factory;
			},
			getFactory: function(){
				return _factory;
			},
			registerHookHandler: function(hook) {
				_hook = hook;
			},
			getHookHandler: function(){
				return _hook;
			}

		},
        stats: function(){
            return utils.file.statsSync(this.uri.toLocalFile());
        }
	});

});