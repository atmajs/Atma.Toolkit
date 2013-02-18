include.js(['../util.js::AstUtil','../../util/includeMock.js::Include']).done(function(resp) {

	var util = resp.AstUtil,
		typeOf = util.is.type,
        _info = null;

	include.exports = function parseIncludes(ast) {

		_info = {
			includes: []
		};

		util.each(ast, util.is.includeFunction, function(node, descend) {

			var scope = util.findNode(node, function(node) {
				return typeOf(node, 'AST_SymbolRef') && node.name == 'include';
			}).scope || ast;


			processInclude(node, scope);

			return true;
		});

        return _info;
	}



	function processInclude(node, scope) {

		var arr = [];
		util.each(node, function(node) {
			return typeOf(node, 'AST_Call') && node.start.value == 'include';
		}, function(node) {


			switch (node.expression && node.expression.property) {
			case 'js':
			case 'css':
			case 'load':
			case 'lazy':
			case 'routes':

				var pckg = {
					type: node.expression.property,
					args: util.getArguments(node.args, scope),
				};

				if (pckg.args.length > 0) {
					arr.unshift(pckg);
				}

				break
			case 'done':
			case 'ready':
				processIncludeCallback(node.args && node.args[0]);
				break;
			case 'cfg':
			case 'instance':
			case 'embed':
			case 'plugin':
			case 'ajax':
			case 'promise':
				break;
			default:
				console.log('getIncludes: Unknown expression', node.expression);
				break;
			}
		});

		var resource = new resp.Include();

		ruqq.arr.each(arr, function(x) {
            resource[x.type].apply(resource, x.args);
		});

		_info.includes = _info.includes.concat(resource.includes);

	}


	function processIncludeCallback(Callback) {
		if (typeOf(Callback, 'AST_Function') == false) {
			return;
		}

		var args = Callback.argnames,
			responseObjectName = args.length > 0 ? args[args.length - 1].name : null;

		if ('hasResponseObject' in _info === false) {
			_info.hasResponseObject = !!responseObjectName;
		}

		if (responseObjectName) {
			var names = getPropertyAccessors(responseObjectName, Callback);
			if (names) {
				_info.responseAccessors = (_info.responseAccessors || []).concat(names);
			}
		}

		if (getPropertySetter('exports', Callback) != null) {
			_info.hasExports = true;
		}
	}

	/**
	 *	resolve %name%.propertyAccessor
	 */

	function getPropertyAccessors(name, Fn) {

		var references = [];
		ruqq.arr.each(Fn.body, function(x) {
			util.each(x, function(node) {
				return typeOf(node, 'AST_SymbolRef') && node.name === name;
			}, function(node) {
				var chain = util.getPropertyChain(node, this.stack);

				if (chain) {
					references.push(chain);
				}
			});

		});

		return references;

	}

	/**
	 *	aim to find all **.exports = X
	 */

	function getPropertySetter(name, Fn) {

		var result = null;
		ruqq.arr.each(Fn.body, function(x) {
			util.each(x, function(node) {
				return typeOf(node, 'AST_Assign') && node.left.property === name;
			}, function(node) {

				if (ruqq.arr.isIn(['include', 'module', 'exports'], node.start.value)) {
					result = node;
				}
			});

		});

		return result;
	}

});
