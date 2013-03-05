include.js('io.utils.js::IOUtils').done(function(resp) {

	global.io == null && (global.io = {});

	var utils = resp.IOUtils,
		URI = global.net.URI,
		fs = require('fs');


	io.Directory = Class({
		Construct: function(directory) {

			if (directory == null || directory === '/') {
				this.uri = io.env.currentDir;
			} else {
				this.uri = new URI(directory);
				delete this.uri.file;
			}
		},
		exists: function() {
			return fs.existsSync(this.uri.toLocalDir());
		},
		ensure: function() {
			utils.dir.ensure(this.uri.toLocalDir());
			return this;
		},
		readFiles: function(pattern, exclude) {

			var patterns = parsePatterns(pattern),
                excludes = parsePatterns(exclude);

			this.files = ruqq.arr.map(utils.dir.filesSync(this.uri.toLocalDir(), patterns, excludes), function(x) {
				return new io.File(this.uri.combine(x));
			}.bind(this));

			return this;
		},
		copyTo: function(targetUri, options, index, idfr) {
			if (this.files instanceof Array === false) {
				console.warn('No files to copy');
				return this;
			}

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

	function parseDirs(pattern) {
		if (pattern[0] === '/') {
			pattern = pattern.substring(1);
		}

        var depth = 0,
            dirs = pattern.split('/');

		if (~pattern.indexOf('**')) {
			depth = Infinity;
		}
		else {
            depth = dirs.length;
        }
        // remove file
        dirs.pop();
        for(var i = 0; i < dirs.length; i++){
            if (dirs[i].indexOf('*') == -1){
                continue;
            }
            dirs.splice(i);
        }

        return [depth, dirs.length, dirs.join('/').toLowerCase()];
	}


	function parsePatterns(pattern, out) {
		if (pattern == null) {
			return null;
		}
		if (out == null) {
			out = [];
		}
		if (pattern instanceof Array) {
            ruqq.arr.each(pattern, function(x){
                parsePatterns(x, out);
            })
			return out;
		}
		if (pattern instanceof RegExp) {
			out.push(pattern);
			return out;
		}
		if (typeof pattern === 'string') {

            if (pattern[0] === '/'){
                pattern = pattern.substring(1);
            }

			var depth = null,
                regexp = globToRegex(pattern),
                triple = parseDirs(pattern);

            regexp.depth = triple[0];
            regexp.rootCount = triple[1];
            regexp.root = triple[2];


			out.push(regexp);
			return out;
		}

		console.error('Unsupported pattern', pattern);
		return out;
	}

	function globToRegex(glob) {
		var specialChars = "\\^$*+?.()|{}[]",
			stream = '',
			i = -1,
			length = glob.length;

        glob = glob.replace(/(\*\*\/){2,}/g, '**/');


		while (++i < length) {
			var c = glob[i];
			switch (c) {
			case '?':
				stream += '.';
				break;
			case '*':
				if (glob[i + 1] === '*') {

                    if (i == 0 && /[\\\/]/.test(glob[i + 2])){
                        stream += '.+';
                        i+=2;
                    }

					stream += '.+';
					i++;
					break;
				}

				stream += '[^/]+';
				break;
			case '{':
				var close = glob.indexOf('}', i);
				if (~close) {
					stream += '(' + glob.substring(i + 1, close).replace(/,/g, '|') + ')';
					i = close;
					break;
				}
				stream += c;
				break;
			case '[':
				var close = glob.indexOf(']', i);
				if (~close) {
					stream = glob.substring(i, close);
					i = close;
					break;
				}
				stream += c;
				break;
			default:
				if (~specialChars.indexOf(c)) {
					stream += '\\';
				}
				stream += c;
				break;
			}
		}

		stream = '^' + stream + '$';

		return new RegExp(stream, 'i');
	}

/*{test}

	console.log(globToRegex('*.{png,jpg}').test('file.jpg') == true);
	console.log(globToRegex('*.{png,jpg}').test('sub/file.jpg') == false);
	console.log(globToRegex('**.{png,jpg}').test('sub/file.jpg') == true);
	console.log(globToRegex('*.*').test('file.ext') == true);
*/

});
