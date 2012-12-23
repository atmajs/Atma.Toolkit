include.js('io.utils.js::IOUtils').done(function(resp) {

	global.io == null && (global.io = {});

    var utils = resp.IOUtils,
        URI = global.net.URI,
        fs = require('fs');
        

	io.Directory = Class({
		Construct: function(directory) {
			this.uri = new URI(directory);
			delete this.uri.file;
		},
		exists: function() {
			return fs.existsSync(this.uri.toLocalDir());
		},
		ensure: function() {
			utils.dir.ensure(this.uri.toLocalDir());
			return this;
		},
		readFiles: function() {

			this.files = ruqq.arr.map(utils.dir.filesSync(this.uri.toLocalDir()), function(x) {
				return new io.File(this.uri.combine(x));
			}.bind(this));

			return this;
		},
		copyTo: function(targetUri, options, index, idfr) {
			if (this.files instanceof Array === false) return this;

			for (var i = index || 0, x, length = this.files.length; x = this.files[i], i < length; i++) {
				var relative = x.uri.toRelativeString(this.uri),
					file = new io.File(this.uri.combine(relative));

				if (options && options.indexOf('-v') == -1 && file.exists()) {
					program.prompt(String.format('File already exists: #{file}. Replace(y/n)? ', {
						file: file.uri.toLocalFile()
					}), this.copy.bind(this, targetUri, options, i, idfr));

					return this;
				}

				x.copyTo(targetUri.combine(relative));
			}

			idfr && idfr.resolve && idfr.resolve();
			return this;
		},
		getName: function() {
			return this.uri.path.replace(/^.*\/([^\/]+)\/?$/, '$1');
		},
		rename: function(name) {
			if (!name) {
				console.error('New Name is not defined');
				return;
			}
			var oldpath = this.uri.toLocalFile();
			var newpath = oldpath.replace(/[^\/]+\/?$/g, name);
			console.log('rename', oldpath, newpath);
			fs.renameSync(oldpath, newpath);
		}
	});

});