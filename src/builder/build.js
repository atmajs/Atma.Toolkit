include.js({
	handler: 'css::CssHandler',
	parser: 'js.ast::JS',
}).js('html.js::HtmlBuilder').done(function(resp) {

	var G = global,
		Sys = G.sys,
		R = G.ruqq,
		UglifyJS = require('uglify-js'),
		BuilderHelper = {
			jsRaw: function(solution, stack, output) {
				var includeIndex = R.arr.indexOf(stack, function(x) {
					return x.url.indexOf('include.js') > -1;
				});

				for (var i = 0, x, length = stack.length; i < length; i++) {
					x = stack[i];

					if (i > includeIndex) {
						var s = String.format("include.setCurrent({ id: '#{id}', namespace: '#{namespace}', url: '#{url}'});", {
							id: x.appuri,
							namespace: x.namespace || '',
							url: x.appuri
						});
						output.js.push(s);

					}

					output.js.push(x.content);

					if (i > includeIndex) {
						output.js.push(String.format("include.getResource('%1', 'js').readystatechanged(3);", x.appuri));
					}
				}

				var info = (function() {
					var arr = [];

					function appendInfo(method, object) {
						arr.push(String.format('include.%1(%2);', method, JSON.stringify(object)));
					}

					appendInfo('register', solution.bin);

					return arr.join(Sys.newLine);
				})();


				output.js.splice(includeIndex + 1, 0, info);

				if (solution.type == 'js') {
					output.push(resource.content);
				}
				return (output.js = output.js.join(Sys.newLine + ';'));
			},
			jsAst: function(solution, stack, output) {
				var ast = UglifyJS.parse(''),
					includeIndex = R.arr.indexOf(stack, function(x) {
						return x.url.indexOf('include.js') > -1;
					}),
					embedInfo = function() {
						var info = (function() {
							var arr = [];

							function appendInfo(method, object) {
								arr.push(String.format('include.%1(%2);', method, JSON.stringify(object)));
							}

							appendInfo('register', solution.bin);

							return arr.join(Sys.newLine);
						})();


						ast.body = ast.body.concat(UglifyJS.parse(info).body);
					},

					defineCurrentInclude = function(index, resource) {
						if (i <= includeIndex) {
							return false;
						}

						if (resource.info.hasExports) {
							return true;
						}

						if (resource.info.IncludeSymbolRef == false) {
							return false;
						}

						return true;
					};

				for (var i = 0, resource, length = stack.length; i < length; i++) {
					resource = stack[i];

					resp.JS.reduceIncludes(resource);

                    var setCurrentInclude = defineCurrentInclude(i, resource);
					if (setCurrentInclude) {
						var code = String.format("include.setCurrent({ id: '#{id}', namespace: '#{namespace}', url: '#{url}'});", {
							id: resource.appuri,
							namespace: resource.namespace || '',
							url: resource.appuri
						}),
							body = UglifyJS.parse(code).body;

						ast.body = ast.body.concat(body);
					}



					ast.body = ast.body.concat(resource.ast.body);
					ast.body = ast.body.concat(UglifyJS.parse(';').body);

					if (setCurrentInclude) {
						var code = String.format("include.getResource('%1', 'js').readystatechanged(3);", resource.appuri),
							body = UglifyJS.parse(code).body;

						ast.body = ast.body.concat(body);
					}

					if (i == includeIndex) {
						embedInfo();
					}
				}


				return (output.js = ast);
			},
			js: function() {
				return this.jsAst.apply(this, arguments);
			},
			css: function(solution, stack, output) {
				console.log('Build css... [start]');
				for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {
					new resp.CssHandler(solution.uri, solution.uris.outputDirectory, x);
				}
				output.css = R.arr.select(stack, 'content').join(Sys.newLine);
				console.log('Build css... [end]');
			},
			lazy: function(solution, stack, output) {
				this.ofType('lazy', solution, stack, output);
			},
			load: function(solution, stack, output) {
				this.ofType('load', solution, stack, output);
			},
			ofType: function(type, solution, stack, output) {
				var stream = [];
				for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {
					stream.push(String.format("<script type='include/#{type}' id='includejs-#{id}' data-appuri='#{appuri}'> #{content} </script>", {
						type: type,
						appuri: x.namespace || x.appuri,
						content: x.content,
						id: x.id.replace(/\W/g, '')
					}));
				}
				output[type] = stream.join(Sys.newLine);

			}
		};


    var _filesCount = null;

	include.exports = {
		ofType: function(type, solution) {
			var stack = includesStack.resolve(type, solution.resource.includes),
                length = stack.length;

            _filesCount[type] = length;
			if (length == 0) {
				return;
			}

			solution.bin[type] = R.arr.select(stack, ['id', 'url', 'namespace']);
			solution.output[type] = [];


			BuilderHelper[type](solution, stack, solution.output);
		},

		build: function(solution, idfr) {
            _filesCount = {};
			solution.output = {};
			solution.bin = {};


			this.ofType('css', solution);
			this.ofType('lazy', solution);
			this.ofType('load', solution);
			this.ofType('js', solution);

            if (solution.output.js) {
				new io.File(solution.uris.outputDirectory.combine('script.js')).write(solution.output.js);
			}

			if (solution.output.css) {
				new io.File(solution.uris.outputDirectory.combine('style.css')).write(solution.output.css);
			}

            console.log( //
            color( //
            String.format( //
            'bold{green{Files: [JS: #{js.length}] [CSS: #{css.length}] [LOAD: #{load.length}] [LAZY: #{lazy.length}]}}', _filesCount)));

			resp.HtmlBuilder.build(solution, solution.output);

			new io.File(solution.uris.outputMain).write(solution.output.html);




			idfr.resolve && idfr.resolve();
		}
	}




	var includesStack = (function() {

		function build(type, includes) {
			if (!includes && !includes.length) return null;
			var arr = [];
			for (var i = 0; i < includes.length; i++) {

				var resource = includes[i];
				var stack = build(type, resource.includes);
				if (stack && stack.length) {
					arr = arr.concat(stack);
				}

				if (resource.type == type) {
					arr.push(resource);
				}
			}
			return arr;
		}

		function distinct(stack) {
			for (var i = 0; i < stack.length; i++) {
				for (var j = 0; j < i; j++) {
					if (stack[i].url == stack[j].url) {
						stack.splice(i, 1);
						i--;
						break;
					}
				}
			}
			return stack;
		}

		function resolve(type, includes) {
			var stack = distinct(build(type, includes));
			return type == 'css' ? stack.reverse() : stack;
		}

		return {
			resolve: resolve,
			distinct: distinct
		}
	}());


});
