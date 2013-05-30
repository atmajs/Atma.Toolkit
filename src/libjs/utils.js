(function() {
	var _cache = {};

	/**
	 *  @augments
	 *      1. {String}, {Value},{Value} ... = Template: '%1,%2'
	 *      2. {String}, {Object} = Template: '#{key} #{key2}'
	 */
	String.format = function(str) {

		if (~str.indexOf('#{')) {
			var output = '',
				lastIndex = 0,
				obj = arguments[1];
			while (1) {
				var index = str.indexOf('#{', lastIndex);
				if (index == -1) {
					break;
				}
				output += str.substring(lastIndex, index);
				var end = str.indexOf('}', index);

				output += Object.getProperty(obj, str.substring(index + 2, end));
				lastIndex = ++end;
			}
			output += str.substring(lastIndex);
			return output;
		}

		for (var i = 1; i < arguments.length; i++) {
			var regexp = (_cache[i] || (_cache[i] = new RegExp('%' + i, 'g')));
			str = str.replace(regexp, arguments[i]);
		}
		return str;

	};


	Object.defaults = function(obj, def) {
		for (var key in def) {
			if (obj[key] == null) {
				obj[key] = def[key];
			}
		}
		return obj;
	};

	Object.clear = function(obj, arg) {
		if (arg instanceof Array) {
			for (var i = 0, x, length = arg.length; i < length; i++) {
				x = arg[i];
				if (x in obj) {
					delete obj[x];
				}
			}
		} else if (typeof arg === 'object') {
			for (var key in arg) {
				if (key in obj) {
					delete obj[key];
				}
			}
		}
		return obj;
	};

	Object.extend = function(target, source) {
		if (target == null) {
			target = {};
		}
		if (source == null) {
			return target;
		}
		for (var key in source) {
			if (source[key] != null) {
				target[key] = source[key];
			}
		}
		return target;
	};

	Object.getProperty = function(o, chain) {
		if (chain === '.') {
			return o;
		}

		var value = o,
			props = chain.split('.'),
			i = -1,
			length = props.length;

		while (value != null && ++i < length) {
			value = value[props[i]];
		}

		return value;
	};

	Object.setProperty = function(o, xpath, value) {
		var arr = xpath.split('.'),
			obj = o,
			key = arr[arr.length - 1];
		while (arr.length > 1) {
			var prop = arr.shift();
			obj = obj[prop] || (obj[prop] = {});
		}
		obj[key] = value;
	};

	Object.lazyProperty = function(o, xpath, fn) {

		if (typeof xpath === 'object') {

			for (var key in xpath) {
				Object.lazyProperty(o, key, xpath[key]);
			}

			return;
		}

		var arr = xpath.split('.'),
			obj = o,
			lazy = arr[arr.length - 1];
		while (arr.length > 1) {
			var prop = arr.shift();
			obj = obj[prop] || (obj[prop] = {});
		}
		arr = null;
		obj.__defineGetter__(lazy, function() {
			delete obj[lazy];
			obj[lazy] = fn();
			fn = null;
			return obj[lazy];
		});
	};

	Object.observe = function(obj, property, callback) {
		if (obj.__observers == null) {
			//-obj.__observers = {};
			Object.defineProperty(obj, '__observers', {
				value: {},
				enumerable: false
			});
		}
		if (obj.__observers[property]) {
			obj.__observers[property].push(callback);
			return;
		}
		(obj.__observers[property] || (obj.__observers[property] = []))
			.push(callback);

		var chain = property.split('.'),
			parent = obj,
			key = property;

		if (chain.length > 1) {
			key = chain.pop();
			parent = Object.getProperty(obj, chain);
		}

		var value = parent[key];
		Object.defineProperty(parent, key, {
			get: function() {
				return value;
			},
			set: function(x) {
				value = x;

				var observers = obj.__observers[property];
				for (var i = 0, length = observers.length; i < length; i++) {
					observers[i](x);
				}
			}
		});
	};


	Date.format = function(date, format) {
		if (!format) {
			format = "MM/dd/yyyy";
		}

		function pad(value) {
			return value > 9 ? value : '0' + value;
		}
		format = format.replace("MM", pad(date.getMonth() + 1));
		var _year = date.getFullYear();
		if (format.indexOf("yyyy") > -1) {
			format = format.replace("yyyy", _year);
		} else if (format.indexOf("yy") > -1) {
			format = format.replace("yy", _year.toString()
				.substr(2, 2));
		}

		format = format.replace("dd", pad(date.getDate()));

		if (format.indexOf("HH") > -1) {
			format = format.replace("HH", pad(date.getHours()));
		}
		if (format.indexOf("mm") > -1) {
			format = format.replace("mm", pad(date.getMinutes()));
		}
		if (format.indexOf("ss") > -1) {
			format = format.replace("ss", pad(date.getSeconds()));
		}
		return format;
	};

	RegExp.fromString = function(str, flags) {
		
 	    return new RegExp(str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), flags);
	};


	// obsolete - is it indeed useful ? === (create delegate)
	Function.invoke = function() {
		var arr = Array.prototype.slice.call(arguments),
			obj = arr.shift(),
			fn = arr.shift();
		return function() {
			return obj[fn].apply(obj, arr);
		};

	};

}());