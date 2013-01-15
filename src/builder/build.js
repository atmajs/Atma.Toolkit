include.js({
    handler: 'css::CssHandler',    
}).js('html.js::HtmlBuilder').done(function(resp) {

    var G = global,
		Sys = G.sys,
		R = G.ruqq,

		BuilderHelper = {
			js: function(solution, stack, output) {
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
						output.js.push("include.readystatechanged(3)");
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
				output.js = output.js.join(Sys.newLine + ';');
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
						id: x.id.replace(/\W/g,'')
					}));
				}
				output[type] = stream.join(Sys.newLine);
				
			}
		};


	include.exports = {
		ofType: function(type, solution) {
			var stack = includesStack.resolve(type, solution.resource.includes);
			if (!stack.length) {
                return;
            }

			solution.bin[type] = R.arr.select(stack, ['id', 'url', 'namespace']);
			solution.output[type] = [];

			BuilderHelper[type](solution, stack, solution.output);
		},

		build: function(solution, idfr) {
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
	})();


});