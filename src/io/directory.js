include.js('io.utils.js::IOUtils').done(function(resp) {

	global.io == null && (global.io = {});

	var utils = resp.IOUtils,
		URI = global.net.URI,
		fs = require('fs');


	io.Directory = Class({
		Construct: function(directory) {

            if (directory == null || directory === '/'){
                this.uri = io.env.currentDir;
            }
            else{
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
		readFiles: function(pattern) {

			var patterns = parsePatterns(pattern);
			this.files = ruqq.arr.map(utils.dir.filesSync(this.uri.toLocalDir(), patterns), function(x) {
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

    function countDepth(pattern){
        if (pattern[0] === '/'){
            pattern = pattern.substring(1);
        }

        if (~pattern.indexOf('**')){
            return Infinity;
        }
        return pattern.split('/').length;
    }

	function parsePatterns(pattern, out) {
        if (pattern == null){
            return null;
        }
		if (out == null) {
			out = [];
		}
		if (pattern instanceof Array) {
			for (var i = 0, x, length = pattern.length; i < length; i++) {
				parsePatterns(pattern[i], out);
			}
			return out;
		}
		if (pattern instanceof RegExp) {
			out.push(pattern);
			return out;
		}
		if (typeof pattern === 'string') {
            var depth, regexp;
            if (pattern[0] === '/'){
                depth = countDepth(pattern = pattern.substring(1));
            }

            regexp = globToRegex(pattern);

            if (depth){
                regexp.depth = depth;
            }

            out.push(regexp);
			return out;
		}

        console.error('Unsupported pattern', pattern);
		return out;
	}

	function globToRegex(glob) {
		var specialChars = "\\^$*+?.()|{}[]",
            regexChars = ["^"],
            c;
		for (var i = 0; i < glob.length; ++i) {
			c = glob.charAt(i);
			switch (c) {
			case '?':
				regexChars.push(".");
				break;
			case '*':
				regexChars.push(".*");
				break;
			default:
				if (specialChars.indexOf(c) >= 0) {
					regexChars.push("\\");
				}
				regexChars.push(c);
                break;
			}
		}
		regexChars.push("$");
		return new RegExp(regexChars.join(""));
	}

});
