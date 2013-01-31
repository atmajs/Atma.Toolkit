(function(global) {

	var UglifyJS = global.UglifyJS || require('uglify-js'),
		nope = function() {
			return true;
		},
		variableOverrides = null,

		walk = function(node, fn) {
			var walker = new UglifyJS.TreeWalker(function(node, descend) {
				return fn.call(this, node, descend);
			});
			node.walk(walker);
		},

		findNode = function(node, fn, options) {
			var result, intop = true;
			if (!options) {
				options = {};
			}
			walk(node, function(node) {
				if (options.scopeOnly && !intop) {
					if (node instanceof UglifyJS.AST_Scope) {
						return true;
					}
				}
				intop = false;

				if (fn(node)) {
					result = node;
					this.visit = nope;
					return true;
				}
				return null;
			});
			return result;
		},

		each = function(node, selector, fn) {
			walk(node, function(node) {
				return selector(node) ? fn.call(this, node, selector) : null;
			});
		},
		getVariableValue = function(scope, varName) {
			if (variableOverrides && varName in variableOverrides) {
				return variableOverrides[varName];
			}

			var varDef = findNode(scope, function(node) {
				return node instanceof UglifyJS.AST_VarDef && node.name.name == varName;
			}, {
				scopeOnly: true
			});

			if (varDef) {
				return evaluateNode(varDef.value, scope);
			}

			varDef = findNode(scope, function(node) {
				if (node instanceof UglifyJS.AST_Assign && node.left instanceof UglifyJS.AST_SymbolRef && node.left.name == varName) {
					return true;
				}
				return null;
			}, {
				scopeOnly: true
			});

			if (varDef) {
				return evaluateNode(varDef.right, scope);
			}

			return null;
		},
		evaluateNode = function(node, scope) {
			if (scope == null) {
				console.warn('Evaluate Node: Scope is undefined', node);
			}

			switch (node.TYPE) {
			case 'String':
			case 'Number':
				return node.value;
			case 'Array':
				return ruqq.arr.map(Array.prototype.slice.call(node.elements), function(x) {
					return evaluateNode(x, scope);
				});
			case 'Object':
				return ruqq.arr.aggr(node.properties, {}, function(x, aggr) {
					aggr[x.key] = evaluateNode(x.value, scope);
				});
			case 'Binary':
				var left = evaluateNode(node.left, scope),
					right = evaluateNode(node.right, scope);

				if (left == null || right == null) {
					return null;
				}

				switch (node.operator) {
				case '+':
					return left + right;
				case '-':
					return left - right;
				case '*':
					return left * right;
				case '/':
					return left / right;
				default:
					console.error('Unknown operator', node);
				}
				break;
			case 'Assign':
				return evaluateNode(node.right, scope);
			case 'SymbolRef':
				return getVariableValue(scope, node.name);
			}
			console.error('Evaluate Node: Unknown Node', node.TYPE);
			return null;
		},

		getArguments = function(args, scope) {
			if (scope == null) {
				console.warn('getArguments: scope is undefined', args);
			}

			args = Array.prototype.slice.call(args);



			args = ruqq.arr.map(args, function(x) {
				return evaluateNode(x, scope);
			});


			return cleanArgs(args);
		},
		cleanArgs = function(args) {
			for (var i = 0, x, length = args.length; i < length; i++) {
				x = args[i];

				if (x == null) {
					args.splice(i, 1);
					length--;
					i--;
					continue;
				}

				if (Array.isArray(x)) {
					for (var j = 0; j < x.length; j++) {
						if (x[j] == null) {
							x.splice(j, 1);
							j--;
						}
					}
					continue;
				}

				if (typeof x === 'object') {
					var empty = true;
					for (var key in x) {
						if (x.hasOwnProperty(key) == false) {
							continue;
						}

						if (x[key] == null) {
							delete x[key];
							continue;
						}
						empty = false;
					}

					if (empty) {
						args.splice(i, 1);
						length--;
						i--;
					}
				}
			}

			return args;
		},
		getPropertyChain = function(node, stack) {
			if ((node instanceof UglifyJS.AST_SymbolRef) == false) {
				console.warn('Current node is not a sumbol referencing');
			}

			var i = stack.length - 1,
				chain = [],
				key
				while (--i > -1) {
					var x = stack[i];

					if (x instanceof UglifyJS.AST_PropAccess) {
						chain.push(typeof x.property === 'string' ? x.property : x.property.value);
						continue;
					}
					break;
				}

				return chain;
		},

		transform = function(node, fn) {
			var transform = new UglifyJS.TreeTransformer(fn);
			node.transform(transform);
		};



	include.exports = {
		findNode: findNode,
		each: each,
		evaluateNode: evaluateNode,
		getArguments: getArguments,
		getPropertyChain: getPropertyChain,
		parse: function(code) {
			return UglifyJS.parse(code);
		},
		is: {
			includeFunction: function(node) {
				return !!(node instanceof UglifyJS.AST_Call && node.start && node.start.value == 'include');
			},
			type: function(obj, type) {
				if (type instanceof Array) {
					for (var i = 0, length = type.length; i < length; i++) {
						if (obj instanceof UglifyJS[type[i]]) {
							return true;
						}
					}
					return false;
				}

				return obj instanceof UglifyJS[type];
			}
		},
		transform: transform
	};

}(typeof window === 'undefined' ? global : window));
