include
.js({
	handler: 'css::CssHandler',
	parser: ['js.ast::JS', 'util/includeMock']
})
.js('html.js::HtmlBuilder')
.done(function(resp) {

	var UglifyJS = global.UglifyJS || require('uglify-js');
	
	function ast_getBody(code) {
		
		return typeof code === 'string'
			? UglifyJS.parse(code).body
			: code;
	}
	
	function ast_append(ast, code) {
		ast.body = ast.body.concat(ast_getBody(code));
	}
		
	var BuilderHelper = {
			jsRaw: function(solution, stack, output) {
				var includeIndex = ruqq.arr.indexOf(stack, function(x) {
					return x.url.indexOf('include.js') > -1;
				});

				for (var i = 0, x, length = stack.length; i < length; i++) {
					x = stack[i];

					if (i > includeIndex && x.appuri) {
						var s = String.format("include.setCurrent({ id: '#{id}', namespace: '#{namespace}', url: '#{url}'});", {
							id: x.appuri,
							namespace: x.namespace || '',
							url: x.appuri
						});
						output.js.push(s);

					}

					output.js.push(x.content);

					if (i > includeIndex && x.appuri) {
						output.js.push(String.format("include.getResource('%1', 'js').readystatechanged(3);", x.appuri));
					}
				}

				var info = (function() {
					var arr = [];

					function appendInfo(method, object) {
						arr.push(String.format('include.%1(%2);', method, JSON.stringify(object)));
					}

					appendInfo('register', solution.bin);

					return arr.join(io.env.newLine);
				})();


				output.js.splice(includeIndex + 1, 0, info);

				if (solution.type == 'js') {
					output.push(resource.content);
				}
				return (output.js = output.js.join(io.env.newLine + ';'));
			},
			jsAst: function(solution, stack, output) {
				var cfg = solution.config,
					fileName_IncludeJS = cfg && cfg.includejsFile || 'include.js';
				
				var ast = UglifyJS.parse(''),
					includeIndex = ruqq.arr.indexOf(stack, function(x) {
						return x.url.indexOf(fileName_IncludeJS) !== -1;
					});
					
				function embedInfo() {
					var info = (function() {
						var arr = [];

						function appendInfo(method, object) {
							arr.push('include.%1(%2);'.format(
								method,
								object ? JSON.stringify(object) : ''));
						}

						appendInfo('pauseStack');
						appendInfo('register', solution.bin);
						appendInfo('routes', resp.includeMock.toJsonRoutes());
						
						return arr.join(io.env.newLine);
					}());

					ast_append(ast, info);
				}
				
				
				
				
				function defineCurrentInclude(i, resource) {
					if (i <= includeIndex) 
						return false;

					if (resource.info.hasExports)
						return true;

					if (resource.info.IncludeSymbolRef == false)
						return false;

					return true;
				}

				stack.forEach(function(resource, i){
					
                    if (resource.ast == null)
                        return;
					
					if (includeIndex === -1){
						includeIndex = -2;
						embedInfo();
					}

					resp.JS.reduceIncludes(resource);

                    var setCurrentInclude = defineCurrentInclude(i, resource);
					if (setCurrentInclude && resource.appuri) {
						var code = "include.setCurrent({ id: '#{id}', namespace: '#{namespace}', url: '#{url}'});"
							.format({
								id: resource.appuri,
								namespace: resource.namespace || '',
								url: resource.appuri
							});

						ast_append(ast, code);
					}
					
					// define state of all resources that are before include.js as loaded
					if (setCurrentInclude === false) {
						var info = ruqq.arr.first(solution.bin.js, function(info){
							return info.id === resource.id
						});
						
						if (info) 
							info.state = 4;
					}

					
					ast_append(ast, resource.ast.body);
					ast_append(ast, ';');

					

					if (setCurrentInclude && resource.appuri) {
						var code = "include.getResource('%1', 'js').readystatechanged(3);"
							.format(resource.appuri);
						
						ast_append(ast, code);
					}

					if (i == includeIndex) {
						embedInfo();
					}
				});
				
				ast_append(ast, 'include.resumeStack();');

				
				return (output.js = ast);
			},
			js: function() {
				return this.jsAst.apply(this, arguments);
			},
			css: function(solution, stack, output) {
				console.log('Build css... [start]');
				
				stack.forEach(function(resource, i){
					new resp.CssHandler(solution.uri, solution.uris.outputDirectory, resource);
				});
				
				output.css = ruqq.arr.select(stack, 'content').join(io.env.newLine);
				console.log('Build css... [end]');
			},
			lazy: function(solution, stack, output) {
				this.ofType('lazy', solution, stack, output);
			},
			load: function(solution, stack, output) {
				this.ofType('load', solution, stack, output);
			},
			ofType: function(type, solution, stack, output) {
				var stream = [],
					template = "<script type='include/#{type}' id='includejs-#{id}' data-appuri='#{appuri}'> #{content} </script>";
				
				stack.forEach(function(resource, i){
					
					var content = resource.content;
					if (content && typeof content !=='string') {
						content = JSON.stringify(content);
					}
					
					
					stream.push(template.format({
						type: type,
						appuri: resource.namespace || resource.appuri,
						content: content,
						id: resource.id.replace(/\W/g, '')
					}));
				});
				output[type] = stream.join(io.env.newLine);

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

			//-solution.bin[type] = ruqq.arr.select(stack, ['id', 'url', 'namespace']);
			solution.bin[type] = stack.map(function(res){
				
				return {
					id: res.id,
					url: res.url,
					namespace: res.namespace,
					parent: res.parent && res.parent.url
				};
			});
			solution.output[type] = [];

			BuilderHelper[type](solution, stack, solution.output);
		},

		build: function(solution, done) {
            _filesCount = {};
			solution.output = {};
			solution.bin = {};


			this.ofType('css', solution);
			this.ofType('lazy', solution);
			this.ofType('load', solution);
			this.ofType('js', solution);

            
			if (solution.type === 'html')
				resp.HtmlBuilder.build(solution, solution.output);


			done(_filesCount);
		}
	}




	var includesStack = (function() {

		function build(type, includes) {
			if (!(includes && includes.length))
				return null;
			
			var arr = [];
			for (var i = 0; i < includes.length; i++) {

				var resource = includes[i];
				
				if (resource.type == type) {
					arr.push(resource);
				}
				
				var stack = build(type, resource.includes);
				if (stack && stack.length) {
					arr = arr.concat(stack);
				}

				//if (resource.type == type) {
				//	arr.push(resource);
				//}
			}
			return arr;
		}

		function distinct(stack) {
			for (var i = 0; i < stack.length; i++) {
				for (var j = 0; j < i; j++) {
					if (stack[i].url === stack[j].url) {
						stack.splice(i, 1);
						i--;
						break;
					}
				}
			}
			return stack;
		}

		function resolve(type, includes) {
			return distinct(build(type, includes));
			//-return type == '-css' ? stack.reverse() : stack;
		}

		return {
			resolve: resolve,
			distinct: distinct
		}
	}());


});
