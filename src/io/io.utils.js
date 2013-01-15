(function(g) {

	var color;

	include.js({
		helper: 'stdout'
	}).done(function(resp) {
		color = resp.stdout.color;
	});

	var fs = require('fs'),
		fsextra = require('fs.extra'),
		copyFileSync = function(srcFile, destFile) {
			var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
			BUF_LENGTH = 64 * 1024;
			buff = new Buffer(BUF_LENGTH);
			fdr = fs.openSync(srcFile, 'r');
			fdw = fs.openSync(destFile, 'w');
			bytesRead = 1;
			pos = 0;
			while (bytesRead > 0) {
				bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
				fs.writeSync(fdw, buff, 0, bytesRead);
				pos += bytesRead;
			}
			fs.closeSync(fdr);
			return fs.closeSync(fdw);
		},
		walk = function(dir, root, data) {
			var results = [],
				files = fs.readdirSync(dir);

			if (root == null) {
				root = '';
			}
			if (data == null) {
				data = {
					depth: 0,
					maxdepth: Infinity
				}
			}

			var currentDepth = data.depth,
				patterns = data.patterns;

			data.depth++;

			function combine(_1, _2) {
				if (!_1) return _2;
				if (!_2) return _1;
				if (_2[0] == '/') _2 = _2.substring(1);
				if (_1[_1.length - 1] == '/') return _1 + _2;
				return _1 + '/' + _2;
			}

			for (var i = 0, x, length = files.length; i < length; i++) {
				x = files[i];

				if (fs.statSync(combine(dir, x)).isDirectory()) {
					if (data.depth < data.maxdepth) {

						var dirroot = combine(root, x);

						//@TODO if patterns exists chech if this dirroot can be matched by any pattern

						results = results.concat(walk(combine(dir, x), dirroot, data));
					}
					continue;
				}


				var path = combine(root, x),
					match = true;

				if (patterns) {
					match = false;
					for (var _i = 0, _length = patterns.length; _i < _length; _i++) {
						if (patterns[_i].test(path)) {
							match = true;
							break;
						}
					}
				}

				if (match) {
					results.push(path);
				}
			}

			data.depth = currentDepth;

			return results;
		};


	include.exports = {
		file: {
			save: function(path, content) {
				var folder = g.urlhelper.getDir(path);
				if (folder && fs.existsSync(folder) == false) {
					fsextra.mkdirpSync(folder);
				}

				try {
					fs.writeFileSync(path, content);
				} catch (error) {
					console.log(color('red{.save():} red{bold{' + error + '}}'));
				}
			},
			copy: function(from, to, callback) {
				console.assert(from, 'file/copy - invalid copyFrom');
				console.assert(to, 'file/copy - invalid copyTo');


				if (fs.existsSync(from) == false) {
					console.error('file/copy - 404 Error', from);

					callback && callback(404);
				}
				var folder = urlhelper.getDir(to);
				if (fs.existsSync(folder) == false) {
					fsextra.mkdirpSync(folder);
				}

				try {
					fs.copy(from, to, callback);
				} catch (error) {
					console.log(color('red{.copy():} red{bold{' + error + '}}'));
				}
			},
			copySync: function(from, to) {
				if (fs.existsSync(from) == false) {
					console.error('file/copy - 404 Error', from);

				}
				var folder = urlhelper.getDir(to);
				if (fs.existsSync(folder) == false) {
					fsextra.mkdirpSync(folder);
				}

				copyFileSync(from, to);
			},
			exists: function(file) {
				return fs.existsSync(file);
			},
			readSync: function(file, asBuffer) {
				var content = '';
				try {
					content = fs.readFileSync(file, asBuffer ? null : 'utf-8');
				} catch (error) {
					console.log(color('red{.read():} red{bold{' + error + '}}'));
				}

				return content;
			},
			statsSync: function(file) {
				return fs.statSync(file);
			}
		},
		dir: {
			filesSync: function(dir, patterns) {
				return walk(dir, '', {
					depth: 0,
					maxdepth: ruqq.arr.max(patterns, 'depth') || Infinity,
					patterns: patterns
				});
			},
			ensure: function(dir) {
				if (fs.existsSync(dir) == false) {
					fsextra.mkdirpSync(dir);
				}
			}
		}
	}

}(global));