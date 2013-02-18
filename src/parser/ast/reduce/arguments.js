include.js([ //
'../../util/includeMock.js::Include', //
'../util.js::AstUtil']).done(function(resp) {


	var util = resp.AstUtil;

	var _scope = null,
		_resource = null,
		_functionName = null,
		_walker = null;

	include.exports = function reduceArguments(resource, functionName, node, scope, walker) {

		_scope = scope;
		_resource = resource;
		_functionName = functionName;
		_walker = walker;

		ruqq.arr.remove(node.args, function(x, i) {
			return canRemove(x);
		});
	}

	function canRemove(arg, namespace) {

		if (arg instanceof Array) {
			var safeToRemove = true;

			ruqq.arr.remove(arg, function(x) {
				var flag = canRemove(x, namespace);
				if (flag == false) {
					safeToRemove = false;
				}
				return flag;
			});

			return safeToRemove;
		}

		switch (arg.TYPE) {
		case 'String':
		case 'Number':
			if (_functionName === 'css') {
				return true;
			}

			var resource = _resource.constructor.getResource(getResourceAppUri(namespace, arg.value)),
				info = resource && resource.info;

			if (info && info.hasIncludes) {
				return false;
			}

			if (_resource.info.hasResponseObject) {
				return hasAccessor(arg.value, namespace) == false;
			}

			return true;

		case 'Object':
			ruqq.arr.remove(arg.properties, function(x) {
				return canRemove(x.value, x.key);
			});
			return arg.properties.length == 0;

		case 'Array':
			ruqq.arr.remove(arg.elements, function(x) {
				return canRemove(x, namespace);
			});
			return arg.elements.length == 0;
		default:

			var value = util.evaluateNode(arg, _scope);

			/** As for now, if expression returns not an object, leave this include at place */
			return typeof value === 'string' && hasAccessor(value, namespace);

		}

		return false;
	}

	function getResourceAppUri(namespace, template) {
		var route = resp.Include.Routes.resolve(namespace, template);
		return global.urlhelper.resolveAppUri(route.path, _resource.appuri);
	}

	function hasAccessor(value, namespace) {
		var route = resp.Include.Routes.resolve(namespace, value),
			alias = route.alias;

		if (!alias) {
			var url = global.urlhelper.resolveAppUri(route.path, _resource.appuri);
			alias = resp.Include.Routes.parseAlias({
				path: url
			});
		}

		if (alias == null) {
			console.error('Undefined alias for resource', namespace, value, route.path);
            return true;
		}

		var _accessors = _resource.info.responseAccessors || [];
		for (var i = 0, x, length = _accessors.length; i < length; i++) {
			x = _accessors[i];

			if (_functionName == 'js') {
				if (x[0] == null || x[0] == alias) {
					return true;
				}
				continue;
			}

			if (x[1] == null) {
				return true;
			}

			if (x[0] == _functionName && x[1] == alias) {
				return true;
			}

		}

		//console.log(color('green{No accessor for}'), value, alias, _functionName, _accessors);


		return false;
	}


});
