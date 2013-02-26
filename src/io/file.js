include.js('io.utils.js::IOUtils').done(function(resp) {


	global.io == null && (global.io = {});

	var utils = resp.IOUtils,
		fs = require('fs'),
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

            if (path && this.uri.isRelative() && io.env){
                this.uri = io.env.currentDir.combine(this.uri);
            }


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

            if (content != null){
                this.content = content;
            }

            if (this.content == null){
                console.error('io.file.write: Content is empty');
                return this;
            }

			_hook && _hook.trigger('write', this);

			utils.file.save(this.uri.toLocalFile(), this.content);
			return this;
		},
		copyTo: function(targetUri) {

            if (typeof targetUri === 'string'){
                targetUri = new net.URI(targetUri);
                if (targetUri.isRelative()){
                    targetUri = io.env.currentDir.combine(targetUri);
                }
            }

			console.log('Copy:', this.uri.toLocalFile(), targetUri.toLocalFile());

			utils.file.copySync(this.uri.toLocalFile(), targetUri.toLocalFile());
			return this;
		},
		exists: function() {
			return utils.file.exists(this.uri.toLocalFile());
		},
		rename: function(fileName){
			var oldpath = this.uri.toLocalFile(),
				uri = this.uri.combine(''),
				newpath;

			uri.file = fileName;

			fs.renameSync(oldpath, uri.toLocalFile());
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
