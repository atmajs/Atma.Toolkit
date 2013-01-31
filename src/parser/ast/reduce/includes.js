include.js(['arguments.js::reduceArguments', '../util.js::AstUtil', '../../util/IncludeMock.js::Include']).done(function(resp) {



	var _resource = null,
        util = resp.AstUtil,
        typeOf = util.is.type,
        UglifyJS = require('uglify-js');

	include.exports = function reduceIncludes(resource, ast) {
		_resource = resource;

		ast = ast || resource.ast || (resource.ast = util.parse(resource.content));


		searchIncludesForReduce(ast);

		var noMoreIncludes = util.findNode(ast, util.is.includeFunction) == null;

		if (noMoreIncludes) {
			resource.info.IncludeSymbolRef = false;
		} else {
			resource.info.hasIncludes = true;
		}
	};



	function searchIncludesForReduce(ast) {
		util.transform(ast, function(node, descend) {

			if (util.is.includeFunction(node) === false) {
				return;
			}

			var includeRef = util.findNode(node, function(node) {
				return typeOf(node, 'AST_SymbolRef') && node.name == 'include';
			});

			if (!includeRef) {
				return;
			}

			return applyReduce(node, (includeRef.scope || ast));
		});
	}

	function applyReduce(ast, scope) {
		util.transform(ast, function(node, descend) {

			if (node.start != ast.start) {
				searchIncludesForReduce(node);
				return;
			}

			if (typeOf(node, 'AST_SymbolRef') && node.name === 'include') {
				var stack = this.stack,
                    length = stack.length,
					i = length - 1,
                    fns = [];

				if (typeOf(stack[length - 2], 'AST_PropAccess') && typeOf(stack[length - 3], 'AST_Call')) {

					while ((i -= 2) > -1) {
						if (!typeOf(stack[i],'AST_Call')) {
							break;
						}
						fns.push(stack[i].expression.property);
					}


					if (fns.length == 1 && ['done', 'ready'].indexOf(fns[0]) > -1) {
						var args = stack[length - 3].args,
							Callback = args[args.length - 1];

						if (Callback == null) {
							console.error('Seems there is no arguments');
                            return;
						}

						if (typeOf(Callback, ['AST_Function', 'AST_Call'])) {

							ast = new UglifyJS.AST_Call({
								args: [],
								expression: Callback,
								scope: scope || ast
							});
						}
					}
				}
				return;
			}

			if (util.is.includeFunction(node) === false) {
				return;
			}

			var _function = node.expression && node.expression.property;

			switch (_function) {
			case 'css':
			case 'load':
			case 'js':
			case 'lazy':

				resp.reduceArguments(_resource, _function, node, scope, this);

				if (node.args.length == 0) {
					this.stack.splice(this.stack.length - 2);
					descend(node, this);

					return node.expression.expression;
				}
				break;
			}

		});

		return ast;
	}







});
