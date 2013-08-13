
// source ../.reference/libjs/class/lib/class.js
(function(root, factory){
	"use strict";

	var _global, _exports;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = _exports = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' ? global : window;
	}
	if (_exports == null) {
		_exports = root || _global;
	}
	
	
	factory(_global, _exports);
	
}(this, function(global, exports){
	"use strict";
	
	var _Array_slice = Array.prototype.slice,
		_Array_sort = Array.prototype.sort;
	
	// source ../src/util/array.js
	function arr_each(array, callback) {
		
		if (arr_isArray(array)) {
			for (var i = 0, imax = array.length; i < imax; i++){
				callback(array[i], i);
			}
			return;
		}
		
		callback(array);
	}
	
	function arr_isArray(array) {
		return array != null
			&& typeof array === 'object'
			&& typeof array.length === 'number'
			&& typeof array.splice === 'function';
	}
	
	if (typeof Array.isArray !== 'function') {
		Array.isArray = function(array){
			if (array instanceof Array){
				return true;
			}
			
			if (array == null || typeof array !== 'object') {
				return false;
			}
			
			
			return array.length !== void 0 && typeof array.slice === 'function';
		};
	}
	// source ../src/util/proto.js
	
	
	var class_inherit = (function() {
		
		var PROTO = '__proto__';
		
		function proto_extend(proto, source) {
			if (source == null) {
				return;
			}
			if (typeof proto === 'function') {
				proto = proto.prototype;
			}
		
			if (typeof source === 'function') {
				source = source.prototype;
			}
			
			for (var key in source) {
				proto[key] = source[key];
			}
		}
		
		var _toString = Object.prototype.toString,
			_isArguments = function(args){
				return _toString.call(args) === '[object Arguments]';
			};
		
		
		function proto_override(proto, key, fn) {
	        var __super = proto[key],
				__proxy = __super == null
					? function() {}
					: function(args){
					
						if (_isArguments(args)) {
							return __super.apply(this, args);
						}
						
						return __super.apply(this, arguments);
					};
	        
	        return function(){
	            this.super = __proxy;
	            
	            return fn.apply(this, arguments);
	        };
	    }
	
		function inherit(_class, _base, _extends, original, _overrides) {
			
			var prototype = original,
				proto = original;
	
			prototype.constructor = _class.prototype.constructor;
	
			if (_extends != null) {
				proto[PROTO] = {};
	
				arr_each(_extends, function(x) {
					proto_extend(proto[PROTO], x);
				});
				proto = proto[PROTO];
			}
	
			if (_base != null) {
				proto[PROTO] = _base.prototype;
			}
	
			
			if (_overrides != null) {
				for (var key in _overrides) {
					prototype[key] = proto_override(prototype, key, _overrides[key]);
				}
			}
			
			_class.prototype = prototype;
		}
	
	
		// browser that doesnt support __proto__ 
		function inherit_protoLess(_class, _base, _extends, original) {
			if (_base != null) {
				var tmp = function() {};
	
				tmp.prototype = _base.prototype;
	
				_class.prototype = new tmp();
				_class.prototype.constructor = _class;
			}
	
			proto_extend(_class.prototype, original);
	
	
			if (_extends != null) {
				arr_each(_extends, function(x) {
					var a = {};
					proto_extend(a, x);
					
					delete a.constructor;
					for (var key in a) {
						_class.prototype[key] = a[key];
					}
				});
			}
		}
	
		return '__proto__' in Object.prototype === true ? inherit : inherit_protoLess;
	
	}());
	
	function proto_getProto(mix) {
		if (typeof mix === 'function') {
			return mix.prototype;
		}
		return mix;
	}
	
	var class_inheritStatics = function(_class, mix){
		if (mix == null) {
			return;
		}
		
		if (typeof mix === 'function') {
			for (var key in mix) {
				if (typeof mix[key] === 'function' && mix.hasOwnProperty(key) && _class[key] == null) {
					_class[key] = mix[key];
				}
			}
			return;
		}
		
		if (Array.isArray(mix)) {
			var imax = mix.length,
				i = 0;
			
			// backwards for proper inhertance flow
			while (imax-- !== 0) {
				class_inheritStatics(_class, mix[i++]);
			}
			return;
		}
		
		if (mix.Static) {
			mix = mix.Static;
			for (var key in mix) {
				if (mix.hasOwnProperty(key) && _class[key] == null) {
					_class[key] = mix[key];
				}
			}
			return;
		}
	};
	
	function class_extendProtoObjects(proto, _base, _extends){
		var key,
			protoValue;
			
		for (key in proto) {
			protoValue = proto[key];
			
			if (!obj_isRawObject(protoValue))
				continue;
			
			if (_base != null){
				if (obj_isRawObject(_base.prototype[key])) 
					obj_defaults(protoValue, _base.prototype[key]);
			}
			
			if (_extends != null) {
				arr_each(_extends, function(x){
					x = proto_getProto(x);
					
					if (obj_isRawObject(x[key])) 
						obj_defaults(protoValue, x[key]);
				});
			}
		}
	}
	// source ../src/util/object.js
	function obj_inherit(target /* source, ..*/ ) {
		if (typeof target === 'function') {
			target = target.prototype;
		}
		var i = 1,
			imax = arguments.length,
			source, key;
		for (; i < imax; i++) {
	
			source = typeof arguments[i] === 'function' ? arguments[i].prototype : arguments[i];
	
			for (key in source) {
				
				if ('Static' === key) {
					if (target.Static != null) {
						
						for (key in target.Static) {
							target.Static[key] = target.Static[key];
						}
						
						continue;
					}
				}
				
				target[key] = source[key];
			}
		}
		return target;
	}
	
	 function obj_getProperty(o, chain) {
		if (typeof o !== 'object' || chain == null) {
			return o;
		}
	
		var value = o,
			props = chain.split('.'),
			length = props.length,
			i = 0,
			key;
	
		for (; i < length; i++) {
			key = props[i];
			value = value[key];
			if (value == null) 
				return value;
			
		}
		return value;
	}
	
	function obj_isRawObject(value) {
		if (value == null) 
			return false;
		
		if (typeof value !== 'object')
			return false;
		
		return value.constructor === Object;
	}
	
	function obj_defaults(value, _defaults) {
		for (var key in _defaults) {
			if (value[key] == null) {
				value[key] = _defaults[key];
			}
		}
		return value;
	}
	
	function obj_extend(target, source) {
		for (var key in source) {
			if (source[key]) 
				target[key] = source[key];
			
		}
		return target;
	}
	
	
	var JSONHelper = {
		toJSON: function(){
			var obj = {},
				key, value;
			
			for (key in this) {
				
				// _ (private)
				if (key.charCodeAt(0) === 95)
					continue;
				
				if ('Static' === key || 'Validate' === key)
					continue;
				
				value = this[key];
				
				if (value == null)
					continue;
				
				if (typeof value === 'function')
					continue;
				
				
				obj[key] = value;
				
			}
			
			return obj;
		}
	};
	
	// source ../src/util/function.js
	function fn_proxy(fn, cntx) {
	
		return function() {
			switch (arguments.length) {
				case 1:
					return fn.call(cntx, arguments[0]);
				case 2:
					return fn.call(cntx,
						arguments[0],
						arguments[1]);
				case 3:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2]);
				case 4:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2],
						arguments[3]);
				case 5:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2],
						arguments[3],
						arguments[4]
						);
			};
			
			return fn.apply(cntx, arguments);
		};
	}
	
	// source ../src/xhr/XHR.js
	var XHR = {};
	
	arr_each(['get', 'del'], function(key){
		XHR[key] = function(path, sender){
			
			this.promise[key](path).then(function(error, response){
				
				if (error) {
					sender.onError(error, response);
					return;
				}
				
				sender.onSuccess(response);
			});
			
		};
	});
	
	arr_each(['post', 'put'], function(key){
		XHR[key] = function(path, data, cb){
			this.promise[key](path, data)
			
			.then(function(error, response){
				cb(error, response);
			});
		};
	});
	
	
	// source ../src/xhr/promise.js
	/*
	 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
	 *  Licensed under the New BSD License.
	 *  https://github.com/stackp/promisejs
	 */
	
	(function(exports) {
	
	    function bind(func, context) {
	        return function() {
	            return func.apply(context, arguments);
	        };
	    }
	
	    function Promise() {
	        this._callbacks = [];
	    }
	
	    Promise.prototype.then = function(func, context) {
	        var f = bind(func, context);
	        if (this._isdone) {
	            f(this.error, this.result);
	        } else {
	            this._callbacks.push(f);
	        }
	    };
	
	    Promise.prototype.done = function(error, result) {
	        this._isdone = true;
	        this.error = error;
	        this.result = result;
	        for (var i = 0; i < this._callbacks.length; i++) {
	            this._callbacks[i](error, result);
	        }
	        this._callbacks = [];
	    };
	
	    function join(funcs) {
	        var numfuncs = funcs.length;
	        var numdone = 0;
	        var p = new Promise();
	        var errors = [];
	        var results = [];
	
	        function notifier(i) {
	            return function(error, result) {
	                numdone += 1;
	                errors[i] = error;
	                results[i] = result;
	                if (numdone === numfuncs) {
	                    p.done(errors, results);
	                }
	            };
	        }
	
	        for (var i = 0; i < numfuncs; i++) {
	            funcs[i]()
	                .then(notifier(i));
	        }
	
	        return p;
	    }
	
	    function chain(funcs, error, result) {
	        var p = new Promise();
	        if (funcs.length === 0) {
	            p.done(error, result);
	        } else {
	            funcs[0](error, result)
	                .then(function(res, err) {
	                funcs.splice(0, 1);
	                chain(funcs, res, err)
	                    .then(function(r, e) {
	                    p.done(r, e);
	                });
	            });
	        }
	        return p;
	    }
	
	    /*
	     * AJAX requests
	     */
	
	    function _encode(data) {
	        var result = "";
	        if (typeof data === "string") {
	            result = data;
	        } else {
	            var e = encodeURIComponent;
	            for (var k in data) {
	                if (data.hasOwnProperty(k)) {
	                    result += '&' + e(k) + '=' + e(data[k]);
	                }
	            }
	        }
	        return result;
	    }
	
	    function new_xhr() {
	        var xhr;
	        if (window.XMLHttpRequest) {
	            xhr = new XMLHttpRequest();
	        } else if (window.ActiveXObject) {
	            try {
	                xhr = new ActiveXObject("Msxml2.XMLHTTP");
	            } catch (e) {
	                xhr = new ActiveXObject("Microsoft.XMLHTTP");
	            }
	        }
	        return xhr;
	    }
	
	    function ajax(method, url, data, headers) {
	        var p = new Promise();
	        var xhr, payload;
	        data = data || {};
	        headers = headers || {};
	
	        try {
	            xhr = new_xhr();
	        } catch (e) {
	            p.done(-1, "");
	            return p;
	        }
	
	        payload = _encode(data);
	        if (method === 'GET' && payload) {
	            url += '?' + payload;
	            payload = null;
	        }
	
	        xhr.open(method, url);
	        xhr.setRequestHeader('Content-type',
	            'application/x-www-form-urlencoded');
	        for (var h in headers) {
	            if (headers.hasOwnProperty(h)) {
	                xhr.setRequestHeader(h, headers[h]);
	            }
	        }
	
	        function onTimeout() {
	            xhr.abort();
	            p.done(exports.promise.ETIMEOUT, "");
	        };
	
	        var timeout = exports.promise.ajaxTimeout;
	        if (timeout) {
	            var tid = setTimeout(onTimeout, timeout);
	        }
	
	        xhr.onreadystatechange = function() {
	            if (timeout) {
	                clearTimeout(tid);
	            }
	            if (xhr.readyState === 4) {
	                if (xhr.status === 200) {
	                    p.done(null, xhr.responseText);
	                } else {
	                    p.done(xhr.status, xhr.responseText);
	                }
	            }
	        };
	
	        xhr.send(payload);
	        return p;
	    }
	
	    function _ajaxer(method) {
	        return function(url, data, headers) {
	            return ajax(method, url, data, headers);
	        };
	    }
	
	    var promise = {
	        Promise: Promise,
	        join: join,
	        chain: chain,
	        ajax: ajax,
	        get: _ajaxer('GET'),
	        post: _ajaxer('POST'),
	        put: _ajaxer('PUT'),
	        del: _ajaxer('DELETE'),
	
	        /* Error codes */
	        ENOXHR: 1,
	        ETIMEOUT: 2,
	
	        /**
	         * Configuration parameter: time in milliseconds after which a
	         * pending AJAX request is considered unresponsive and is
	         * aborted. Useful to deal with bad connectivity (e.g. on a
	         * mobile network). A 0 value disables AJAX timeouts.
	         *
	         * Aborted requests resolve the promise with a ETIMEOUT error
	         * code.
	         */
	        ajaxTimeout: 0
	    };
	
	    if (typeof define === 'function' && define.amd) {
	        /* AMD support */
	        define(function() {
	            return promise;
	        });
	    } else {
	        exports.promise = promise;
	    }
	
	
	})(XHR);
	
	// source ../src/business/Serializable.js
	function Serializable(data) {
		
		if (data == null || typeof data !== 'object')
			return;
		
		for (var key in data) {
			if (data[key] == null)
				continue;
			
			this[key] = data[key];
		}
		
	}
	
	Serializable.prototype = {
		constructor: Serializable,
		
		serialize: function() {
			return JSON.stringify(this);
		},
		
		deserialize: function(json) {
			
			if (typeof json === 'string') 
				json = JSON.parse(json);
			
			
			for (var key in json) 
				this[key] = json[key];
			
			return this;
		}
	};
	
	
	// source ../src/business/Route.js
	/**
	 *	var route = new Route('/user/:id');
	 *
	 *	route.create({id:5}) // -> '/user/5'
	 */
	var Route = (function(){
		
		
		function Route(route){
			this.route = route_parse(route);
		};
		
		Route.prototype = {
			constructor: Route,
			create: function(object){
				var path, query;
				
				path = route_interpolate(this.route.path, object, '/');
				if (path == null) {
					return null;
				}
				
				if (this.route.query) {
					query = route_interpolate(this.route.query, object, '&');
					if (query == null) {
						return null;
					}
				}
				
				return path + (query ? '?' + query : '');
			}
		};
		
		var regexp_pathByColon = /^([^:\?]*)(\??):(\??)([\w]+)$/,
			regexp_pathByBraces = /^([^\{\?]*)(\{(\??)([\w]+)\})?([^\s]*)?$/;
		
		function parse_single(string) {
			var match = regexp_pathByColon.exec(string);
			
			if (match) {
				return {
					optional: (match[2] || match[3]) === '?',
					parts: [match[1], match[4]]
				};
			}
			
			match = regexp_pathByBraces.exec(string);
			
			if (match) {
				return {
					optional: match[3] === '?',
					parts: [match[1], match[4], match[5]]
				};
			}
			
			console.error('Paths breadcrumbs should be match by regexps');
			return { parts: [string] };
		}
		
		function parse_path(path, delimiter) {
			var parts = path.split(delimiter);
			
			for (var i = 0, imax = parts.length; i < imax; i++){
				parts[i] = parse_single(parts[i]);
			}
			
			return parts;
		}
		
		function route_parse(route) {
			var question = /[^\:\{]\?[^:]/.exec(route),
				query = null;
			
			if (question){
				question = question.index + 1;
				query = route.substring(question + 1);
				route = route.substring(0, question);
			}
			
			
			return {
				path: parse_path(route, '/'),
				query: query == null ? null : parse_path(query, '&')
			};
		}
		
		/** - route - [] */
		function route_interpolate(breadcrumbs, object, delimiter) {
			var route = [],
				key,
				parts;
			
			
			for (var i = 0, x, imax = breadcrumbs.length; i < imax; i++){
				x = breadcrumbs[i];
				parts = x.parts.slice(0);
				
				if (parts[1] == null) {
					// is not an interpolated breadcrumb
					route.push(parts[0]);
					continue;
				}
				
				key = parts[1];
				parts[1] = object[key];
				
				if (parts[1] == null){
				
					if (!x.optional) {
						console.error('Object has no value, for not optional part - ', key);
						return null;
					}
					
					continue;
				}
				
				route.push(parts.join(''));
			}
			
			return route.join(delimiter);
		}
		
		
		return Route;
	}());
	// source ../src/business/Deferred.js
	var DeferredProto = {
		_isAsync: true,
			
		_done: null,
		_fail: null,
		_always: null,
		_resolved: null,
		_rejected: null,
		
		deferr: function(){
			this._rejected = null;
			this._resolved = null;
		},
		
		resolve: function() {
			this._fail = null;
			this._resolved = arguments;
	
			var cbs = this._done,
				imax = cbs && cbs.length,
				i = 0;
			if (cbs) {
				while (imax-- !== 0) {
					cbs[i++].apply(this, arguments);
				}
				this._done = null;
			}
	
			cbs = this._always;
			imax = cbs && cbs.length,
			i = 0;
			if (cbs) {
				while (imax-- !== 0) {
					cbs[i++].apply(this, this);
				}
				this._always = null;
			}
	
			return this;
		},
		reject: function() {
			this._done = null;
			this._rejected = arguments;
	
			var cbs = this._fail,
				imax = cbs && cbs.length,
				i = 0;
			if (cbs) {
				while (imax-- !== 0) {
					cbs[i++].apply(this, arguments);
				}
				this._fail = null;
			}
	
			cbs = this._always;
			imax = cbs && cbs.length,
			i = 0;
			if (cbs) {
				while (imax-- !== 0) {
					cbs[i++].apply(this, this);
				}
				this._always = null;
			}
	
			return this;
		},
	
		done: function(callback) {
			
			if (this._resolved != null)
				callback.apply(this, this._resolved);
			else
				(this._done || (this._done = [])).push(callback);
	
	
			return this;
		},
		fail: function(callback) {
			
			if (this._rejected != null)
				callback.apply(this, this._rejected);
			else
				(this._fail || (this._fail = [])).push(callback);
	
	
			return this;
		},
		always: function(callback) {
			if (this._rejected != null || this._resolved != null)
				callback.apply(this, this);
			else
				(this._always || (this._always = [])).push(callback);
	
			return this;
		},
	};
	// source ../src/business/EventEmitter.js
	var EventEmitter = (function(){
	 
		function Emitter() {
			this._listeners = {};
		}
	 
		
	    Emitter.prototype = {
	        constructor: Emitter,
			
	        on: function(event, callback) {
	            (this._listeners[event] || (this._listeners[event] = [])).push(callback);
	            return this;
	        },
	        once: function(event, callback){
	            callback._once = true;
	            (this._listeners[event] || (this._listeners[event] = [])).push(callback);
	            return this;
	        },
			
			pipe: function(event){
				var that = this,
					slice = Array.prototype.slice, 
					args;
				return function(){
					args = slice.call(arguments);
					args.unshift(event);
					that.trigger.apply(that, args);
				};
			},
	        
	        trigger: function() {
	            var args = Array.prototype.slice.call(arguments),
	                event = args.shift(),
	                fns = this._listeners[event],
	                fn, imax, i = 0;
	                
	            if (fns == null)
					return this;
				
				for (imax = fns.length; i < imax; i++) {
					fn = fns[i];
					fn.apply(this, args);
					
					if (fn._once === true){
						fns.splice(i,1);
						i--;
						length--;
					}
				}
			
	            return this;
	        },
	        off: function(event, callback) {
	            if (this._listeners[event] == null)
					return this;
					
				var arr = this._listeners[event],
					imax = arr.length,
					i = 0;
					
				for (; i < imax; i++) {
					
					if (arr[i] === callback) 
						arr.splice(i, 1);
					
					i--;
					length--;
				}
			
	            return this;
			}
	    };
	    
	    return Emitter;
	    
	}());
	
	// source ../src/business/Validation.js
	var Validation = (function(){
		
		
		function val_check(instance, validation) {
			if (typeof validation === 'function') 
				return validation.call(instance);
			
			var result;
			
			for (var property in validation) {
				
				result = val_checkProperty(instance, property, validation[property]);
				
				if (result)
					return result;
			}
		}
		
		
		function val_checkProperty(instance, property, checker) {
			var value = obj_getProperty(instance, property);
			
			return checker.call(instance, value);
		}
		
		
		function val_process(instance) {
			var result;
			
			
			if (instance.Validate != null) {
				result  = val_check(instance, instance.Validate);
				if (result)
					return result;
			}
			
			// @TODO Do nest recursion check ?
			//
			//for (var key in instance) {
			//	if (instance[key] == null || typeof instance !== 'object' ) 
			//		continue;
			//	
			//	result = val_process(instance, instance[key].Validate)
			//}
			
		}
		
		return {
			validate: val_process
		};
		
	}());
	
	
	// source ../src/collection/Collection.js
	var Collection = (function(){
		
		// source ArrayProto.js
		
		var ArrayProto = (function(){
		
			function check(x, mix) {
				if (mix == null)
					return false;
				
				if (typeof mix === 'function') 
					return mix(x);
				
				if (typeof mix === 'object'){
					
					if (x.constructor === mix.constructor && x.constructor !== Object) {
						return x === mix;
					}
					
					var value, matcher;
					for (var key in mix) {
						
						value = x[key];
						matcher = mix[key];
						
						if (typeof matcher === 'string') {
							var c = matcher[0],
								index = 1;
							
							if ('<' === c || '>' === c){
								
								if ('=' === matcher[1]){
									c +='=';
									index++;
								}
								
								matcher = matcher.substring(index);
								
								switch (c) {
									case '<':
										if (value >= matcher)
											return false;
										continue;
									case '<=':
										if (value > matcher)
											return false;
										continue;
									case '>':
										if (value <= matcher)
											return false;
										continue;
									case '>=':
										if (value < matcher)
											return false;
										continue;
								}
							}
						}
						
						// eqeq to match by type diffs.
						if (value != matcher) 
							return false;
						
					}
					return true;
				}
				
				console.warn('No valid matcher', mix);
				return false;
			}
		
			var ArrayProto = {
				push: function(/*mix*/) {
					for (var i = 0, imax = arguments.length; i < imax; i++){
						
						this[this.length++] = create(this._constructor, arguments[i]);
					}
					
					return this;
				},
				pop: function() {
					var instance = this[--this.length];
			
					this[this.length] = null;
					return instance;
				},
				shift: function(){
					if (this.length === 0) 
						return null;
					
					
					var first = this[0],
						imax = this.length - 1,
						i = 0;
					
					for (; i < imax; i++){
						this[i] = this[i + 1];
					}
					
					this[imax] = null;
					this.length--;
					
					return first;
				},
				unshift: function(mix){
					this.length++;
					
					var imax = this.length;
					
					while (--imax) {
						this[imax] = this[imax - 1];
					}
					
					this[0] = create(this._constructor, mix);
					return this;
				},
				
				splice: function(index, count /* args */){
					var i, imax, length, y;
					
					
					// clear range after length until index
					if (index >= this.length) {
						count = 0;
						for (i = this.length, imax = index; i < imax; i++){
							this[i] = void 0;
						}
					}
					
					var	rm_count = count,
						rm_start = index,
						rm_end = index + rm_count,
						add_count = arguments.length - 2,
						
						new_length = this.length + add_count - rm_count;
					
					
					// move block
					
					var block_start = rm_end,
						block_end = this.length,
						block_shift = new_length - this.length;
					
					if (0 < block_shift) {
						// move forward
						
						i = block_end;
						while (--i >= block_start) {
							
							this[i + block_shift] = this[i];
							
						}
		
					}
					
					if (0 > block_shift) {
						// move backwards
						
						i = block_start;				
						while (i < block_end) {
							this[i + block_shift] = this[i];
							i++;
						}
					}
					
					// insert
					
					i = rm_start;
					y = 2;
					for (; y < arguments.length; y) {
						this[i++] = create(this._constructor, arguments[y++]);
					}
					
					
					this.length = new_length;
					return this;
				},
				
				slice: function(){
					return _Array_slice.apply(this, arguments);
				},
				
				sort: function(fn){
					_Array_sort.call(this, fn);
					return this;
				},
				
				reverse: function(){
					var array = _Array_slice.call(this, 0);
						
					for (var i = 0, imax = this.length; i < imax; i++){
						this[i] = array[imax - i - 1];
					}
					return this;
				},
				
				toString: function(){
					return _Array_slice.call(this, 0).toString()
				},
				
				each: function(fn, cntx){
					for (var i = 0, imax = this.length; i < imax; i++){
						
						fn.call(cntx || this, this[i], i);
						
					}
				},
				
				
				where: function(mix){
					
					var collection = new this.constructor();
					
					for (var i = 0, x, imax = this.length; i < imax; i++){
						x = this[i];
						
						if (check(x, mix)) {
							collection[collection.length++] = x;
						}
					}
					
					return collection;
				},
				remove: function(mix){
					var index = -1,
						array = [];
					for (var i = 0, imax = this.length; i < imax; i++){
						
						if (check(this[i], mix)) {
							array.push(this[i]);
							continue;
						}
						
						this[++index] = this[i];
					}
					for (i = ++index; i < imax; i++) {
						this[i] = null;
					}
					
					this.length = index;
					return array;
				},
				first: function(mix){
					if (mix == null)
						return this[0];
					
					var imax = this.length,
						i = 0;
					while (--imax !== -1) {
						if (check(this[i++], mix))
							return this[i - 1];
					}
					return null;
				},
				last: function(mix){
					if (mix == null)
						return this[0];
					
					var imax = this.length;
					while (--imax !== -1) {
						if (check(this[imax], mix))
							return this[imax];
					}
					return null;
				}
			};
			
			
			return ArrayProto;
		}());
		
		
		function create(Constructor, mix) {
			
			if (mix instanceof Constructor) 
				return mix;
			
			return new Constructor(mix);
		}
		
		var CollectionProto = {
			serialize: function(){
				return JSON.stringify(this.toArray());
			},
			
			deserialize: function(mix){
				for (var i = 0, imax = mix.length; i < imax; i++){
					this[this.length++] = create(this._constructor, mix[i]);
				}
				
				return this;
			},
			
			del: function(mix){
				
				if (mix == null && arguments.length !== 0) {
					console.error('Collection.del - selector is specified, but is undefined');
					return this;
				}
				
				if (mix == null) {
					
					for (var i = 0, imax = this.length; i < imax; i++){
						this[i] = null;
					}
					this.length = 0;
					
					LocalStore.prototype.del.call(this);
					return this;
				}
				
				var array = this.remove(mix);
				if (array.length === 0) 
					return this;
				
				return this.save();
			},
			
			toArray: function(){
				var array = new Array(this.length);
				for (var i = 0, imax = this.length; i < imax; i++){
					array[i] = this[i];
				}
				
				return array;
			}	
		};
		
		function overrideConstructor(baseConstructor, Child) {
			
			return function CollectionConstructor(){
				this.length = 0;
				this._constructor = Child;
				
				if (baseConstructor != null)
					return baseConstructor.apply(this, arguments);
				
				return this;
			};
			
		}
		
		function Collection(Child, Proto) {
			
			Proto.Construct = overrideConstructor(Proto.Construct, Child);
			
			
			obj_inherit(Proto, CollectionProto, ArrayProto);
			return Class(Proto);
		}
		
		
		return Collection;
	}());
	
	// source ../src/store/Store.js
	var StoreProto = {
		
		// Serialization
		deserialize: function(json) {
			
			if (typeof json === 'string') 
				json = JSON.parse(json);
			
			
			for (var key in json) 
				this[key] = json[key];
			
			return this;
		},
		serialize: function() {
			return JSON.stringify(this);
		},
		
		
		// Abstract
		
		fetch: null,
		save: null,
		del: null,
		onSuccess: null,
		onError: null,
		
		Static: {
			fetch: function(data){
				return new this().fetch(data);
			}
		}
	};
	// source ../src/store/Remote.js
	/**
	 *	Alpha - Test - End
	 */
	
	var Remote = (function(){
		
		var XHRRemote = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(XHRRemote, StoreProto, DeferredProto, {
			
			fetch: function(data){
				XHR.get(this._route.create(data || this), this);
				return this;
			},
			
			save: function(callback){
				XHR.post(this._route.create(this), this.serialize(), callback);
			},
			
			del: function(callback){
				XHR.del(this._route.create(this), this.serialize(), callback);
			},
			
			onSuccess: function(response){
				var json;
				
				try {
					json = JSON.parse(response);	
				} catch(error) {
					this.onError(error);
					return;
				}
				
				
				this.deserialize(json);
				this.resolve(this);
			},
			onError: function(error){
				this.reject({
					error: error
				});
			}
			
			
		});
		
		
		
		return function(route){
			
			return new XHRRemote(route);
			
		};
		
	}());
	// source ../src/store/LocalStore.js
	var LocalStore = (function(){
		
		var LocalStore = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(LocalStore, StoreProto, DeferredProto, {
			
			fetch: function(data){
				
				var path = this._route.create(data || this),
					object = localStorage.getItem(path);
				
				if (object == null) {
					this.resolve(this);
					return this;
				}
				
				if (typeof object === 'string'){
					try {
						object = JSON.parse(object);
					} catch(e) {
						this.onError(e);
					}
				}
				
				this.deserialize(object);
				
				return this.resolve(this);
			},
			
			save: function(callback){
				var path = this._route.create(this),
					store = this.serialize();
				
				localStorage.setItem(path, store);
				callback && callback();
				return this;
			},
			
			del: function(data){
				var path = this._route.create(data || this);
				
				localStorage.removeItem(path);
				return this;
			},
			
			onError: function(error){
				this.reject({
					error: error
				});
			}
			
			
		});
		
		
		
		var Constructor = function(route){
			
			return new LocalStore(route);
			
		};
		
		Constructor.prototype = LocalStore.prototype;
		
		
		return Constructor;
	
	}());
	
	
	// source ../src/Class.js
	var Class = function(data) {
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null,
			_store = data.Store,
			_self = data.Self,
			_overrides = data.Override,
			
			key;
	
		if (_base != null) {
			delete data.Base;
		}
		if (_extends != null) {
			delete data.Extends;
		}
		if (_static != null) {
			delete data.Static;
		}
		if (_self != null) {
			delete data.Self;
		}
		if (_construct != null) {
			delete data.Construct;
		}
		
		if (_store != null) {
			
			if (_extends == null) {
				_extends = _store;
			} else if (Array.isArray(_extends)) {
				_extends.push(_store)
			} else {
				_extends = [_extends, _store];
			}
			
			delete data.Store;
		}
		
		if (_overrides != null) {
			delete data.Override;
		}
		
		if (data.toJSON === void 0) {
			data.toJSON = JSONHelper.toJSON;
		}
	
	
		if (_base == null && _extends == null && _self == null) {
			if (_construct == null) {
				_class = function() {};
			} else {
				_class = _construct;
			}
	
			data.constructor = _class.prototype.constructor;
	
			if (_static != null) {
				for (key in _static) {
					_class[key] = _static[key];
				}
			}
	
			_class.prototype = data;
			return _class;
	
		}
	
		_class = function() {
	
			if (_extends != null) {
				var isarray = _extends instanceof Array,
					length = isarray ? _extends.length : 1,
					x = null;
				for (var i = 0; isarray ? i < length : i < 1; i++) {
					x = isarray ? _extends[i] : _extends;
					if (typeof x === 'function') {
						x.apply(this, arguments);
					}
				}
			}
	
			if (_base != null) {
				_base.apply(this, arguments);
			}
			
			if (_self != null) {
				for (var key in _self) {
					this[key] = fn_proxy(_self[key], this);
				}
			}
	
			if (_construct != null) {
				var r = _construct.apply(this, arguments);
				if (r != null) {
					return r;
				}
			}
			return this;
		};
	
		if (_static != null) {
			for (key in _static) {
				_class[key] = _static[key];
			}
		}
		
		if (_base != null) {
			class_inheritStatics(_class, _base);
		}
		
		if (_extends != null) {
			class_inheritStatics(_class, _extends);
		}
	
		class_extendProtoObjects(data, _base, _extends);
		class_inherit(_class, _base, _extends, data, _overrides);
	
	
		data = null;
		_static = null;
	
		return _class;
	};
	// source ../src/Class.Static.js
	/**
	 * Can be used in Constructor for binding class's functions to class's context
	 * for using, for example, as callbacks
	 */
	Class.bind = function(cntx) {
		var arr = arguments,
			i = 1,
			length = arguments.length,
			key;
	
		for (; i < length; i++) {
			key = arr[i];
			cntx[key] = cntx[key].bind(cntx);
		}
		return cntx;
	};
	
	Class.Remote = Remote;
	Class.LocalStore = LocalStore;
	Class.Collection = Collection;
	
	Class.Serializable = Serializable;
	Class.Deferred = DeferredProto;
	Class.EventEmitter = EventEmitter;
	
	Class.validate = Validation.validate;
	
	
	// source ../src/fn/fn.js
	(function(){
		
		// source memoize.js
		
		
		function args_match(a, b) {
			if (a.length !== b.length) 
				return false;
			
			var imax = a.length,
				i = 0;
			
			for (; i < imax; i++){
				if (a[i] !== b[i])
					return false;
			}
			
			return true;
		}
		
		function args_id(store, args) {
		
			if (args.length === 0)
				return 0;
		
			
			for (var i = 0, imax = store.length; i < imax; i++) {
				
				if (args_match(store[i], args))
					return i + 1;
			}
			
			store.push(args);
			return store.length;
		}
		
		
		function fn_memoize(fn) {
		
			var _cache = {},
				_args = [];
				
			return function() {
		
				var id = args_id(_args, arguments);
		
				
				return _cache[id] == null
					? (_cache[id] = fn.apply(this, arguments))
					: _cache[id];
			};
		}
		
		
		function fn_resolveDelegate(cache, cbs, id) {
			
			return function(){
				cache[id] = arguments;
				
				for (var i = 0, x, imax = cbs[id].length; i < imax; i++){
					x = cbs[id][i];
					x.apply(this, arguments);
				}
				
				cbs[i] = null;
				cache = null;
				cbs = null;
			};
		}
		
		function fn_memoizeAsync(fn) {
			var _cache = {},
				_cacheCbs = {},
				_args = [];
				
			return function(){
				
				var args = Array.prototype.slice.call(arguments),
					callback = args.pop();
				
				var id = args_id(_args, args);
				
				if (_cache[id]){
					callback.apply(this, _cache[id])
					return; 
				}
				
				if (_cacheCbs[id]) {
					_cacheCbs[id].push(callback);
					return;
				}
				
				_cacheCbs[id] = [callback];
				
				args = Array.prototype.slice.call(args);
				args.push(fn_resolveDelegate(_cache, _cacheCbs, id));
				
				fn.apply(this, args);
			};
		}
		
			
			
		
		
		Class.Fn = {
			memoize: fn_memoize,
			memoizeAsync: fn_memoizeAsync
		};
		
	}());
	
	exports.Class = Class;
	
}));

// source ../.reference/libjs/atma-tool/src/helper/colorize.js
(function() {
	
	/**
	 *	String.prototype
	 *			.red
	 *			.green
	 *			.yellow
	 *			.blue
	 *			.magento
	 *			.cyan
	 *			.bold
	 *			.italic
	 *			.underline
	 *			.inverse
	 *
	 *			.colorize()
	 */

    function replacement(value) {
        return START + value + '$1' + END;
    }

    var START = '\u001b[',
        END = '\u001b[0m',
        
        colors = {
            red: '31m',
            green: '32m',
            yellow: '33m',
            blue: '34m',
            magenta: '35m',
            cyan: '36m',
            
    
            bold: '1m',
            italic: '3m',
            underline: '4m',
            inverse: '7m'
        };
    
	function color(str) {

		for (var key in colors) {
			str = str.replace(new RegExp(key + '\\{([^\\}]+)\\}', 'g'), replacement(colors[key]));
		}

		return str;
    }

	
	Object.keys(colors).forEach(function(key){
		
		Object.defineProperty(String.prototype, key, {
			get: function(){
				return START + colors[key] + this + END
			},
			enumerable: false
		});
		
	});
	
	String.prototype.colorize = function(){
		return color(this);
	};

    
}());    

// source ../.reference/libjs/include/lib/include.js

// source ../src/head.js
(function (root, factory) {
    'use strict';

	var _global, _exports, _document;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = _exports = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' ? global : window;
	}
	if (_exports == null) {
		_exports = root || _global;
	}
	
	_document = _global.document;
	
	
	factory(_global, _exports, _document);

}(this, function (global, exports, document) {
    'use strict';


	// source ../src/1.scope-vars.js
	
	/**
	 *	.cfg
	 *		: path :=	root path. @default current working path, im browser window.location;
	 *		: eval := in node.js this conf. is forced
	 *		: lockedToFolder := makes current url as root path
	 *			Example "/script/main.js" within this window.location "{domain}/apps/1.html"
	 *			will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
	 */
	
	var bin = {},
		isWeb = !! (global.location && global.location.protocol && /^https?:/.test(global.location.protocol)),
		reg_subFolder = /([^\/]+\/)?\.\.\//,
		cfg = {
			path: null,
			loader: null,
			version: null,
			lockedToFolder: null,
			sync: null,
			eval: document == null
		},
		handler = {},
		hasOwnProp = {}.hasOwnProperty,
		__array_slice = Array.prototype.slice,
		
		XMLHttpRequest = global.XMLHttpRequest;
	
		 
	// source ../src/2.Helper.js
	var Helper = { /** TODO: improve url handling*/
		
		reportError: function(e) {
			console.error('IncludeJS Error:', e, e.message, e.url);
			typeof handler.onerror === 'function' && handler.onerror(e);
		}
		
	},
	
		XHR = function(resource, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				xhr.readyState === 4 && callback && callback(resource, xhr.responseText);
			};
	
			xhr.open('GET', typeof resource === 'object' ? resource.url : resource, true);
			xhr.send();
		};
	
	
	// source ../src/utils/fn.js
	function fn_proxy(fn, ctx) {
		
		return function(){
			fn.apply(ctx, arguments);
		};
		
	}
	
	function fn_doNothing(fn) {
		typeof fn === 'function' && fn();
	}
	// source ../src/utils/object.js
	function obj_inherit(target /* source, ..*/ ) {
		if (typeof target === 'function') {
			target = target.prototype;
		}
		var i = 1,
			imax = arguments.length,
			source, key;
		for (; i < imax; i++) {
	
			source = typeof arguments[i] === 'function'
				? arguments[i].prototype
				: arguments[i];
	
			for (key in source) {
				target[key] = source[key];
			}
		}
		return target;
	}
	// source ../src/utils/array.js
	function arr_invoke(arr, args, ctx) {
	
		if (arr == null || arr instanceof Array === false) {
			return;
		}
	
		for (var i = 0, length = arr.length; i < length; i++) {
			if (typeof arr[i] !== 'function') {
				continue;
			}
			if (args == null) {
				arr[i].call(ctx);
			}else{
				arr[i].apply(ctx, args);
			}
		}
	
	}
	
	function arr_ensure(obj, xpath) {
		if (!xpath) {
			return obj;
		}
		var arr = xpath.split('.'),
			imax = arr.length - 1,
			i = 0,
			key;
	
		for (; i < imax; i++) {
			key = arr[i];
			obj = obj[key] || (obj[key] = {});
		}
	
		key = arr[imax];
		return obj[key] || (obj[key] = []);
	}
	// source ../src/utils/path.js
	function path_getDir(url) {
		var index = url.lastIndexOf('/');
		return index === -1 ? '' : url.substring(index + 1, -index);
	}
	
	function path_resolveCurrent() {
	
		if (document == null) {
			return typeof module === 'undefined'
				? '' 
				: path_win32Normalize(module.parent.filename);
		}
		var scripts = document.getElementsByTagName('script'),
			last = scripts[scripts.length - 1],
			url = last && last.getAttribute('src') || '';
			
		return (url[0] === '/') ? url : '/' + url;
	}
	
	function path_win32Normalize(path){
		path = path.replace(/\\/g, '/');
		if (path.substring(0, 5) === 'file:'){
			return path;
		}
	
		return 'file:///' + path;
	}
	
	function path_resolveUrl(url, parent) {
		if (cfg.path && url[0] === '/') {
			url = cfg.path + url.substring(1);
		}
	
		switch (url.substring(0, 5)) {
			case 'file:':
			case 'http:':
				return url;
		}
	
		if (url.substring(0, 2) === './') {
			url = url.substring(2);
		}
	
	
		if (url[0] === '/') {
			if (isWeb === false || cfg.lockedToFolder === true) {
				url = url.substring(1);
			}
		} else if (parent != null && parent.location != null) {
			url = parent.location + url;
		}
	
	
		while (url.indexOf('../') !== -1) {
			url = url.replace(reg_subFolder, '');
		}
	
		return url;
	}
	
	function path_isRelative(path) {
		var c = path.charCodeAt(0);
		
		switch (c) {
			case 47:
				// /
				return false;
			case 102:
				// f
			case 104:
				// h
				return /^file:|https?:/.test(path) === false;
		}
		
		return true;
	}
	
	function path_getExtension(path) {
		var query = path.indexOf('?');
		if (query === -1) {
			return path.substring(path.lastIndexOf('.') + 1);
		}
		
		return path.substring(path.lastIndexOf('.', query) + 1, query);
	}
	
	// source ../src/2.Routing.js
	var RoutesLib = function() {
	
		var routes = {},
			regexpAlias = /([^\\\/]+)\.\w+$/;
	
		
			
		return {
			/**
			 *	@param route {String} = Example: '.reference/libjs/{0}/{1}.js'
			 */
			register: function(namespace, route, currentInclude) {
				
				if (typeof route === 'string' && path_isRelative(route)) {
					var res = currentInclude || include,
						location = res.location || path_getDir(res.url || path_resolveCurrent());
						
					if (path_isRelative(location)) {
						location = '/' + location;
					}
					
					route = location + route;
				}
	
				routes[namespace] = route instanceof Array ? route : route.split(/[\{\}]/g);
	
			},
	
			/**
			 *	@param {String} template = Example: 'scroller/scroller.min?ui=black'
			 */
			resolve: function(namespace, template) {
				var questionMark = template.indexOf('?'),
					aliasIndex = template.indexOf('::'),
					alias,
					path,
					params,
					route,
					i,
					x,
					length,
					arr;
					
				
				if (aliasIndex !== -1){
					alias = template.substring(aliasIndex + 2);
					template = template.substring(0, aliasIndex);
				}
				
				if (questionMark !== -1) {
					arr = template.substring(questionMark + 1).split('&');
					params = {};
					
					for (i = 0, length = arr.length; i < length; i++) {
						x = arr[i].split('=');
						params[x[0]] = x[1];
					}
	
					template = template.substring(0, questionMark);
				}
	
				template = template.split('/');
				route = routes[namespace];
				
				if (route == null){
					return {
						path: template.join('/'),
						params: params,
						alias: alias
					};
				}
				
				path = route[0];
				
				for (i = 1; i < route.length; i++) {
					if (i % 2 === 0) {
						path += route[i];
					} else {
						/** if template provides less "breadcrumbs" than needed -
						 * take always the last one for failed peaces */
						
						var index = route[i] << 0;
						if (index > template.length - 1) {
							index = template.length - 1;
						}
						
						
						
						path += template[index];
						
						if (i === route.length - 2){
							for(index++; index < template.length; index++){
								path += '/' + template[index];
							}
						}
					}
				}
	
				return {
					path: path,
					params: params,
					alias: alias
				};
			},
	
			/**
			 *	@arg includeData :
			 *	1. string - URL to resource
			 *	2. array - URLs to resources
			 *	3. object - {route: x} - route defines the route template to resource,
			 *		it must be set before in include.cfg.
			 *		example:
			 *			include.cfg('net','scripts/net/{name}.js')
			 *			include.js({net: 'downloader'}) // -> will load scipts/net/downloader.js
			 *	@arg namespace - route in case of resource url template, or namespace in case of LazyModule
			 *
			 *	@arg fn - callback function, which receives namespace|route, url to resource and ?id in case of not relative url
			 *	@arg xpath - xpath string of a lazy object 'object.sub.and.othersub';
			 */
			each: function(type, includeData, fn, namespace, xpath) {
				var key;
	
				if (includeData == null) {
					console.error('Include Item has no Data', type, namespace);
					return;
				}
	
				if (type === 'lazy' && xpath == null) {
					for (key in includeData) {
						this.each(type, includeData[key], fn, null, key);
					}
					return;
				}
				if (includeData instanceof Array) {
					for (var i = 0; i < includeData.length; i++) {
						this.each(type, includeData[i], fn, namespace, xpath);
					}
					return;
				}
				if (typeof includeData === 'object') {
					for (key in includeData) {
						if (hasOwnProp.call(includeData, key)) {
							this.each(type, includeData[key], fn, key, xpath);
						}
					}
					return;
				}
	
				if (typeof includeData === 'string') {
					var x = this.resolve(namespace, includeData);
					if (namespace){
						namespace += '.' + includeData;
					}
					
					fn(namespace, x, xpath);
					return;
				}
				
				console.error('Include Package is invalid', arguments);
			},
	
			getRoutes: function(){
				return routes;
			},
			
			parseAlias: function(route){
				var path = route.path,
					result = regexpAlias.exec(path);
				
				return result && result[1];
			}
		};
		
	};
	
	var Routes = RoutesLib();
	
	
	/*{test}
	
	console.log(JSON.stringify(Routes.resolve(null,'scroller.js::Scroller')));
	
	Routes.register('lib', '.reference/libjs/{0}/lib/{1}.js');
	console.log(JSON.stringify(Routes.resolve('lib','scroller::Scroller')));
	console.log(JSON.stringify(Routes.resolve('lib','scroller/scroller.mobile?ui=black')));
	
	Routes.register('framework', '.reference/libjs/framework/{0}.js');
	console.log(JSON.stringify(Routes.resolve('framework','dom/jquery')));
	
	
	*/
	// source ../src/3.Events.js
	var Events = (function(document) {
		if (document == null) {
			return {
				ready: fn_doNothing,
				load: fn_doNothing
			};
		}
		var readycollection = [];
	
		function onReady() {
			Events.ready = fn_doNothing;
	
			if (readycollection == null) {
				return;
			}
	
			arr_invoke(readycollection);
			readycollection = null;
		}
	
		/** TODO: clean this */
	
		if ('onreadystatechange' in document) {
			document.onreadystatechange = function() {
				if (/complete|interactive/g.test(document.readyState) === false) {
					return;
				}
				onReady();
			};
		} else if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', onReady);
		}else {
			window.onload = onReady;
		}
	
	
		return {
			ready: function(callback) {
				readycollection.unshift(callback);
			}
		};
	})(document);
	 
	// source ../src/4.IncludeDeferred.js
	
	/**
	 * STATES:
	 * 0: Resource Created
	 * 1: Loading
	 * 2: Loaded - Evaluating
	 * 3: Evaluated - Childs Loading
	 * 4: Childs Loaded - Completed
	 */
	
	var IncludeDeferred = function() {
		this.callbacks = [];
		this.state = -1;
	};
	
	IncludeDeferred.prototype = { /**	state observer */
	
		on: function(state, callback, sender) {
			if (this === sender && this.state === -1) {
				callback(this);
				return this;
			}
			
			// this === sender in case when script loads additional
			// resources and there are already parents listeners
			
			var mutator = (this.state < 3 || this === sender)
				? 'unshift'
				: 'push';
			
			state <= this.state ? callback(this) : this.callbacks[mutator]({
				state: state,
				callback: callback
			});
			return this;
		},
		readystatechanged: function(state) {
	
			var i, length, x, currentInclude;
	
			if (state > this.state) {
				this.state = state;
			}
	
			if (this.state === 3) {
				var includes = this.includes;
	
				if (includes != null && includes.length) {
					for (i = 0; i < includes.length; i++) {
						if (includes[i].resource.state !== 4) {
							return;
						}
					}
				}
	
				this.state = 4;
			}
	
			i = 0;
			length = this.callbacks.length;
	
			if (length === 0){
				return;
			}
	
			//do not set asset resource to global
			if (this.type === 'js' && this.state === 4) {
				currentInclude = global.include;
				global.include = this;
			}
	
			for (; i < length; i++) {
				x = this.callbacks[i];
				if (x == null || x.state > this.state) {
					continue;
				}
	
				this.callbacks.splice(i,1);
				length--;
				i--;
	
				/* if (!DEBUG)
				try {
				*/
					x.callback(this);
				/* if (!DEBUG)
				} catch(error){
					console.error(error.toString(), 'file:', this.url);
				}
				*/
	
				if (this.state < 4){
					break;
				}
			}
	
			if (currentInclude != null){
				global.include = currentInclude;
			}
		},
	
		/** assets loaded and DomContentLoaded */
	
		ready: function(callback) {
			var that = this;
			return this.on(4, function() {
				Events.ready(function(){
					that.resolve(callback);
				});
			}, this);
		},
	
		/** assets loaded */
		done: function(callback) {
			var that = this;
			return this.on(4, function(){
				that.resolve(callback);
			}, this);
		},
		resolve: function(callback) {
			var includes = this.includes,
				length = includes == null ? 0 : includes.length;
	
			if (length > 0 && this.response == null){
				this.response = {};
	
				var resource, route;
	
				for(var i = 0, x; i < length; i++){
					x = includes[i];
					resource = x.resource;
					route = x.route;
	
					if (typeof resource.exports === 'undefined'){
						continue;
					}
	
					var type = resource.type;
					switch (type) {
					case 'js':
					case 'load':
					case 'ajax':
	
						var alias = route.alias || Routes.parseAlias(route),
							obj = type === 'js' ? this.response : (this.response[type] || (this.response[type] = {}));
	
						if (alias) {
							obj[alias] = resource.exports;
							break;
						} else {
							console.warn('Resource Alias is Not defined', resource);
						}
						break;
					}
	
				}
			}
			callback(this.response);
		}
	};
	 
	// source ../src/5.Include.js
	var Include = (function(IncludeDeferred) {
	
		function Include() {
			IncludeDeferred.call(this);
		}
	
		stub_release(Include.prototype);
		
		obj_inherit(Include, IncludeDeferred, {
			setCurrent: function(data) {
	
				var resource = new Resource('js', {
					path: data.id
				}, data.namespace, null, null, data.id);
	
				if (resource.state !== 4) {
					console.error("Current Resource should be loaded");
				}
	
				/**@TODO - probably state shoulb be changed to 2 at this place */
				resource.state = 3;
				global.include = resource;
	
			},
			
			cfg: function(arg) {
				switch (typeof arg) {
				case 'object':
					var key, value;
					for (key in arg) {
						value = arg[key];
	
						switch(key){
							case 'loader':
								for(var x in value){
									CustomLoader.register(x, value[x]);
								}
								break;
							case 'modules':
								if (value === true){
									enableModules();
								}
								break;
							default:
								cfg[key] = value;
								break;
						}
	
					}
					break;
				case 'string':
					if (arguments.length === 1) {
						return cfg[arg];
					}
					if (arguments.length === 2) {
						cfg[arg] = arguments[1];
					}
					break;
				case 'undefined':
					return cfg;
				}
				return this;
			},
			routes: function(mix) {
				if (mix == null) {
					return Routes.getRoutes();
				}
				
				if (arguments.length === 2) {
					Routes.register(mix, arguments[1]);
					return this;
				}
				
				for (var key in mix) {
					Routes.register(key, mix[key]);
				}
				return this;
			},
			promise: function(namespace) {
				var arr = namespace.split('.'),
					obj = global;
				while (arr.length) {
					var key = arr.shift();
					obj = obj[key] || (obj[key] = {});
				}
				return obj;
			},
			register: function(_bin) {
				for (var key in _bin) {
					for (var i = 0; i < _bin[key].length; i++) {
						var id = _bin[key][i].id,
							url = _bin[key][i].url,
							namespace = _bin[key][i].namespace,
							resource = new Resource();
	
						resource.state = 4;
						resource.namespace = namespace;
						resource.type = key;
	
						if (url) {
							if (url[0] === '/') {
								url = url.substring(1);
							}
							resource.location = path_getDir(url);
						}
	
						switch (key) {
						case 'load':
						case 'lazy':
							var container = document.querySelector('#includejs-' + id.replace(/\W/g, ''));
							if (container == null) {
								console.error('"%s" Data was not embedded into html', id);
								return;
							}
							resource.exports = container.innerHTML;
							break;
						}
						
						//
						(bin[key] || (bin[key] = {}))[id] = resource;
					}
				}
			},
			/**
			 *	Create new Resource Instance,
			 *	as sometimes it is necessary to call include. on new empty context
			 */
			instance: function(url) {
				var resource;
				if (url == null) {
					resource = new Include();
					resource.state = 4;
					
					return resource;
				}
				
				resource = new Resource();
				resource.state = 4;
				resource.location = path_getDir(url);
				
				return resource;
			},
	
			getResource: function(url, type) {
				var id = url;
				
				if (url.charCodeAt(0) !== 47) {
					// /
					id = '/' + id;
				}
	
				if (type != null){
					return bin[type][id];
				}
	
				for (var key in bin) {
					if (bin[key].hasOwnProperty(id)) {
						return bin[key][id];
					}
				}
				return null;
			},
			getResources: function(){
				return bin;
			},
	
			plugin: function(pckg, callback) {
	
				var urls = [],
					length = 0,
					j = 0,
					i = 0,
					onload = function(url, response) {
						j++;
	
						embedPlugin(response);
	
						if (j === length - 1 && callback) {
							callback();
							callback = null;
						}
					};
				Routes.each('', pckg, function(namespace, route) {
					urls.push(route.path[0] === '/' ? route.path.substring(1) : route.path);
				});
	
				length = urls.length;
	
				for (; i < length; i++) {
					XHR(urls[i], onload);
				}
				return this;
			},
			
			client: function(){
				if (cfg.server === true) 
					stub_freeze(this);
				
				return this;
			},
			
			server: function(){
				if (cfg.server !== true) 
					stub_freeze(this);
				
				return this;
			}
		});
		
		
		return Include;
	
		
		// >> FUNCTIONS
		
		function embedPlugin(source) {
			eval(source);
		}
		
		function enableModules() {
			if (typeof Object.defineProperty === 'undefined'){
				console.warn('Browser do not support Object.defineProperty');
				return;
			}
			Object.defineProperty(global, 'module', {
				get: function() {
					return global.include;
				}
			});
	
			Object.defineProperty(global, 'exports', {
				get: function() {
					var current = global.include;
					return (current.exports || (current.exports = {}));
				},
				set: function(exports) {
					global.include.exports = exports;
				}
			});
		}
		
		function includePackage(resource, type, mix){
			var pckg = mix.length === 1 ? mix[0] : __array_slice.call(mix);
			
			if (resource instanceof Resource) {
				return resource.include(type, pckg);
			}
			return new Resource('js').include(type, pckg);
		}
		
		function createIncluder(type) {
			return function(){
				return includePackage(this, type, arguments);
			};
		}
		
		function doNothing() {
			return this;
		}
		
		function stub_freeze(include) {
			include.js =
			include.css =
			include.load =
			include.ajax =
			include.embed =
			include.lazy =
			include.inject =
				doNothing;
		}
		
		function stub_release(proto) {
			var fns = ['js', 'css', 'load', 'ajax', 'embed', 'lazy'],
				i = fns.length;
			while (--i !== -1){
				proto[fns[i]] = createIncluder(fns[i]);
			}
			
			proto['inject'] = proto.js;
		}
		
	}(IncludeDeferred));
	 
	// source ../src/6.ScriptStack.js
	/** @TODO Refactor loadBy* {combine logic} */
	
	var ScriptStack = (function() {
	
		var head, currentResource, stack = [],
			loadScript = function(url, callback) {
				//console.log('load script', url);
				var tag = document.createElement('script');
				tag.type = 'text/javascript';
				tag.src = url;
	
				if ('onreadystatechange' in tag) {
					tag.onreadystatechange = function() {
						(this.readyState === 'complete' || this.readyState === 'loaded') && callback();
					};
				} else {
					tag.onload = tag.onerror = callback;
				}(head || (head = document.getElementsByTagName('head')[0])).appendChild(tag);
			},
	
			loadByEmbedding = function() {
				if (stack.length === 0) {
					return;
				}
	
				if (currentResource != null) {
					return;
				}
	
				var resource = (currentResource = stack[0]);
	
				if (resource.state === 1) {
					return;
				}
	
				resource.state = 1;
	
				global.include = resource;
				global.iparams = resource.route.params;
	
	
				function resourceLoaded(e) {
	
	
					if (e && e.type === 'error') {
						console.log('Script Loaded Error', resource.url);
					}
	
					var i = 0,
						length = stack.length;
	
					for (; i < length; i++) {
						if (stack[i] === resource) {
							stack.splice(i, 1);
							break;
						}
					}
	
					if (i === length) {
						console.error('Loaded Resource not found in stack', resource);
						return;
					}
	
					resource.readystatechanged(3);
	
					currentResource = null;
					loadByEmbedding();
				}
	
				if (resource.source) {
					__eval(resource.source, resource);
	
					resourceLoaded();
					return;
				}
	
				loadScript(resource.url, resourceLoaded);
			},
			processByEval = function() {
				if (stack.length === 0) {
					return;
				}
				if (currentResource != null) {
					return;
				}
	
				var resource = stack[0];
	
				if (resource.state < 2) {
					return;
				}
	
				currentResource = resource;
	
				resource.state = 1;
				global.include = resource;
	
				//console.log('evaling', resource.url, stack.length);
				__eval(resource.source, resource);
	
				for (var i = 0, x, length = stack.length; i < length; i++) {
					x = stack[i];
					if (x === resource) {
						stack.splice(i, 1);
						break;
					}
				}
	
				resource.readystatechanged(3);
				currentResource = null;
				processByEval();
	
			};
	
	
		return {
			load: function(resource, parent, forceEmbed) {
	
				//console.log('LOAD', resource.url, 'parent:',parent ? parent.url : '');
	
				var added = false;
				if (parent) {
					for (var i = 0, length = stack.length; i < length; i++) {
						if (stack[i] === parent) {
							stack.splice(i, 0, resource);
							added = true;
							break;
						}
					}
				}
	
				if (!added) {
					stack.push(resource);
				}
	
				// was already loaded, with custom loader for example
	
				if (!cfg.eval || forceEmbed) {
					loadByEmbedding();
					return;
				}
	
				if (cfg.sync === true) {
					currentResource = null;
				}
	
	
				if (resource.source) {
					resource.state = 2;
					processByEval();
					return;
				}
	
				XHR(resource, function(resource, response) {
					if (!response) {
						console.error('Not Loaded:', resource.url);
					}
	
					resource.source = response;
					resource.state = 2;
	
					processByEval();
				});
			},
			/* Move resource in stack close to parent */
			moveToParent: function(resource, parent) {
				var length = stack.length,
					parentIndex = -1,
					resourceIndex = -1,
					i;
	
				for (i = 0; i < length; i++) {
					if (stack[i] === resource) {
						resourceIndex = i;
						break;
					}
				}
	
				if (resourceIndex === -1) {
					// this should be not the case, but anyway checked.
					
					// - resource can load resources in done cb, and then it will be
					// already not in stack
					//-console.warn('Resource is not in stack', resource);
					return;
				}
	
				for (i= 0; i < length; i++) {
					if (stack[i] === parent) {
						parentIndex = i;
						break;
					}
				}
	
				if (parentIndex === -1) {
					//// - should be already in stack
					////if (parent == null) {
					////	stack.unshift(resource);
					////}
					return;
				}
	
				if (resourceIndex < parentIndex) {
					return;
				}
	
				stack.splice(resourceIndex, 1);
				stack.splice(parentIndex, 0, resource);
	
	
			}
		};
	})();
	
	// source ../src/7.CustomLoader.js
	var CustomLoader = (function() {
	
		// source loader/json.js
			
		var JSONParser = {
			process: function(source, res){
				try {
					return JSON.parse(source);
				} catch(error) {
					console.error(error, source);
					return null;
				}
			}
		};
		
		
	
		cfg.loader = {
			json : JSONParser
		};
		
		function loader_isInstance(x) {
			if (typeof x === 'string')
				return false;
			
			return typeof x.ready === 'function' || typeof x.process === 'function';
		}
		
		function createLoader(url) {
			var extension = path_getExtension(url),
				loader = cfg.loader[extension];
	
			if (loader_isInstance(loader)) {
				return loader;
			}
	
			var path = loader,
				namespace;
	
			if (typeof path === 'object') {
				// is route {namespace: path}
				for (var key in path) {
					namespace = key;
					path = path[key];
					break;
				}
			}
	
			return (cfg.loader[extension] = new Resource('js', Routes.resolve(namespace, path), namespace));
		}
		
		function doLoad_completeDelegate(callback, resource) {
			return function(response){
				callback(resource, response);
			};
		}
		
		function doLoad(resource, loader, callback) {
			XHR(resource, function(resource, response) {
				var delegate = doLoad_completeDelegate(callback, resource),
					syncResponse = loader.process(response, resource, delegate);
				
				// match also null
				if (typeof syncResponse !== 'undefined') {
					callback(resource, syncResponse);
				}
				
			});
		}
	
		return {
			load: function(resource, callback) {
	
				var loader = createLoader(resource.url);
				
				if (loader.process) {
					doLoad(resource, loader, callback);
					return;
				}
				
				loader.done(function() {
					doLoad(resource, loader.exports, callback);
				});
			},
			exists: function(resource) {
				if (!resource.url) {
					return false;
				}
	
				var ext = path_getExtension(resource.url);
	
				return cfg.loader.hasOwnProperty(ext);
			},
			
			/**
			 *	IHandler:
			 *	{ process: function(content) { return _handler(content); }; }
			 *
			 *	Url:
			 *	 path to IHandler
			 */
			register: function(extension, handler){
				if (typeof handler === 'string'){
					var resource = include;
					if (resource.location == null) { 
						resource = {
							location: path_getDir(path_resolveCurrent())
						};
					}
	
					handler = path_resolveUrl(handler, resource);
				}
	
				cfg.loader[extension] = handler;
			}
		};
	}());
	
	// source ../src/8.LazyModule.js
	var LazyModule = {
		create: function(xpath, code) {
			var arr = xpath.split('.'),
				obj = global,
				module = arr[arr.length - 1];
			while (arr.length > 1) {
				var prop = arr.shift();
				obj = obj[prop] || (obj[prop] = {});
			}
			arr = null;
	
			Object.defineProperty(obj, module, {
				get: function() {
	
					delete obj[module];
					try {
						var r = __eval(code, global.include);
						if (!(r == null || r instanceof Resource)){
							obj[module] = r;
						}
					} catch (error) {
						error.xpath = xpath;
						Helper.reportError(error);
					} finally {
						code = null;
						xpath = null;
						return obj[module];
					}
				}
			});
		}
	};
	// source ../src/9.Resource.js
	var Resource = (function(Include, Routes, ScriptStack, CustomLoader) {
	
		function process(resource) {
			var type = resource.type,
				parent = resource.parent,
				url = resource.url;
				
			if (document == null && type === 'css') {
				resource.state = 4;
				
				return resource;
			}
	
			if (CustomLoader.exists(resource) === false) {
				switch (type) {
					case 'js':
					case 'embed':
						ScriptStack.load(resource, parent, type === 'embed');
						break;
					case 'ajax':
					case 'load':
					case 'lazy':
						XHR(resource, onXHRCompleted);
						break;
					case 'css':
						resource.state = 4;
	
						var tag = document.createElement('link');
						tag.href = url;
						tag.rel = "stylesheet";
						tag.type = "text/css";
						document.getElementsByTagName('head')[0].appendChild(tag);
						break;
				}
			} else {
				CustomLoader.load(resource, onXHRCompleted);
			}
	
			return resource;
		}
	
		function onXHRCompleted(resource, response) {
			if (!response) {
				console.warn('Resource cannt be loaded', resource.url);
				//- resource.readystatechanged(4);
				//- return;
			}
	
			switch (resource.type) {
				case 'js':
				case 'embed':
					resource.source = response;
					ScriptStack.load(resource, resource.parent, resource.type === 'embed');
					return;
				case 'load':
				case 'ajax':
					resource.exports = response;
					break;
				case 'lazy':
					LazyModule.create(resource.xpath, response);
					break;
				case 'css':
					var tag = document.createElement('style');
					tag.type = "text/css";
					tag.innerHTML = response;
					document.getElementsByTagName('head')[0].appendChild(tag);
					break;
			}
	
			resource.readystatechanged(4);
		}
	
		var Resource = function(type, route, namespace, xpath, parent, id) {
			Include.call(this);
			
			this.childLoaded = fn_proxy(this.childLoaded, this);
	
			var url = route && route.path;
	
			if (url != null) {
				this.url = url = path_resolveUrl(url, parent);
			}
	
			this.route = route;
			this.namespace = namespace;
			this.type = type;
			this.xpath = xpath;
			this.parent = parent;
	
			if (id == null && url) {
				id = (url[0] === '/' ? '' : '/') + url;
			}
	
	
			var resource = bin[type] && bin[type][id];
			if (resource) {
	
				if (resource.state < 4 && type === 'js') {
					ScriptStack.moveToParent(resource, parent);
				}
	
				return resource;
			}
	
			if (url == null) {
				this.state = 3;
				this.location = path_getDir(path_resolveCurrent());
				return this;
			}
	
			this.state = 0;
			this.location = path_getDir(url);
	
	
	
			(bin[type] || (bin[type] = {}))[id] = this;
	
			if (cfg.version) {
				this.url += (this.url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
			}
	
			return process(this);
	
		};
	
		Resource.prototype = obj_inherit(Resource, Include, {
			childLoaded: function(child) {
				var resource = this,
					includes = resource.includes;
				if (includes && includes.length) {
					if (resource.state < 3 /* && resource.url != null */ ) {
						// resource still loading/include is in process, but one of sub resources are already done
						return;
					}
					for (var i = 0; i < includes.length; i++) {
						if (includes[i].resource.state !== 4) {
							return;
						}
					}
				}
				resource.readystatechanged(4);
			},
			create: function(type, route, namespace, xpath, id) {
				var resource;
	
				this.state = this.state >= 3 ? 3 : 2;
				this.response = null;
	
				if (this.includes == null) {
					this.includes = [];
				}
	
				resource = new Resource(type, route, namespace, xpath, this, id);
	
				this.includes.push({
					resource: resource,
					route: route
				});
	
				return resource;
			},
			include: function(type, pckg) {
				var that = this;
				Routes.each(type, pckg, function(namespace, route, xpath) {
	
					if (that.route != null && that.route.path === route.path) {
						// loading itself
						return;
					}
					
					that
						.create(type, route, namespace, xpath)
						.on(4, that.childLoaded);
	
				});
	
				return this;
			},
			
			getNestedOfType: function(type){
				return resource_getChildren(this.includes, type);
			}
		});
	
		return Resource;
	
		
		function resource_getChildren(includes, type, out) {
			if (includes == null) {
				return null;
			}
			
			if (out == null) {
				out = [];
			}
			
			for (var i = 0, x, imax = includes.length; i < imax; i++){
				x = includes[i].resource;
				
				if (type === x.type) {
					out.push(x);
				}
				
				if (x.includes != null) {
					resource_getChildren(x.includes, type, out);
				}
			}
			
			return out;
		}
		
	}(Include, Routes, ScriptStack, CustomLoader));
	
	// source ../src/10.export.js
	
	exports.include = new Include();
	
	exports.includeLib = {
		Routes: RoutesLib,
		Resource: Resource,
		ScriptStack: ScriptStack,
		registerLoader: CustomLoader.register
	};
}));

// source ../src/global-vars.js

function __eval(source, include) {
	"use strict";
	
	var iparams = include && include.route.params;

	/* if !DEBUG
	try {
	*/
		return eval.call(window, source);
	
	/* if !DEBUG
	} catch (error) {
		error.url = include && include.url;
		//Helper.reportError(error);
		console.error(error);
	}
	*/
	
}
// source ../.reference/libjs/ruqq/lib/dom/jquery.js
/*! jQuery v1.8.2 jquery.com | jquery.org/license */
(function(a,b){function G(a){var b=F[a]={};return p.each(a.split(s),function(a,c){b[c]=!0}),b}function J(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(I,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:+d+""===d?+d:H.test(d)?p.parseJSON(d):d}catch(f){}p.data(a,c,d)}else d=b}return d}function K(a){var b;for(b in a){if(b==="data"&&p.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function ba(){return!1}function bb(){return!0}function bh(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function bi(a,b){do a=a[b];while(a&&a.nodeType!==1);return a}function bj(a,b,c){b=b||0;if(p.isFunction(b))return p.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return p.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=p.grep(a,function(a){return a.nodeType===1});if(be.test(b))return p.filter(b,d,!c);b=p.filter(b,d)}return p.grep(a,function(a,d){return p.inArray(a,b)>=0===c})}function bk(a){var b=bl.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function bC(a,b){return a.getElementsByTagName(b)[0]||a.appendChild(a.ownerDocument.createElement(b))}function bD(a,b){if(b.nodeType!==1||!p.hasData(a))return;var c,d,e,f=p._data(a),g=p._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;d<e;d++)p.event.add(b,c,h[c][d])}g.data&&(g.data=p.extend({},g.data))}function bE(a,b){var c;if(b.nodeType!==1)return;b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase(),c==="object"?(b.parentNode&&(b.outerHTML=a.outerHTML),p.support.html5Clone&&a.innerHTML&&!p.trim(b.innerHTML)&&(b.innerHTML=a.innerHTML)):c==="input"&&bv.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&&(b.value=a.value)):c==="option"?b.selected=a.defaultSelected:c==="input"||c==="textarea"?b.defaultValue=a.defaultValue:c==="script"&&b.text!==a.text&&(b.text=a.text),b.removeAttribute(p.expando)}function bF(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bG(a){bv.test(a.type)&&(a.defaultChecked=a.checked)}function bY(a,b){if(b in a)return b;var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=bW.length;while(e--){b=bW[e]+c;if(b in a)return b}return d}function bZ(a,b){return a=b||a,p.css(a,"display")==="none"||!p.contains(a.ownerDocument,a)}function b$(a,b){var c,d,e=[],f=0,g=a.length;for(;f<g;f++){c=a[f];if(!c.style)continue;e[f]=p._data(c,"olddisplay"),b?(!e[f]&&c.style.display==="none"&&(c.style.display=""),c.style.display===""&&bZ(c)&&(e[f]=p._data(c,"olddisplay",cc(c.nodeName)))):(d=bH(c,"display"),!e[f]&&d!=="none"&&p._data(c,"olddisplay",d))}for(f=0;f<g;f++){c=a[f];if(!c.style)continue;if(!b||c.style.display==="none"||c.style.display==="")c.style.display=b?e[f]||"":"none"}return a}function b_(a,b,c){var d=bP.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function ca(a,b,c,d){var e=c===(d?"border":"content")?4:b==="width"?1:0,f=0;for(;e<4;e+=2)c==="margin"&&(f+=p.css(a,c+bV[e],!0)),d?(c==="content"&&(f-=parseFloat(bH(a,"padding"+bV[e]))||0),c!=="margin"&&(f-=parseFloat(bH(a,"border"+bV[e]+"Width"))||0)):(f+=parseFloat(bH(a,"padding"+bV[e]))||0,c!=="padding"&&(f+=parseFloat(bH(a,"border"+bV[e]+"Width"))||0));return f}function cb(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=!0,f=p.support.boxSizing&&p.css(a,"boxSizing")==="border-box";if(d<=0||d==null){d=bH(a,b);if(d<0||d==null)d=a.style[b];if(bQ.test(d))return d;e=f&&(p.support.boxSizingReliable||d===a.style[b]),d=parseFloat(d)||0}return d+ca(a,b,c||(f?"border":"content"),e)+"px"}function cc(a){if(bS[a])return bS[a];var b=p("<"+a+">").appendTo(e.body),c=b.css("display");b.remove();if(c==="none"||c===""){bI=e.body.appendChild(bI||p.extend(e.createElement("iframe"),{frameBorder:0,width:0,height:0}));if(!bJ||!bI.createElement)bJ=(bI.contentWindow||bI.contentDocument).document,bJ.write("<!doctype html><html><body>"),bJ.close();b=bJ.body.appendChild(bJ.createElement(a)),c=bH(b,"display"),e.body.removeChild(bI)}return bS[a]=c,c}function ci(a,b,c,d){var e;if(p.isArray(b))p.each(b,function(b,e){c||ce.test(a)?d(a,e):ci(a+"["+(typeof e=="object"?b:"")+"]",e,c,d)});else if(!c&&p.type(b)==="object")for(e in b)ci(a+"["+e+"]",b[e],c,d);else d(a,b)}function cz(a){return function(b,c){typeof b!="string"&&(c=b,b="*");var d,e,f,g=b.toLowerCase().split(s),h=0,i=g.length;if(p.isFunction(c))for(;h<i;h++)d=g[h],f=/^\+/.test(d),f&&(d=d.substr(1)||"*"),e=a[d]=a[d]||[],e[f?"unshift":"push"](c)}}function cA(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h,i=a[f],j=0,k=i?i.length:0,l=a===cv;for(;j<k&&(l||!h);j++)h=i[j](c,d,e),typeof h=="string"&&(!l||g[h]?h=b:(c.dataTypes.unshift(h),h=cA(a,c,d,e,h,g)));return(l||!h)&&!g["*"]&&(h=cA(a,c,d,e,"*",g)),h}function cB(a,c){var d,e,f=p.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((f[d]?a:e||(e={}))[d]=c[d]);e&&p.extend(!0,a,e)}function cC(a,c,d){var e,f,g,h,i=a.contents,j=a.dataTypes,k=a.responseFields;for(f in k)f in d&&(c[k[f]]=d[f]);while(j[0]==="*")j.shift(),e===b&&(e=a.mimeType||c.getResponseHeader("content-type"));if(e)for(f in i)if(i[f]&&i[f].test(e)){j.unshift(f);break}if(j[0]in d)g=j[0];else{for(f in d){if(!j[0]||a.converters[f+" "+j[0]]){g=f;break}h||(h=f)}g=g||h}if(g)return g!==j[0]&&j.unshift(g),d[g]}function cD(a,b){var c,d,e,f,g=a.dataTypes.slice(),h=g[0],i={},j=0;a.dataFilter&&(b=a.dataFilter(b,a.dataType));if(g[1])for(c in a.converters)i[c.toLowerCase()]=a.converters[c];for(;e=g[++j];)if(e!=="*"){if(h!=="*"&&h!==e){c=i[h+" "+e]||i["* "+e];if(!c)for(d in i){f=d.split(" ");if(f[1]===e){c=i[h+" "+f[0]]||i["* "+f[0]];if(c){c===!0?c=i[d]:i[d]!==!0&&(e=f[0],g.splice(j--,0,e));break}}}if(c!==!0)if(c&&a["throws"])b=c(b);else try{b=c(b)}catch(k){return{state:"parsererror",error:c?k:"No conversion from "+h+" to "+e}}}h=e}return{state:"success",data:b}}function cL(){try{return new a.XMLHttpRequest}catch(b){}}function cM(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function cU(){return setTimeout(function(){cN=b},0),cN=p.now()}function cV(a,b){p.each(b,function(b,c){var d=(cT[b]||[]).concat(cT["*"]),e=0,f=d.length;for(;e<f;e++)if(d[e].call(a,b,c))return})}function cW(a,b,c){var d,e=0,f=0,g=cS.length,h=p.Deferred().always(function(){delete i.elem}),i=function(){var b=cN||cU(),c=Math.max(0,j.startTime+j.duration-b),d=1-(c/j.duration||0),e=0,f=j.tweens.length;for(;e<f;e++)j.tweens[e].run(d);return h.notifyWith(a,[j,d,c]),d<1&&f?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:p.extend({},b),opts:p.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:cN||cU(),duration:c.duration,tweens:[],createTween:function(b,c,d){var e=p.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(e),e},stop:function(b){var c=0,d=b?j.tweens.length:0;for(;c<d;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;cX(k,j.opts.specialEasing);for(;e<g;e++){d=cS[e].call(j,a,k,j.opts);if(d)return d}return cV(j,k),p.isFunction(j.opts.start)&&j.opts.start.call(a,j),p.fx.timer(p.extend(i,{anim:j,queue:j.opts.queue,elem:a})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}function cX(a,b){var c,d,e,f,g;for(c in a){d=p.camelCase(c),e=b[d],f=a[c],p.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=p.cssHooks[d];if(g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}}function cY(a,b,c){var d,e,f,g,h,i,j,k,l=this,m=a.style,n={},o=[],q=a.nodeType&&bZ(a);c.queue||(j=p._queueHooks(a,"fx"),j.unqueued==null&&(j.unqueued=0,k=j.empty.fire,j.empty.fire=function(){j.unqueued||k()}),j.unqueued++,l.always(function(){l.always(function(){j.unqueued--,p.queue(a,"fx").length||j.empty.fire()})})),a.nodeType===1&&("height"in b||"width"in b)&&(c.overflow=[m.overflow,m.overflowX,m.overflowY],p.css(a,"display")==="inline"&&p.css(a,"float")==="none"&&(!p.support.inlineBlockNeedsLayout||cc(a.nodeName)==="inline"?m.display="inline-block":m.zoom=1)),c.overflow&&(m.overflow="hidden",p.support.shrinkWrapBlocks||l.done(function(){m.overflow=c.overflow[0],m.overflowX=c.overflow[1],m.overflowY=c.overflow[2]}));for(d in b){f=b[d];if(cP.exec(f)){delete b[d];if(f===(q?"hide":"show"))continue;o.push(d)}}g=o.length;if(g){h=p._data(a,"fxshow")||p._data(a,"fxshow",{}),q?p(a).show():l.done(function(){p(a).hide()}),l.done(function(){var b;p.removeData(a,"fxshow",!0);for(b in n)p.style(a,b,n[b])});for(d=0;d<g;d++)e=o[d],i=l.createTween(e,q?h[e]:0),n[e]=h[e]||p.style(a,e),e in h||(h[e]=i.start,q&&(i.end=i.start,i.start=e==="width"||e==="height"?1:0))}}function cZ(a,b,c,d,e){return new cZ.prototype.init(a,b,c,d,e)}function c$(a,b){var c,d={height:a},e=0;b=b?1:0;for(;e<4;e+=2-b)c=bV[e],d["margin"+c]=d["padding"+c]=a;return b&&(d.opacity=d.width=a),d}function da(a){return p.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}var c,d,e=a.document,f=a.location,g=a.navigator,h=a.jQuery,i=a.$,j=Array.prototype.push,k=Array.prototype.slice,l=Array.prototype.indexOf,m=Object.prototype.toString,n=Object.prototype.hasOwnProperty,o=String.prototype.trim,p=function(a,b){return new p.fn.init(a,b,c)},q=/[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,r=/\S/,s=/\s+/,t=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,u=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^[\],:{}\s]*$/,x=/(?:^|:|,)(?:\s*\[)+/g,y=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,z=/"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,A=/^-ms-/,B=/-([\da-z])/gi,C=function(a,b){return(b+"").toUpperCase()},D=function(){e.addEventListener?(e.removeEventListener("DOMContentLoaded",D,!1),p.ready()):e.readyState==="complete"&&(e.detachEvent("onreadystatechange",D),p.ready())},E={};p.fn=p.prototype={constructor:p,init:function(a,c,d){var f,g,h,i;if(!a)return this;if(a.nodeType)return this.context=this[0]=a,this.length=1,this;if(typeof a=="string"){a.charAt(0)==="<"&&a.charAt(a.length-1)===">"&&a.length>=3?f=[null,a,null]:f=u.exec(a);if(f&&(f[1]||!c)){if(f[1])return c=c instanceof p?c[0]:c,i=c&&c.nodeType?c.ownerDocument||c:e,a=p.parseHTML(f[1],i,!0),v.test(f[1])&&p.isPlainObject(c)&&this.attr.call(a,c,!0),p.merge(this,a);g=e.getElementById(f[2]);if(g&&g.parentNode){if(g.id!==f[2])return d.find(a);this.length=1,this[0]=g}return this.context=e,this.selector=a,this}return!c||c.jquery?(c||d).find(a):this.constructor(c).find(a)}return p.isFunction(a)?d.ready(a):(a.selector!==b&&(this.selector=a.selector,this.context=a.context),p.makeArray(a,this))},selector:"",jquery:"1.8.2",length:0,size:function(){return this.length},toArray:function(){return k.call(this)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=p.merge(this.constructor(),a);return d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")"),d},each:function(a,b){return p.each(this,a,b)},ready:function(a){return p.ready.promise().done(a),this},eq:function(a){return a=+a,a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(k.apply(this,arguments),"slice",k.call(arguments).join(","))},map:function(a){return this.pushStack(p.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:j,sort:[].sort,splice:[].splice},p.fn.init.prototype=p.fn,p.extend=p.fn.extend=function(){var a,c,d,e,f,g,h=arguments[0]||{},i=1,j=arguments.length,k=!1;typeof h=="boolean"&&(k=h,h=arguments[1]||{},i=2),typeof h!="object"&&!p.isFunction(h)&&(h={}),j===i&&(h=this,--i);for(;i<j;i++)if((a=arguments[i])!=null)for(c in a){d=h[c],e=a[c];if(h===e)continue;k&&e&&(p.isPlainObject(e)||(f=p.isArray(e)))?(f?(f=!1,g=d&&p.isArray(d)?d:[]):g=d&&p.isPlainObject(d)?d:{},h[c]=p.extend(k,g,e)):e!==b&&(h[c]=e)}return h},p.extend({noConflict:function(b){return a.$===p&&(a.$=i),b&&a.jQuery===p&&(a.jQuery=h),p},isReady:!1,readyWait:1,holdReady:function(a){a?p.readyWait++:p.ready(!0)},ready:function(a){if(a===!0?--p.readyWait:p.isReady)return;if(!e.body)return setTimeout(p.ready,1);p.isReady=!0;if(a!==!0&&--p.readyWait>0)return;d.resolveWith(e,[p]),p.fn.trigger&&p(e).trigger("ready").off("ready")},isFunction:function(a){return p.type(a)==="function"},isArray:Array.isArray||function(a){return p.type(a)==="array"},isWindow:function(a){return a!=null&&a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return a==null?String(a):E[m.call(a)]||"object"},isPlainObject:function(a){if(!a||p.type(a)!=="object"||a.nodeType||p.isWindow(a))return!1;try{if(a.constructor&&!n.call(a,"constructor")&&!n.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||n.call(a,d)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},error:function(a){throw new Error(a)},parseHTML:function(a,b,c){var d;return!a||typeof a!="string"?null:(typeof b=="boolean"&&(c=b,b=0),b=b||e,(d=v.exec(a))?[b.createElement(d[1])]:(d=p.buildFragment([a],b,c?null:[]),p.merge([],(d.cacheable?p.clone(d.fragment):d.fragment).childNodes)))},parseJSON:function(b){if(!b||typeof b!="string")return null;b=p.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(w.test(b.replace(y,"@").replace(z,"]").replace(x,"")))return(new Function("return "+b))();p.error("Invalid JSON: "+b)},parseXML:function(c){var d,e;if(!c||typeof c!="string")return null;try{a.DOMParser?(e=new DOMParser,d=e.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(f){d=b}return(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&p.error("Invalid XML: "+c),d},noop:function(){},globalEval:function(b){b&&r.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(A,"ms-").replace(B,C)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,c,d){var e,f=0,g=a.length,h=g===b||p.isFunction(a);if(d){if(h){for(e in a)if(c.apply(a[e],d)===!1)break}else for(;f<g;)if(c.apply(a[f++],d)===!1)break}else if(h){for(e in a)if(c.call(a[e],e,a[e])===!1)break}else for(;f<g;)if(c.call(a[f],f,a[f++])===!1)break;return a},trim:o&&!o.call("﻿ ")?function(a){return a==null?"":o.call(a)}:function(a){return a==null?"":(a+"").replace(t,"")},makeArray:function(a,b){var c,d=b||[];return a!=null&&(c=p.type(a),a.length==null||c==="string"||c==="function"||c==="regexp"||p.isWindow(a)?j.call(d,a):p.merge(d,a)),d},inArray:function(a,b,c){var d;if(b){if(l)return l.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=c.length,e=a.length,f=0;if(typeof d=="number")for(;f<d;f++)a[e++]=c[f];else while(c[f]!==b)a[e++]=c[f++];return a.length=e,a},grep:function(a,b,c){var d,e=[],f=0,g=a.length;c=!!c;for(;f<g;f++)d=!!b(a[f],f),c!==d&&e.push(a[f]);return e},map:function(a,c,d){var e,f,g=[],h=0,i=a.length,j=a instanceof p||i!==b&&typeof i=="number"&&(i>0&&a[0]&&a[i-1]||i===0||p.isArray(a));if(j)for(;h<i;h++)e=c(a[h],h,d),e!=null&&(g[g.length]=e);else for(f in a)e=c(a[f],f,d),e!=null&&(g[g.length]=e);return g.concat.apply([],g)},guid:1,proxy:function(a,c){var d,e,f;return typeof c=="string"&&(d=a[c],c=a,a=d),p.isFunction(a)?(e=k.call(arguments,2),f=function(){return a.apply(c,e.concat(k.call(arguments)))},f.guid=a.guid=a.guid||p.guid++,f):b},access:function(a,c,d,e,f,g,h){var i,j=d==null,k=0,l=a.length;if(d&&typeof d=="object"){for(k in d)p.access(a,c,k,d[k],1,g,e);f=1}else if(e!==b){i=h===b&&p.isFunction(e),j&&(i?(i=c,c=function(a,b,c){return i.call(p(a),c)}):(c.call(a,e),c=null));if(c)for(;k<l;k++)c(a[k],d,i?e.call(a[k],k,c(a[k],d)):e,h);f=1}return f?a:j?c.call(a):l?c(a[0],d):g},now:function(){return(new Date).getTime()}}),p.ready.promise=function(b){if(!d){d=p.Deferred();if(e.readyState==="complete")setTimeout(p.ready,1);else if(e.addEventListener)e.addEventListener("DOMContentLoaded",D,!1),a.addEventListener("load",p.ready,!1);else{e.attachEvent("onreadystatechange",D),a.attachEvent("onload",p.ready);var c=!1;try{c=a.frameElement==null&&e.documentElement}catch(f){}c&&c.doScroll&&function g(){if(!p.isReady){try{c.doScroll("left")}catch(a){return setTimeout(g,50)}p.ready()}}()}}return d.promise(b)},p.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){E["[object "+b+"]"]=b.toLowerCase()}),c=p(e);var F={};p.Callbacks=function(a){a=typeof a=="string"?F[a]||G(a):p.extend({},a);var c,d,e,f,g,h,i=[],j=!a.once&&[],k=function(b){c=a.memory&&b,d=!0,h=f||0,f=0,g=i.length,e=!0;for(;i&&h<g;h++)if(i[h].apply(b[0],b[1])===!1&&a.stopOnFalse){c=!1;break}e=!1,i&&(j?j.length&&k(j.shift()):c?i=[]:l.disable())},l={add:function(){if(i){var b=i.length;(function d(b){p.each(b,function(b,c){var e=p.type(c);e==="function"&&(!a.unique||!l.has(c))?i.push(c):c&&c.length&&e!=="string"&&d(c)})})(arguments),e?g=i.length:c&&(f=b,k(c))}return this},remove:function(){return i&&p.each(arguments,function(a,b){var c;while((c=p.inArray(b,i,c))>-1)i.splice(c,1),e&&(c<=g&&g--,c<=h&&h--)}),this},has:function(a){return p.inArray(a,i)>-1},empty:function(){return i=[],this},disable:function(){return i=j=c=b,this},disabled:function(){return!i},lock:function(){return j=b,c||l.disable(),this},locked:function(){return!j},fireWith:function(a,b){return b=b||[],b=[a,b.slice?b.slice():b],i&&(!d||j)&&(e?j.push(b):k(b)),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!d}};return l},p.extend({Deferred:function(a){var b=[["resolve","done",p.Callbacks("once memory"),"resolved"],["reject","fail",p.Callbacks("once memory"),"rejected"],["notify","progress",p.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return p.Deferred(function(c){p.each(b,function(b,d){var f=d[0],g=a[b];e[d[1]](p.isFunction(g)?function(){var a=g.apply(this,arguments);a&&p.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f+"With"](this===e?c:this,[a])}:c[f])}),a=null}).promise()},promise:function(a){return a!=null?p.extend(a,d):d}},e={};return d.pipe=d.then,p.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[a^1][2].disable,b[2][2].lock),e[f[0]]=g.fire,e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=k.call(arguments),d=c.length,e=d!==1||a&&p.isFunction(a.promise)?d:0,f=e===1?a:p.Deferred(),g=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?k.call(arguments):d,c===h?f.notifyWith(b,c):--e||f.resolveWith(b,c)}},h,i,j;if(d>1){h=new Array(d),i=new Array(d),j=new Array(d);for(;b<d;b++)c[b]&&p.isFunction(c[b].promise)?c[b].promise().done(g(b,j,c)).fail(f.reject).progress(g(b,i,h)):--e}return e||f.resolveWith(j,c),f.promise()}}),p.support=function(){var b,c,d,f,g,h,i,j,k,l,m,n=e.createElement("div");n.setAttribute("className","t"),n.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",c=n.getElementsByTagName("*"),d=n.getElementsByTagName("a")[0],d.style.cssText="top:1px;float:left;opacity:.5";if(!c||!c.length)return{};f=e.createElement("select"),g=f.appendChild(e.createElement("option")),h=n.getElementsByTagName("input")[0],b={leadingWhitespace:n.firstChild.nodeType===3,tbody:!n.getElementsByTagName("tbody").length,htmlSerialize:!!n.getElementsByTagName("link").length,style:/top/.test(d.getAttribute("style")),hrefNormalized:d.getAttribute("href")==="/a",opacity:/^0.5/.test(d.style.opacity),cssFloat:!!d.style.cssFloat,checkOn:h.value==="on",optSelected:g.selected,getSetAttribute:n.className!=="t",enctype:!!e.createElement("form").enctype,html5Clone:e.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",boxModel:e.compatMode==="CSS1Compat",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},h.checked=!0,b.noCloneChecked=h.cloneNode(!0).checked,f.disabled=!0,b.optDisabled=!g.disabled;try{delete n.test}catch(o){b.deleteExpando=!1}!n.addEventListener&&n.attachEvent&&n.fireEvent&&(n.attachEvent("onclick",m=function(){b.noCloneEvent=!1}),n.cloneNode(!0).fireEvent("onclick"),n.detachEvent("onclick",m)),h=e.createElement("input"),h.value="t",h.setAttribute("type","radio"),b.radioValue=h.value==="t",h.setAttribute("checked","checked"),h.setAttribute("name","t"),n.appendChild(h),i=e.createDocumentFragment(),i.appendChild(n.lastChild),b.checkClone=i.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=h.checked,i.removeChild(h),i.appendChild(n);if(n.attachEvent)for(k in{submit:!0,change:!0,focusin:!0})j="on"+k,l=j in n,l||(n.setAttribute(j,"return;"),l=typeof n[j]=="function"),b[k+"Bubbles"]=l;return p(function(){var c,d,f,g,h="padding:0;margin:0;border:0;display:block;overflow:hidden;",i=e.getElementsByTagName("body")[0];if(!i)return;c=e.createElement("div"),c.style.cssText="visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px",i.insertBefore(c,i.firstChild),d=e.createElement("div"),c.appendChild(d),d.innerHTML="<table><tr><td></td><td>t</td></tr></table>",f=d.getElementsByTagName("td"),f[0].style.cssText="padding:0;margin:0;border:0;display:none",l=f[0].offsetHeight===0,f[0].style.display="",f[1].style.display="none",b.reliableHiddenOffsets=l&&f[0].offsetHeight===0,d.innerHTML="",d.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",b.boxSizing=d.offsetWidth===4,b.doesNotIncludeMarginInBodyOffset=i.offsetTop!==1,a.getComputedStyle&&(b.pixelPosition=(a.getComputedStyle(d,null)||{}).top!=="1%",b.boxSizingReliable=(a.getComputedStyle(d,null)||{width:"4px"}).width==="4px",g=e.createElement("div"),g.style.cssText=d.style.cssText=h,g.style.marginRight=g.style.width="0",d.style.width="1px",d.appendChild(g),b.reliableMarginRight=!parseFloat((a.getComputedStyle(g,null)||{}).marginRight)),typeof d.style.zoom!="undefined"&&(d.innerHTML="",d.style.cssText=h+"width:1px;padding:1px;display:inline;zoom:1",b.inlineBlockNeedsLayout=d.offsetWidth===3,d.style.display="block",d.style.overflow="visible",d.innerHTML="<div></div>",d.firstChild.style.width="5px",b.shrinkWrapBlocks=d.offsetWidth!==3,c.style.zoom=1),i.removeChild(c),c=d=f=g=null}),i.removeChild(n),c=d=f=g=h=i=n=null,b}();var H=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,I=/([A-Z])/g;p.extend({cache:{},deletedIds:[],uuid:0,expando:"jQuery"+(p.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){return a=a.nodeType?p.cache[a[p.expando]]:a[p.expando],!!a&&!K(a)},data:function(a,c,d,e){if(!p.acceptData(a))return;var f,g,h=p.expando,i=typeof c=="string",j=a.nodeType,k=j?p.cache:a,l=j?a[h]:a[h]&&h;if((!l||!k[l]||!e&&!k[l].data)&&i&&d===b)return;l||(j?a[h]=l=p.deletedIds.pop()||p.guid++:l=h),k[l]||(k[l]={},j||(k[l].toJSON=p.noop));if(typeof c=="object"||typeof c=="function")e?k[l]=p.extend(k[l],c):k[l].data=p.extend(k[l].data,c);return f=k[l],e||(f.data||(f.data={}),f=f.data),d!==b&&(f[p.camelCase(c)]=d),i?(g=f[c],g==null&&(g=f[p.camelCase(c)])):g=f,g},removeData:function(a,b,c){if(!p.acceptData(a))return;var d,e,f,g=a.nodeType,h=g?p.cache:a,i=g?a[p.expando]:p.expando;if(!h[i])return;if(b){d=c?h[i]:h[i].data;if(d){p.isArray(b)||(b in d?b=[b]:(b=p.camelCase(b),b in d?b=[b]:b=b.split(" ")));for(e=0,f=b.length;e<f;e++)delete d[b[e]];if(!(c?K:p.isEmptyObject)(d))return}}if(!c){delete h[i].data;if(!K(h[i]))return}g?p.cleanData([a],!0):p.support.deleteExpando||h!=h.window?delete h[i]:h[i]=null},_data:function(a,b,c){return p.data(a,b,c,!0)},acceptData:function(a){var b=a.nodeName&&p.noData[a.nodeName.toLowerCase()];return!b||b!==!0&&a.getAttribute("classid")===b}}),p.fn.extend({data:function(a,c){var d,e,f,g,h,i=this[0],j=0,k=null;if(a===b){if(this.length){k=p.data(i);if(i.nodeType===1&&!p._data(i,"parsedAttrs")){f=i.attributes;for(h=f.length;j<h;j++)g=f[j].name,g.indexOf("data-")||(g=p.camelCase(g.substring(5)),J(i,g,k[g]));p._data(i,"parsedAttrs",!0)}}return k}return typeof a=="object"?this.each(function(){p.data(this,a)}):(d=a.split(".",2),d[1]=d[1]?"."+d[1]:"",e=d[1]+"!",p.access(this,function(c){if(c===b)return k=this.triggerHandler("getData"+e,[d[0]]),k===b&&i&&(k=p.data(i,a),k=J(i,a,k)),k===b&&d[1]?this.data(d[0]):k;d[1]=c,this.each(function(){var b=p(this);b.triggerHandler("setData"+e,d),p.data(this,a,c),b.triggerHandler("changeData"+e,d)})},null,c,arguments.length>1,null,!1))},removeData:function(a){return this.each(function(){p.removeData(this,a)})}}),p.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=p._data(a,b),c&&(!d||p.isArray(c)?d=p._data(a,b,p.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=p.queue(a,b),d=c.length,e=c.shift(),f=p._queueHooks(a,b),g=function(){p.dequeue(a,b)};e==="inprogress"&&(e=c.shift(),d--),e&&(b==="fx"&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return p._data(a,c)||p._data(a,c,{empty:p.Callbacks("once memory").add(function(){p.removeData(a,b+"queue",!0),p.removeData(a,c,!0)})})}}),p.fn.extend({queue:function(a,c){var d=2;return typeof a!="string"&&(c=a,a="fx",d--),arguments.length<d?p.queue(this[0],a):c===b?this:this.each(function(){var b=p.queue(this,a,c);p._queueHooks(this,a),a==="fx"&&b[0]!=="inprogress"&&p.dequeue(this,a)})},dequeue:function(a){return this.each(function(){p.dequeue(this,a)})},delay:function(a,b){return a=p.fx?p.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){var d,e=1,f=p.Deferred(),g=this,h=this.length,i=function(){--e||f.resolveWith(g,[g])};typeof a!="string"&&(c=a,a=b),a=a||"fx";while(h--)d=p._data(g[h],a+"queueHooks"),d&&d.empty&&(e++,d.empty.add(i));return i(),f.promise(c)}});var L,M,N,O=/[\t\r\n]/g,P=/\r/g,Q=/^(?:button|input)$/i,R=/^(?:button|input|object|select|textarea)$/i,S=/^a(?:rea|)$/i,T=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,U=p.support.getSetAttribute;p.fn.extend({attr:function(a,b){return p.access(this,p.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){p.removeAttr(this,a)})},prop:function(a,b){return p.access(this,p.prop,a,b,arguments.length>1)},removeProp:function(a){return a=p.propFix[a]||a,this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,f,g,h;if(p.isFunction(a))return this.each(function(b){p(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(s);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{f=" "+e.className+" ";for(g=0,h=b.length;g<h;g++)f.indexOf(" "+b[g]+" ")<0&&(f+=b[g]+" ");e.className=p.trim(f)}}}return this},removeClass:function(a){var c,d,e,f,g,h,i;if(p.isFunction(a))return this.each(function(b){p(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(s);for(h=0,i=this.length;h<i;h++){e=this[h];if(e.nodeType===1&&e.className){d=(" "+e.className+" ").replace(O," ");for(f=0,g=c.length;f<g;f++)while(d.indexOf(" "+c[f]+" ")>=0)d=d.replace(" "+c[f]+" "," ");e.className=a?p.trim(d):""}}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";return p.isFunction(a)?this.each(function(c){p(this).toggleClass(a.call(this,c,this.className,b),b)}):this.each(function(){if(c==="string"){var e,f=0,g=p(this),h=b,i=a.split(s);while(e=i[f++])h=d?h:!g.hasClass(e),g[h?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&p._data(this,"__className__",this.className),this.className=this.className||a===!1?"":p._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(O," ").indexOf(b)>=0)return!0;return!1},val:function(a){var c,d,e,f=this[0];if(!arguments.length){if(f)return c=p.valHooks[f.type]||p.valHooks[f.nodeName.toLowerCase()],c&&"get"in c&&(d=c.get(f,"value"))!==b?d:(d=f.value,typeof d=="string"?d.replace(P,""):d==null?"":d);return}return e=p.isFunction(a),this.each(function(d){var f,g=p(this);if(this.nodeType!==1)return;e?f=a.call(this,d,g.val()):f=a,f==null?f="":typeof f=="number"?f+="":p.isArray(f)&&(f=p.map(f,function(a){return a==null?"":a+""})),c=p.valHooks[this.type]||p.valHooks[this.nodeName.toLowerCase()];if(!c||!("set"in c)||c.set(this,f,"value")===b)this.value=f})}}),p.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,f=a.selectedIndex,g=[],h=a.options,i=a.type==="select-one";if(f<0)return null;c=i?f:0,d=i?f+1:h.length;for(;c<d;c++){e=h[c];if(e.selected&&(p.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!p.nodeName(e.parentNode,"optgroup"))){b=p(e).val();if(i)return b;g.push(b)}}return i&&!g.length&&h.length?p(h[f]).val():g},set:function(a,b){var c=p.makeArray(b);return p(a).find("option").each(function(){this.selected=p.inArray(p(this).val(),c)>=0}),c.length||(a.selectedIndex=-1),c}}},attrFn:{},attr:function(a,c,d,e){var f,g,h,i=a.nodeType;if(!a||i===3||i===8||i===2)return;if(e&&p.isFunction(p.fn[c]))return p(a)[c](d);if(typeof a.getAttribute=="undefined")return p.prop(a,c,d);h=i!==1||!p.isXMLDoc(a),h&&(c=c.toLowerCase(),g=p.attrHooks[c]||(T.test(c)?M:L));if(d!==b){if(d===null){p.removeAttr(a,c);return}return g&&"set"in g&&h&&(f=g.set(a,d,c))!==b?f:(a.setAttribute(c,d+""),d)}return g&&"get"in g&&h&&(f=g.get(a,c))!==null?f:(f=a.getAttribute(c),f===null?b:f)},removeAttr:function(a,b){var c,d,e,f,g=0;if(b&&a.nodeType===1){d=b.split(s);for(;g<d.length;g++)e=d[g],e&&(c=p.propFix[e]||e,f=T.test(e),f||p.attr(a,e,""),a.removeAttribute(U?e:c),f&&c in a&&(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(Q.test(a.nodeName)&&a.parentNode)p.error("type property can't be changed");else if(!p.support.radioValue&&b==="radio"&&p.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}},value:{get:function(a,b){return L&&p.nodeName(a,"button")?L.get(a,b):b in a?a.value:null},set:function(a,b,c){if(L&&p.nodeName(a,"button"))return L.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,f,g,h=a.nodeType;if(!a||h===3||h===8||h===2)return;return g=h!==1||!p.isXMLDoc(a),g&&(c=p.propFix[c]||c,f=p.propHooks[c]),d!==b?f&&"set"in f&&(e=f.set(a,d,c))!==b?e:a[c]=d:f&&"get"in f&&(e=f.get(a,c))!==null?e:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):R.test(a.nodeName)||S.test(a.nodeName)&&a.href?0:b}}}}),M={get:function(a,c){var d,e=p.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;return b===!1?p.removeAttr(a,c):(d=p.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase())),c}},U||(N={name:!0,id:!0,coords:!0},L=p.valHooks.button={get:function(a,c){var d;return d=a.getAttributeNode(c),d&&(N[c]?d.value!=="":d.specified)?d.value:b},set:function(a,b,c){var d=a.getAttributeNode(c);return d||(d=e.createAttribute(c),a.setAttributeNode(d)),d.value=b+""}},p.each(["width","height"],function(a,b){p.attrHooks[b]=p.extend(p.attrHooks[b],{set:function(a,c){if(c==="")return a.setAttribute(b,"auto"),c}})}),p.attrHooks.contenteditable={get:L.get,set:function(a,b,c){b===""&&(b="false"),L.set(a,b,c)}}),p.support.hrefNormalized||p.each(["href","src","width","height"],function(a,c){p.attrHooks[c]=p.extend(p.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),p.support.style||(p.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=b+""}}),p.support.optSelected||(p.propHooks.selected=p.extend(p.propHooks.selected,{get:function(a){var b=a.parentNode;return b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex),null}})),p.support.enctype||(p.propFix.enctype="encoding"),p.support.checkOn||p.each(["radio","checkbox"],function(){p.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),p.each(["radio","checkbox"],function(){p.valHooks[this]=p.extend(p.valHooks[this],{set:function(a,b){if(p.isArray(b))return a.checked=p.inArray(p(a).val(),b)>=0}})});var V=/^(?:textarea|input|select)$/i,W=/^([^\.]*|)(?:\.(.+)|)$/,X=/(?:^|\s)hover(\.\S+|)\b/,Y=/^key/,Z=/^(?:mouse|contextmenu)|click/,$=/^(?:focusinfocus|focusoutblur)$/,_=function(a){return p.event.special.hover?a:a.replace(X,"mouseenter$1 mouseleave$1")};p.event={add:function(a,c,d,e,f){var g,h,i,j,k,l,m,n,o,q,r;if(a.nodeType===3||a.nodeType===8||!c||!d||!(g=p._data(a)))return;d.handler&&(o=d,d=o.handler,f=o.selector),d.guid||(d.guid=p.guid++),i=g.events,i||(g.events=i={}),h=g.handle,h||(g.handle=h=function(a){return typeof p!="undefined"&&(!a||p.event.triggered!==a.type)?p.event.dispatch.apply(h.elem,arguments):b},h.elem=a),c=p.trim(_(c)).split(" ");for(j=0;j<c.length;j++){k=W.exec(c[j])||[],l=k[1],m=(k[2]||"").split(".").sort(),r=p.event.special[l]||{},l=(f?r.delegateType:r.bindType)||l,r=p.event.special[l]||{},n=p.extend({type:l,origType:k[1],data:e,handler:d,guid:d.guid,selector:f,needsContext:f&&p.expr.match.needsContext.test(f),namespace:m.join(".")},o),q=i[l];if(!q){q=i[l]=[],q.delegateCount=0;if(!r.setup||r.setup.call(a,e,m,h)===!1)a.addEventListener?a.addEventListener(l,h,!1):a.attachEvent&&a.attachEvent("on"+l,h)}r.add&&(r.add.call(a,n),n.handler.guid||(n.handler.guid=d.guid)),f?q.splice(q.delegateCount++,0,n):q.push(n),p.event.global[l]=!0}a=null},global:{},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,q,r=p.hasData(a)&&p._data(a);if(!r||!(m=r.events))return;b=p.trim(_(b||"")).split(" ");for(f=0;f<b.length;f++){g=W.exec(b[f])||[],h=i=g[1],j=g[2];if(!h){for(h in m)p.event.remove(a,h+b[f],c,d,!0);continue}n=p.event.special[h]||{},h=(d?n.delegateType:n.bindType)||h,o=m[h]||[],k=o.length,j=j?new RegExp("(^|\\.)"+j.split(".").sort().join("\\.(?:.*\\.|)")+"(\\.|$)"):null;for(l=0;l<o.length;l++)q=o[l],(e||i===q.origType)&&(!c||c.guid===q.guid)&&(!j||j.test(q.namespace))&&(!d||d===q.selector||d==="**"&&q.selector)&&(o.splice(l--,1),q.selector&&o.delegateCount--,n.remove&&n.remove.call(a,q));o.length===0&&k!==o.length&&((!n.teardown||n.teardown.call(a,j,r.handle)===!1)&&p.removeEvent(a,h,r.handle),delete m[h])}p.isEmptyObject(m)&&(delete r.handle,p.removeData(a,"events",!0))},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,f,g){if(!f||f.nodeType!==3&&f.nodeType!==8){var h,i,j,k,l,m,n,o,q,r,s=c.type||c,t=[];if($.test(s+p.event.triggered))return;s.indexOf("!")>=0&&(s=s.slice(0,-1),i=!0),s.indexOf(".")>=0&&(t=s.split("."),s=t.shift(),t.sort());if((!f||p.event.customEvent[s])&&!p.event.global[s])return;c=typeof c=="object"?c[p.expando]?c:new p.Event(s,c):new p.Event(s),c.type=s,c.isTrigger=!0,c.exclusive=i,c.namespace=t.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+t.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,m=s.indexOf(":")<0?"on"+s:"";if(!f){h=p.cache;for(j in h)h[j].events&&h[j].events[s]&&p.event.trigger(c,d,h[j].handle.elem,!0);return}c.result=b,c.target||(c.target=f),d=d!=null?p.makeArray(d):[],d.unshift(c),n=p.event.special[s]||{};if(n.trigger&&n.trigger.apply(f,d)===!1)return;q=[[f,n.bindType||s]];if(!g&&!n.noBubble&&!p.isWindow(f)){r=n.delegateType||s,k=$.test(r+s)?f:f.parentNode;for(l=f;k;k=k.parentNode)q.push([k,r]),l=k;l===(f.ownerDocument||e)&&q.push([l.defaultView||l.parentWindow||a,r])}for(j=0;j<q.length&&!c.isPropagationStopped();j++)k=q[j][0],c.type=q[j][1],o=(p._data(k,"events")||{})[c.type]&&p._data(k,"handle"),o&&o.apply(k,d),o=m&&k[m],o&&p.acceptData(k)&&o.apply&&o.apply(k,d)===!1&&c.preventDefault();return c.type=s,!g&&!c.isDefaultPrevented()&&(!n._default||n._default.apply(f.ownerDocument,d)===!1)&&(s!=="click"||!p.nodeName(f,"a"))&&p.acceptData(f)&&m&&f[s]&&(s!=="focus"&&s!=="blur"||c.target.offsetWidth!==0)&&!p.isWindow(f)&&(l=f[m],l&&(f[m]=null),p.event.triggered=s,f[s](),p.event.triggered=b,l&&(f[m]=l)),c.result}return},dispatch:function(c){c=p.event.fix(c||a.event);var d,e,f,g,h,i,j,l,m,n,o=(p._data(this,"events")||{})[c.type]||[],q=o.delegateCount,r=k.call(arguments),s=!c.exclusive&&!c.namespace,t=p.event.special[c.type]||{},u=[];r[0]=c,c.delegateTarget=this;if(t.preDispatch&&t.preDispatch.call(this,c)===!1)return;if(q&&(!c.button||c.type!=="click"))for(f=c.target;f!=this;f=f.parentNode||this)if(f.disabled!==!0||c.type!=="click"){h={},j=[];for(d=0;d<q;d++)l=o[d],m=l.selector,h[m]===b&&(h[m]=l.needsContext?p(m,this).index(f)>=0:p.find(m,this,null,[f]).length),h[m]&&j.push(l);j.length&&u.push({elem:f,matches:j})}o.length>q&&u.push({elem:this,matches:o.slice(q)});for(d=0;d<u.length&&!c.isPropagationStopped();d++){i=u[d],c.currentTarget=i.elem;for(e=0;e<i.matches.length&&!c.isImmediatePropagationStopped();e++){l=i.matches[e];if(s||!c.namespace&&!l.namespace||c.namespace_re&&c.namespace_re.test(l.namespace))c.data=l.data,c.handleObj=l,g=((p.event.special[l.origType]||{}).handle||l.handler).apply(i.elem,r),g!==b&&(c.result=g,g===!1&&(c.preventDefault(),c.stopPropagation()))}}return t.postDispatch&&t.postDispatch.call(this,c),c.result},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,c){var d,f,g,h=c.button,i=c.fromElement;return a.pageX==null&&c.clientX!=null&&(d=a.target.ownerDocument||e,f=d.documentElement,g=d.body,a.pageX=c.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=c.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?c.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0),a}},fix:function(a){if(a[p.expando])return a;var b,c,d=a,f=p.event.fixHooks[a.type]||{},g=f.props?this.props.concat(f.props):this.props;a=p.Event(d);for(b=g.length;b;)c=g[--b],a[c]=d[c];return a.target||(a.target=d.srcElement||e),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,f.filter?f.filter(a,d):a},special:{load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){p.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=p.extend(new p.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?p.event.trigger(e,null,b):p.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},p.event.handle=p.event.dispatch,p.removeEvent=e.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){var d="on"+b;a.detachEvent&&(typeof a[d]=="undefined"&&(a[d]=null),a.detachEvent(d,c))},p.Event=function(a,b){if(this instanceof p.Event)a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?bb:ba):this.type=a,b&&p.extend(this,b),this.timeStamp=a&&a.timeStamp||p.now(),this[p.expando]=!0;else return new p.Event(a,b)},p.Event.prototype={preventDefault:function(){this.isDefaultPrevented=bb;var a=this.originalEvent;if(!a)return;a.preventDefault?a.preventDefault():a.returnValue=!1},stopPropagation:function(){this.isPropagationStopped=bb;var a=this.originalEvent;if(!a)return;a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=bb,this.stopPropagation()},isDefaultPrevented:ba,isPropagationStopped:ba,isImmediatePropagationStopped:ba},p.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){p.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj,g=f.selector;if(!e||e!==d&&!p.contains(d,e))a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b;return c}}}),p.support.submitBubbles||(p.event.special.submit={setup:function(){if(p.nodeName(this,"form"))return!1;p.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=p.nodeName(c,"input")||p.nodeName(c,"button")?c.form:b;d&&!p._data(d,"_submit_attached")&&(p.event.add(d,"submit._submit",function(a){a._submit_bubble=!0}),p._data(d,"_submit_attached",!0))})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&p.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){if(p.nodeName(this,"form"))return!1;p.event.remove(this,"._submit")}}),p.support.changeBubbles||(p.event.special.change={setup:function(){if(V.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")p.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),p.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1),p.event.simulate("change",this,a,!0)});return!1}p.event.add(this,"beforeactivate._change",function(a){var b=a.target;V.test(b.nodeName)&&!p._data(b,"_change_attached")&&(p.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&p.event.simulate("change",this.parentNode,a,!0)}),p._data(b,"_change_attached",!0))})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){return p.event.remove(this,"._change"),!V.test(this.nodeName)}}),p.support.focusinBubbles||p.each({focus:"focusin",blur:"focusout"},function(a,b){var c=0,d=function(a){p.event.simulate(b,a.target,p.event.fix(a),!0)};p.event.special[b]={setup:function(){c++===0&&e.addEventListener(a,d,!0)},teardown:function(){--c===0&&e.removeEventListener(a,d,!0)}}}),p.fn.extend({on:function(a,c,d,e,f){var g,h;if(typeof a=="object"){typeof c!="string"&&(d=d||c,c=b);for(h in a)this.on(h,c,d,a[h],f);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=ba;else if(!e)return this;return f===1&&(g=e,e=function(a){return p().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=p.guid++)),this.each(function(){p.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){var e,f;if(a&&a.preventDefault&&a.handleObj)return e=a.handleObj,p(a.delegateTarget).off(e.namespace?e.origType+"."+e.namespace:e.origType,e.selector,e.handler),this;if(typeof a=="object"){for(f in a)this.off(f,c,a[f]);return this}if(c===!1||typeof c=="function")d=c,c=b;return d===!1&&(d=ba),this.each(function(){p.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){return p(this.context).on(a,this.selector,b,c),this},die:function(a,b){return p(this.context).off(a,this.selector||"**",b),this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length===1?this.off(a,"**"):this.off(b,a||"**",c)},trigger:function(a,b){return this.each(function(){p.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return p.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||p.guid++,d=0,e=function(c){var e=(p._data(this,"lastToggle"+a.guid)||0)%d;return p._data(this,"lastToggle"+a.guid,e+1),c.preventDefault(),b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),p.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){p.fn[b]=function(a,c){return c==null&&(c=a,a=null),arguments.length>0?this.on(b,null,a,c):this.trigger(b)},Y.test(b)&&(p.event.fixHooks[b]=p.event.keyHooks),Z.test(b)&&(p.event.fixHooks[b]=p.event.mouseHooks)}),function(a,b){function bc(a,b,c,d){c=c||[],b=b||r;var e,f,i,j,k=b.nodeType;if(!a||typeof a!="string")return c;if(k!==1&&k!==9)return[];i=g(b);if(!i&&!d)if(e=P.exec(a))if(j=e[1]){if(k===9){f=b.getElementById(j);if(!f||!f.parentNode)return c;if(f.id===j)return c.push(f),c}else if(b.ownerDocument&&(f=b.ownerDocument.getElementById(j))&&h(b,f)&&f.id===j)return c.push(f),c}else{if(e[2])return w.apply(c,x.call(b.getElementsByTagName(a),0)),c;if((j=e[3])&&_&&b.getElementsByClassName)return w.apply(c,x.call(b.getElementsByClassName(j),0)),c}return bp(a.replace(L,"$1"),b,c,d,i)}function bd(a){return function(b){var c=b.nodeName.toLowerCase();return c==="input"&&b.type===a}}function be(a){return function(b){var c=b.nodeName.toLowerCase();return(c==="input"||c==="button")&&b.type===a}}function bf(a){return z(function(b){return b=+b,z(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function bg(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}function bh(a,b){var c,d,f,g,h,i,j,k=C[o][a];if(k)return b?0:k.slice(0);h=a,i=[],j=e.preFilter;while(h){if(!c||(d=M.exec(h)))d&&(h=h.slice(d[0].length)),i.push(f=[]);c=!1;if(d=N.exec(h))f.push(c=new q(d.shift())),h=h.slice(c.length),c.type=d[0].replace(L," ");for(g in e.filter)(d=W[g].exec(h))&&(!j[g]||(d=j[g](d,r,!0)))&&(f.push(c=new q(d.shift())),h=h.slice(c.length),c.type=g,c.matches=d);if(!c)break}return b?h.length:h?bc.error(a):C(a,i).slice(0)}function bi(a,b,d){var e=b.dir,f=d&&b.dir==="parentNode",g=u++;return b.first?function(b,c,d){while(b=b[e])if(f||b.nodeType===1)return a(b,c,d)}:function(b,d,h){if(!h){var i,j=t+" "+g+" ",k=j+c;while(b=b[e])if(f||b.nodeType===1){if((i=b[o])===k)return b.sizset;if(typeof i=="string"&&i.indexOf(j)===0){if(b.sizset)return b}else{b[o]=k;if(a(b,d,h))return b.sizset=!0,b;b.sizset=!1}}}else while(b=b[e])if(f||b.nodeType===1)if(a(b,d,h))return b}}function bj(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function bk(a,b,c,d,e){var f,g=[],h=0,i=a.length,j=b!=null;for(;h<i;h++)if(f=a[h])if(!c||c(f,d,e))g.push(f),j&&b.push(h);return g}function bl(a,b,c,d,e,f){return d&&!d[o]&&(d=bl(d)),e&&!e[o]&&(e=bl(e,f)),z(function(f,g,h,i){if(f&&e)return;var j,k,l,m=[],n=[],o=g.length,p=f||bo(b||"*",h.nodeType?[h]:h,[],f),q=a&&(f||!b)?bk(p,m,a,h,i):p,r=c?e||(f?a:o||d)?[]:g:q;c&&c(q,r,h,i);if(d){l=bk(r,n),d(l,[],h,i),j=l.length;while(j--)if(k=l[j])r[n[j]]=!(q[n[j]]=k)}if(f){j=a&&r.length;while(j--)if(k=r[j])f[m[j]]=!(g[m[j]]=k)}else r=bk(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):w.apply(g,r)})}function bm(a){var b,c,d,f=a.length,g=e.relative[a[0].type],h=g||e.relative[" "],i=g?1:0,j=bi(function(a){return a===b},h,!0),k=bi(function(a){return y.call(b,a)>-1},h,!0),m=[function(a,c,d){return!g&&(d||c!==l)||((b=c).nodeType?j(a,c,d):k(a,c,d))}];for(;i<f;i++)if(c=e.relative[a[i].type])m=[bi(bj(m),c)];else{c=e.filter[a[i].type].apply(null,a[i].matches);if(c[o]){d=++i;for(;d<f;d++)if(e.relative[a[d].type])break;return bl(i>1&&bj(m),i>1&&a.slice(0,i-1).join("").replace(L,"$1"),c,i<d&&bm(a.slice(i,d)),d<f&&bm(a=a.slice(d)),d<f&&a.join(""))}m.push(c)}return bj(m)}function bn(a,b){var d=b.length>0,f=a.length>0,g=function(h,i,j,k,m){var n,o,p,q=[],s=0,u="0",x=h&&[],y=m!=null,z=l,A=h||f&&e.find.TAG("*",m&&i.parentNode||i),B=t+=z==null?1:Math.E;y&&(l=i!==r&&i,c=g.el);for(;(n=A[u])!=null;u++){if(f&&n){for(o=0;p=a[o];o++)if(p(n,i,j)){k.push(n);break}y&&(t=B,c=++g.el)}d&&((n=!p&&n)&&s--,h&&x.push(n))}s+=u;if(d&&u!==s){for(o=0;p=b[o];o++)p(x,q,i,j);if(h){if(s>0)while(u--)!x[u]&&!q[u]&&(q[u]=v.call(k));q=bk(q)}w.apply(k,q),y&&!h&&q.length>0&&s+b.length>1&&bc.uniqueSort(k)}return y&&(t=B,l=z),x};return g.el=0,d?z(g):g}function bo(a,b,c,d){var e=0,f=b.length;for(;e<f;e++)bc(a,b[e],c,d);return c}function bp(a,b,c,d,f){var g,h,j,k,l,m=bh(a),n=m.length;if(!d&&m.length===1){h=m[0]=m[0].slice(0);if(h.length>2&&(j=h[0]).type==="ID"&&b.nodeType===9&&!f&&e.relative[h[1].type]){b=e.find.ID(j.matches[0].replace(V,""),b,f)[0];if(!b)return c;a=a.slice(h.shift().length)}for(g=W.POS.test(a)?-1:h.length-1;g>=0;g--){j=h[g];if(e.relative[k=j.type])break;if(l=e.find[k])if(d=l(j.matches[0].replace(V,""),R.test(h[0].type)&&b.parentNode||b,f)){h.splice(g,1),a=d.length&&h.join("");if(!a)return w.apply(c,x.call(d,0)),c;break}}}return i(a,m)(d,b,f,c,R.test(a)),c}function bq(){}var c,d,e,f,g,h,i,j,k,l,m=!0,n="undefined",o=("sizcache"+Math.random()).replace(".",""),q=String,r=a.document,s=r.documentElement,t=0,u=0,v=[].pop,w=[].push,x=[].slice,y=[].indexOf||function(a){var b=0,c=this.length;for(;b<c;b++)if(this[b]===a)return b;return-1},z=function(a,b){return a[o]=b==null||b,a},A=function(){var a={},b=[];return z(function(c,d){return b.push(c)>e.cacheLength&&delete a[b.shift()],a[c]=d},a)},B=A(),C=A(),D=A(),E="[\\x20\\t\\r\\n\\f]",F="(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",G=F.replace("w","w#"),H="([*^$|!~]?=)",I="\\["+E+"*("+F+")"+E+"*(?:"+H+E+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+G+")|)|)"+E+"*\\]",J=":("+F+")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:"+I+")|[^:]|\\\\.)*|.*))\\)|)",K=":(even|odd|eq|gt|lt|nth|first|last)(?:\\("+E+"*((?:-\\d)?\\d*)"+E+"*\\)|)(?=[^-]|$)",L=new RegExp("^"+E+"+|((?:^|[^\\\\])(?:\\\\.)*)"+E+"+$","g"),M=new RegExp("^"+E+"*,"+E+"*"),N=new RegExp("^"+E+"*([\\x20\\t\\r\\n\\f>+~])"+E+"*"),O=new RegExp(J),P=/^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,Q=/^:not/,R=/[\x20\t\r\n\f]*[+~]/,S=/:not\($/,T=/h\d/i,U=/input|select|textarea|button/i,V=/\\(?!\\)/g,W={ID:new RegExp("^#("+F+")"),CLASS:new RegExp("^\\.("+F+")"),NAME:new RegExp("^\\[name=['\"]?("+F+")['\"]?\\]"),TAG:new RegExp("^("+F.replace("w","w*")+")"),ATTR:new RegExp("^"+I),PSEUDO:new RegExp("^"+J),POS:new RegExp(K,"i"),CHILD:new RegExp("^:(only|nth|first|last)-child(?:\\("+E+"*(even|odd|(([+-]|)(\\d*)n|)"+E+"*(?:([+-]|)"+E+"*(\\d+)|))"+E+"*\\)|)","i"),needsContext:new RegExp("^"+E+"*[>+~]|"+K,"i")},X=function(a){var b=r.createElement("div");try{return a(b)}catch(c){return!1}finally{b=null}},Y=X(function(a){return a.appendChild(r.createComment("")),!a.getElementsByTagName("*").length}),Z=X(function(a){return a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!==n&&a.firstChild.getAttribute("href")==="#"}),$=X(function(a){a.innerHTML="<select></select>";var b=typeof a.lastChild.getAttribute("multiple");return b!=="boolean"&&b!=="string"}),_=X(function(a){return a.innerHTML="<div class='hidden e'></div><div class='hidden'></div>",!a.getElementsByClassName||!a.getElementsByClassName("e").length?!1:(a.lastChild.className="e",a.getElementsByClassName("e").length===2)}),ba=X(function(a){a.id=o+0,a.innerHTML="<a name='"+o+"'></a><div name='"+o+"'></div>",s.insertBefore(a,s.firstChild);var b=r.getElementsByName&&r.getElementsByName(o).length===2+r.getElementsByName(o+0).length;return d=!r.getElementById(o),s.removeChild(a),b});try{x.call(s.childNodes,0)[0].nodeType}catch(bb){x=function(a){var b,c=[];for(;b=this[a];a++)c.push(b);return c}}bc.matches=function(a,b){return bc(a,null,null,b)},bc.matchesSelector=function(a,b){return bc(b,null,null,[a]).length>0},f=bc.getText=function(a){var b,c="",d=0,e=a.nodeType;if(e){if(e===1||e===9||e===11){if(typeof a.textContent=="string")return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=f(a)}else if(e===3||e===4)return a.nodeValue}else for(;b=a[d];d++)c+=f(b);return c},g=bc.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?b.nodeName!=="HTML":!1},h=bc.contains=s.contains?function(a,b){var c=a.nodeType===9?a.documentElement:a,d=b&&b.parentNode;return a===d||!!(d&&d.nodeType===1&&c.contains&&c.contains(d))}:s.compareDocumentPosition?function(a,b){return b&&!!(a.compareDocumentPosition(b)&16)}:function(a,b){while(b=b.parentNode)if(b===a)return!0;return!1},bc.attr=function(a,b){var c,d=g(a);return d||(b=b.toLowerCase()),(c=e.attrHandle[b])?c(a):d||$?a.getAttribute(b):(c=a.getAttributeNode(b),c?typeof a[b]=="boolean"?a[b]?b:null:c.specified?c.value:null:null)},e=bc.selectors={cacheLength:50,createPseudo:z,match:W,attrHandle:Z?{}:{href:function(a){return a.getAttribute("href",2)},type:function(a){return a.getAttribute("type")}},find:{ID:d?function(a,b,c){if(typeof b.getElementById!==n&&!c){var d=b.getElementById(a);return d&&d.parentNode?[d]:[]}}:function(a,c,d){if(typeof c.getElementById!==n&&!d){var e=c.getElementById(a);return e?e.id===a||typeof e.getAttributeNode!==n&&e.getAttributeNode("id").value===a?[e]:b:[]}},TAG:Y?function(a,b){if(typeof b.getElementsByTagName!==n)return b.getElementsByTagName(a)}:function(a,b){var c=b.getElementsByTagName(a);if(a==="*"){var d,e=[],f=0;for(;d=c[f];f++)d.nodeType===1&&e.push(d);return e}return c},NAME:ba&&function(a,b){if(typeof b.getElementsByName!==n)return b.getElementsByName(name)},CLASS:_&&function(a,b,c){if(typeof b.getElementsByClassName!==n&&!c)return b.getElementsByClassName(a)}},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(V,""),a[3]=(a[4]||a[5]||"").replace(V,""),a[2]==="~="&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),a[1]==="nth"?(a[2]||bc.error(a[0]),a[3]=+(a[3]?a[4]+(a[5]||1):2*(a[2]==="even"||a[2]==="odd")),a[4]=+(a[6]+a[7]||a[2]==="odd")):a[2]&&bc.error(a[0]),a},PSEUDO:function(a){var b,c;if(W.CHILD.test(a[0]))return null;if(a[3])a[2]=a[3];else if(b=a[4])O.test(b)&&(c=bh(b,!0))&&(c=b.indexOf(")",b.length-c)-b.length)&&(b=b.slice(0,c),a[0]=a[0].slice(0,c)),a[2]=b;return a.slice(0,3)}},filter:{ID:d?function(a){return a=a.replace(V,""),function(b){return b.getAttribute("id")===a}}:function(a){return a=a.replace(V,""),function(b){var c=typeof b.getAttributeNode!==n&&b.getAttributeNode("id");return c&&c.value===a}},TAG:function(a){return a==="*"?function(){return!0}:(a=a.replace(V,"").toLowerCase(),function(b){return b.nodeName&&b.nodeName.toLowerCase()===a})},CLASS:function(a){var b=B[o][a];return b||(b=B(a,new RegExp("(^|"+E+")"+a+"("+E+"|$)"))),function(a){return b.test(a.className||typeof a.getAttribute!==n&&a.getAttribute("class")||"")}},ATTR:function(a,b,c){return function(d,e){var f=bc.attr(d,a);return f==null?b==="!=":b?(f+="",b==="="?f===c:b==="!="?f!==c:b==="^="?c&&f.indexOf(c)===0:b==="*="?c&&f.indexOf(c)>-1:b==="$="?c&&f.substr(f.length-c.length)===c:b==="~="?(" "+f+" ").indexOf(c)>-1:b==="|="?f===c||f.substr(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d){return a==="nth"?function(a){var b,e,f=a.parentNode;if(c===1&&d===0)return!0;if(f){e=0;for(b=f.firstChild;b;b=b.nextSibling)if(b.nodeType===1){e++;if(a===b)break}}return e-=d,e===c||e%c===0&&e/c>=0}:function(b){var c=b;switch(a){case"only":case"first":while(c=c.previousSibling)if(c.nodeType===1)return!1;if(a==="first")return!0;c=b;case"last":while(c=c.nextSibling)if(c.nodeType===1)return!1;return!0}}},PSEUDO:function(a,b){var c,d=e.pseudos[a]||e.setFilters[a.toLowerCase()]||bc.error("unsupported pseudo: "+a);return d[o]?d(b):d.length>1?(c=[a,a,"",b],e.setFilters.hasOwnProperty(a.toLowerCase())?z(function(a,c){var e,f=d(a,b),g=f.length;while(g--)e=y.call(a,f[g]),a[e]=!(c[e]=f[g])}):function(a){return d(a,0,c)}):d}},pseudos:{not:z(function(a){var b=[],c=[],d=i(a.replace(L,"$1"));return d[o]?z(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)if(f=g[h])a[h]=!(b[h]=f)}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:z(function(a){return function(b){return bc(a,b).length>0}}),contains:z(function(a){return function(b){return(b.textContent||b.innerText||f(b)).indexOf(a)>-1}}),enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&!!a.checked||b==="option"&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},parent:function(a){return!e.pseudos.empty(a)},empty:function(a){var b;a=a.firstChild;while(a){if(a.nodeName>"@"||(b=a.nodeType)===3||b===4)return!1;a=a.nextSibling}return!0},header:function(a){return T.test(a.nodeName)},text:function(a){var b,c;return a.nodeName.toLowerCase()==="input"&&(b=a.type)==="text"&&((c=a.getAttribute("type"))==null||c.toLowerCase()===b)},radio:bd("radio"),checkbox:bd("checkbox"),file:bd("file"),password:bd("password"),image:bd("image"),submit:be("submit"),reset:be("reset"),button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&a.type==="button"||b==="button"},input:function(a){return U.test(a.nodeName)},focus:function(a){var b=a.ownerDocument;return a===b.activeElement&&(!b.hasFocus||b.hasFocus())&&(!!a.type||!!a.href)},active:function(a){return a===a.ownerDocument.activeElement},first:bf(function(a,b,c){return[0]}),last:bf(function(a,b,c){return[b-1]}),eq:bf(function(a,b,c){return[c<0?c+b:c]}),even:bf(function(a,b,c){for(var d=0;d<b;d+=2)a.push(d);return a}),odd:bf(function(a,b,c){for(var d=1;d<b;d+=2)a.push(d);return a}),lt:bf(function(a,b,c){for(var d=c<0?c+b:c;--d>=0;)a.push(d);return a}),gt:bf(function(a,b,c){for(var d=c<0?c+b:c;++d<b;)a.push(d);return a})}},j=s.compareDocumentPosition?function(a,b){return a===b?(k=!0,0):(!a.compareDocumentPosition||!b.compareDocumentPosition?a.compareDocumentPosition:a.compareDocumentPosition(b)&4)?-1:1}:function(a,b){if(a===b)return k=!0,0;if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,h=b.parentNode,i=g;if(g===h)return bg(a,b);if(!g)return-1;if(!h)return 1;while(i)e.unshift(i),i=i.parentNode;i=h;while(i)f.unshift(i),i=i.parentNode;c=e.length,d=f.length;for(var j=0;j<c&&j<d;j++)if(e[j]!==f[j])return bg(e[j],f[j]);return j===c?bg(a,f[j],-1):bg(e[j],b,1)},[0,0].sort(j),m=!k,bc.uniqueSort=function(a){var b,c=1;k=m,a.sort(j);if(k)for(;b=a[c];c++)b===a[c-1]&&a.splice(c--,1);return a},bc.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},i=bc.compile=function(a,b){var c,d=[],e=[],f=D[o][a];if(!f){b||(b=bh(a)),c=b.length;while(c--)f=bm(b[c]),f[o]?d.push(f):e.push(f);f=D(a,bn(e,d))}return f},r.querySelectorAll&&function(){var a,b=bp,c=/'|\\/g,d=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,e=[":focus"],f=[":active",":focus"],h=s.matchesSelector||s.mozMatchesSelector||s.webkitMatchesSelector||s.oMatchesSelector||s.msMatchesSelector;X(function(a){a.innerHTML="<select><option selected=''></option></select>",a.querySelectorAll("[selected]").length||e.push("\\["+E+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)"),a.querySelectorAll(":checked").length||e.push(":checked")}),X(function(a){a.innerHTML="<p test=''></p>",a.querySelectorAll("[test^='']").length&&e.push("[*^$]="+E+"*(?:\"\"|'')"),a.innerHTML="<input type='hidden'/>",a.querySelectorAll(":enabled").length||e.push(":enabled",":disabled")}),e=new RegExp(e.join("|")),bp=function(a,d,f,g,h){if(!g&&!h&&(!e||!e.test(a))){var i,j,k=!0,l=o,m=d,n=d.nodeType===9&&a;if(d.nodeType===1&&d.nodeName.toLowerCase()!=="object"){i=bh(a),(k=d.getAttribute("id"))?l=k.replace(c,"\\$&"):d.setAttribute("id",l),l="[id='"+l+"'] ",j=i.length;while(j--)i[j]=l+i[j].join("");m=R.test(a)&&d.parentNode||d,n=i.join(",")}if(n)try{return w.apply(f,x.call(m.querySelectorAll(n),0)),f}catch(p){}finally{k||d.removeAttribute("id")}}return b(a,d,f,g,h)},h&&(X(function(b){a=h.call(b,"div");try{h.call(b,"[test!='']:sizzle"),f.push("!=",J)}catch(c){}}),f=new RegExp(f.join("|")),bc.matchesSelector=function(b,c){c=c.replace(d,"='$1']");if(!g(b)&&!f.test(c)&&(!e||!e.test(c)))try{var i=h.call(b,c);if(i||a||b.document&&b.document.nodeType!==11)return i}catch(j){}return bc(c,null,null,[b]).length>0})}(),e.pseudos.nth=e.pseudos.eq,e.filters=bq.prototype=e.pseudos,e.setFilters=new bq,bc.attr=p.attr,p.find=bc,p.expr=bc.selectors,p.expr[":"]=p.expr.pseudos,p.unique=bc.uniqueSort,p.text=bc.getText,p.isXMLDoc=bc.isXML,p.contains=bc.contains}(a);var bc=/Until$/,bd=/^(?:parents|prev(?:Until|All))/,be=/^.[^:#\[\.,]*$/,bf=p.expr.match.needsContext,bg={children:!0,contents:!0,next:!0,prev:!0};p.fn.extend({find:function(a){var b,c,d,e,f,g,h=this;if(typeof a!="string")return p(a).filter(function(){for(b=0,c=h.length;b<c;b++)if(p.contains(h[b],this))return!0});g=this.pushStack("","find",a);for(b=0,c=this.length;b<c;b++){d=g.length,p.find(a,this[b],g);if(b>0)for(e=d;e<g.length;e++)for(f=0;f<d;f++)if(g[f]===g[e]){g.splice(e--,1);break}}return g},has:function(a){var b,c=p(a,this),d=c.length;return this.filter(function(){for(b=0;b<d;b++)if(p.contains(this,c[b]))return!0})},not:function(a){return this.pushStack(bj(this,a,!1),"not",a)},filter:function(a){return this.pushStack(bj(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?bf.test(a)?p(a,this.context).index(this[0])>=0:p.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c,d=0,e=this.length,f=[],g=bf.test(a)||typeof a!="string"?p(a,b||this.context):0;for(;d<e;d++){c=this[d];while(c&&c.ownerDocument&&c!==b&&c.nodeType!==11){if(g?g.index(c)>-1:p.find.matchesSelector(c,a)){f.push(c);break}c=c.parentNode}}return f=f.length>1?p.unique(f):f,this.pushStack(f,"closest",a)},index:function(a){return a?typeof a=="string"?p.inArray(this[0],p(a)):p.inArray(a.jquery?a[0]:a,this):this[0]&&this[0].parentNode?this.prevAll().length:-1},add:function(a,b){var c=typeof a=="string"?p(a,b):p.makeArray(a&&a.nodeType?[a]:a),d=p.merge(this.get(),c);return this.pushStack(bh(c[0])||bh(d[0])?d:p.unique(d))},addBack:function(a){return this.add(a==null?this.prevObject:this.prevObject.filter(a))}}),p.fn.andSelf=p.fn.addBack,p.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return p.dir(a,"parentNode")},parentsUntil:function(a,b,c){return p.dir(a,"parentNode",c)},next:function(a){return bi(a,"nextSibling")},prev:function(a){return bi(a,"previousSibling")},nextAll:function(a){return p.dir(a,"nextSibling")},prevAll:function(a){return p.dir(a,"previousSibling")},nextUntil:function(a,b,c){return p.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return p.dir(a,"previousSibling",c)},siblings:function(a){return p.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return p.sibling(a.firstChild)},contents:function(a){return p.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:p.merge([],a.childNodes)}},function(a,b){p.fn[a]=function(c,d){var e=p.map(this,b,c);return bc.test(a)||(d=c),d&&typeof d=="string"&&(e=p.filter(d,e)),e=this.length>1&&!bg[a]?p.unique(e):e,this.length>1&&bd.test(a)&&(e=e.reverse()),this.pushStack(e,a,k.call(arguments).join(","))}}),p.extend({filter:function(a,b,c){return c&&(a=":not("+a+")"),b.length===1?p.find.matchesSelector(b[0],a)?[b[0]]:[]:p.find.matches(a,b)},dir:function(a,c,d){var e=[],f=a[c];while(f&&f.nodeType!==9&&(d===b||f.nodeType!==1||!p(f).is(d)))f.nodeType===1&&e.push(f),f=f[c];return e},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var bl="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",bm=/ jQuery\d+="(?:null|\d+)"/g,bn=/^\s+/,bo=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bp=/<([\w:]+)/,bq=/<tbody/i,br=/<|&#?\w+;/,bs=/<(?:script|style|link)/i,bt=/<(?:script|object|embed|option|style)/i,bu=new RegExp("<(?:"+bl+")[\\s/>]","i"),bv=/^(?:checkbox|radio)$/,bw=/checked\s*(?:[^=]|=\s*.checked.)/i,bx=/\/(java|ecma)script/i,by=/^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,bz={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bA=bk(e),bB=bA.appendChild(e.createElement("div"));bz.optgroup=bz.option,bz.tbody=bz.tfoot=bz.colgroup=bz.caption=bz.thead,bz.th=bz.td,p.support.htmlSerialize||(bz._default=[1,"X<div>","</div>"]),p.fn.extend({text:function(a){return p.access(this,function(a){return a===b?p.text(this):this.empty().append((this[0]&&this[0].ownerDocument||e).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if(p.isFunction(a))return this.each(function(b){p(this).wrapAll(a.call(this,b))});if(this[0]){var b=p(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return p.isFunction(a)?this.each(function(b){p(this).wrapInner(a.call(this,b))}):this.each(function(){var b=p(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=p.isFunction(a);return this.each(function(c){p(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){p.nodeName(this,"body")||p(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){(this.nodeType===1||this.nodeType===11)&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){(this.nodeType===1||this.nodeType===11)&&this.insertBefore(a,this.firstChild)})},before:function(){if(!bh(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=p.clean(arguments);return this.pushStack(p.merge(a,this),"before",this.selector)}},after:function(){if(!bh(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=p.clean(arguments);return this.pushStack(p.merge(this,a),"after",this.selector)}},remove:function(a,b){var c,d=0;for(;(c=this[d])!=null;d++)if(!a||p.filter(a,[c]).length)!b&&c.nodeType===1&&(p.cleanData(c.getElementsByTagName("*")),p.cleanData([c])),c.parentNode&&c.parentNode.removeChild(c);return this},empty:function(){var a,b=0;for(;(a=this[b])!=null;b++){a.nodeType===1&&p.cleanData(a.getElementsByTagName("*"));while(a.firstChild)a.removeChild(a.firstChild)}return this},clone:function(a,b){return a=a==null?!1:a,b=b==null?a:b,this.map(function(){return p.clone(this,a,b)})},html:function(a){return p.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return c.nodeType===1?c.innerHTML.replace(bm,""):b;if(typeof a=="string"&&!bs.test(a)&&(p.support.htmlSerialize||!bu.test(a))&&(p.support.leadingWhitespace||!bn.test(a))&&!bz[(bp.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(bo,"<$1></$2>");try{for(;d<e;d++)c=this[d]||{},c.nodeType===1&&(p.cleanData(c.getElementsByTagName("*")),c.innerHTML=a);c=0}catch(f){}}c&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){return bh(this[0])?this.length?this.pushStack(p(p.isFunction(a)?a():a),"replaceWith",a):this:p.isFunction(a)?this.each(function(b){var c=p(this),d=c.html();c.replaceWith(a.call(this,b,d))}):(typeof a!="string"&&(a=p(a).detach()),this.each(function(){var b=this.nextSibling,c=this.parentNode;p(this).remove(),b?p(b).before(a):p(c).append(a)}))},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){a=[].concat.apply([],a);var e,f,g,h,i=0,j=a[0],k=[],l=this.length;if(!p.support.checkClone&&l>1&&typeof j=="string"&&bw.test(j))return this.each(function(){p(this).domManip(a,c,d)});if(p.isFunction(j))return this.each(function(e){var f=p(this);a[0]=j.call(this,e,c?f.html():b),f.domManip(a,c,d)});if(this[0]){e=p.buildFragment(a,this,k),g=e.fragment,f=g.firstChild,g.childNodes.length===1&&(g=f);if(f){c=c&&p.nodeName(f,"tr");for(h=e.cacheable||l-1;i<l;i++)d.call(c&&p.nodeName(this[i],"table")?bC(this[i],"tbody"):this[i],i===h?g:p.clone(g,!0,!0))}g=f=null,k.length&&p.each(k,function(a,b){b.src?p.ajax?p.ajax({url:b.src,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0}):p.error("no ajax"):p.globalEval((b.text||b.textContent||b.innerHTML||"").replace(by,"")),b.parentNode&&b.parentNode.removeChild(b)})}return this}}),p.buildFragment=function(a,c,d){var f,g,h,i=a[0];return c=c||e,c=!c.nodeType&&c[0]||c,c=c.ownerDocument||c,a.length===1&&typeof i=="string"&&i.length<512&&c===e&&i.charAt(0)==="<"&&!bt.test(i)&&(p.support.checkClone||!bw.test(i))&&(p.support.html5Clone||!bu.test(i))&&(g=!0,f=p.fragments[i],h=f!==b),f||(f=c.createDocumentFragment(),p.clean(a,c,f,d),g&&(p.fragments[i]=h&&f)),{fragment:f,cacheable:g}},p.fragments={},p.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){p.fn[a]=function(c){var d,e=0,f=[],g=p(c),h=g.length,i=this.length===1&&this[0].parentNode;if((i==null||i&&i.nodeType===11&&i.childNodes.length===1)&&h===1)return g[b](this[0]),this;for(;e<h;e++)d=(e>0?this.clone(!0):this).get(),p(g[e])[b](d),f=f.concat(d);return this.pushStack(f,a,g.selector)}}),p.extend({clone:function(a,b,c){var d,e,f,g;p.support.html5Clone||p.isXMLDoc(a)||!bu.test("<"+a.nodeName+">")?g=a.cloneNode(!0):(bB.innerHTML=a.outerHTML,bB.removeChild(g=bB.firstChild));if((!p.support.noCloneEvent||!p.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!p.isXMLDoc(a)){bE(a,g),d=bF(a),e=bF(g);for(f=0;d[f];++f)e[f]&&bE(d[f],e[f])}if(b){bD(a,g);if(c){d=bF(a),e=bF(g);for(f=0;d[f];++f)bD(d[f],e[f])}}return d=e=null,g},clean:function(a,b,c,d){var f,g,h,i,j,k,l,m,n,o,q,r,s=b===e&&bA,t=[];if(!b||typeof b.createDocumentFragment=="undefined")b=e;for(f=0;(h=a[f])!=null;f++){typeof h=="number"&&(h+="");if(!h)continue;if(typeof h=="string")if(!br.test(h))h=b.createTextNode(h);else{s=s||bk(b),l=b.createElement("div"),s.appendChild(l),h=h.replace(bo,"<$1></$2>"),i=(bp.exec(h)||["",""])[1].toLowerCase(),j=bz[i]||bz._default,k=j[0],l.innerHTML=j[1]+h+j[2];while(k--)l=l.lastChild;if(!p.support.tbody){m=bq.test(h),n=i==="table"&&!m?l.firstChild&&l.firstChild.childNodes:j[1]==="<table>"&&!m?l.childNodes:[];for(g=n.length-1;g>=0;--g)p.nodeName(n[g],"tbody")&&!n[g].childNodes.length&&n[g].parentNode.removeChild(n[g])}!p.support.leadingWhitespace&&bn.test(h)&&l.insertBefore(b.createTextNode(bn.exec(h)[0]),l.firstChild),h=l.childNodes,l.parentNode.removeChild(l)}h.nodeType?t.push(h):p.merge(t,h)}l&&(h=l=s=null);if(!p.support.appendChecked)for(f=0;(h=t[f])!=null;f++)p.nodeName(h,"input")?bG(h):typeof h.getElementsByTagName!="undefined"&&p.grep(h.getElementsByTagName("input"),bG);if(c){q=function(a){if(!a.type||bx.test(a.type))return d?d.push(a.parentNode?a.parentNode.removeChild(a):a):c.appendChild(a)};for(f=0;(h=t[f])!=null;f++)if(!p.nodeName(h,"script")||!q(h))c.appendChild(h),typeof h.getElementsByTagName!="undefined"&&(r=p.grep(p.merge([],h.getElementsByTagName("script")),q),t.splice.apply(t,[f+1,0].concat(r)),f+=r.length)}return t},cleanData:function(a,b){var c,d,e,f,g=0,h=p.expando,i=p.cache,j=p.support.deleteExpando,k=p.event.special;for(;(e=a[g])!=null;g++)if(b||p.acceptData(e)){d=e[h],c=d&&i[d];if(c){if(c.events)for(f in c.events)k[f]?p.event.remove(e,f):p.removeEvent(e,f,c.handle);i[d]&&(delete i[d],j?delete e[h]:e.removeAttribute?e.removeAttribute(h):e[h]=null,p.deletedIds.push(d))}}}}),function(){var a,b;p.uaMatch=function(a){a=a.toLowerCase();var b=/(chrome)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},a=p.uaMatch(g.userAgent),b={},a.browser&&(b[a.browser]=!0,b.version=a.version),b.chrome?b.webkit=!0:b.webkit&&(b.safari=!0),p.browser=b,p.sub=function(){function a(b,c){return new a.fn.init(b,c)}p.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function c(c,d){return d&&d instanceof p&&!(d instanceof a)&&(d=a(d)),p.fn.init.call(this,c,d,b)},a.fn.init.prototype=a.fn;var b=a(e);return a}}();var bH,bI,bJ,bK=/alpha\([^)]*\)/i,bL=/opacity=([^)]*)/,bM=/^(top|right|bottom|left)$/,bN=/^(none|table(?!-c[ea]).+)/,bO=/^margin/,bP=new RegExp("^("+q+")(.*)$","i"),bQ=new RegExp("^("+q+")(?!px)[a-z%]+$","i"),bR=new RegExp("^([-+])=("+q+")","i"),bS={},bT={position:"absolute",visibility:"hidden",display:"block"},bU={letterSpacing:0,fontWeight:400},bV=["Top","Right","Bottom","Left"],bW=["Webkit","O","Moz","ms"],bX=p.fn.toggle;p.fn.extend({css:function(a,c){return p.access(this,function(a,c,d){return d!==b?p.style(a,c,d):p.css(a,c)},a,c,arguments.length>1)},show:function(){return b$(this,!0)},hide:function(){return b$(this)},toggle:function(a,b){var c=typeof a=="boolean";return p.isFunction(a)&&p.isFunction(b)?bX.apply(this,arguments):this.each(function(){(c?a:bZ(this))?p(this).show():p(this).hide()})}}),p.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bH(a,"opacity");return c===""?"1":c}}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":p.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!a||a.nodeType===3||a.nodeType===8||!a.style)return;var f,g,h,i=p.camelCase(c),j=a.style;c=p.cssProps[i]||(p.cssProps[i]=bY(j,i)),h=p.cssHooks[c]||p.cssHooks[i];if(d===b)return h&&"get"in h&&(f=h.get(a,!1,e))!==b?f:j[c];g=typeof d,g==="string"&&(f=bR.exec(d))&&(d=(f[1]+1)*f[2]+parseFloat(p.css(a,c)),g="number");if(d==null||g==="number"&&isNaN(d))return;g==="number"&&!p.cssNumber[i]&&(d+="px");if(!h||!("set"in h)||(d=h.set(a,d,e))!==b)try{j[c]=d}catch(k){}},css:function(a,c,d,e){var f,g,h,i=p.camelCase(c);return c=p.cssProps[i]||(p.cssProps[i]=bY(a.style,i)),h=p.cssHooks[c]||p.cssHooks[i],h&&"get"in h&&(f=h.get(a,!0,e)),f===b&&(f=bH(a,c)),f==="normal"&&c in bU&&(f=bU[c]),d||e!==b?(g=parseFloat(f),d||p.isNumeric(g)?g||0:f):f},swap:function(a,b,c){var d,e,f={};for(e in b)f[e]=a.style[e],a.style[e]=b[e];d=c.call(a);for(e in b)a.style[e]=f[e];return d}}),a.getComputedStyle?bH=function(b,c){var d,e,f,g,h=a.getComputedStyle(b,null),i=b.style;return h&&(d=h[c],d===""&&!p.contains(b.ownerDocument,b)&&(d=p.style(b,c)),bQ.test(d)&&bO.test(c)&&(e=i.width,f=i.minWidth,g=i.maxWidth,i.minWidth=i.maxWidth=i.width=d,d=h.width,i.width=e,i.minWidth=f,i.maxWidth=g)),d}:e.documentElement.currentStyle&&(bH=function(a,b){var c,d,e=a.currentStyle&&a.currentStyle[b],f=a.style;return e==null&&f&&f[b]&&(e=f[b]),bQ.test(e)&&!bM.test(b)&&(c=f.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),f.left=b==="fontSize"?"1em":e,e=f.pixelLeft+"px",f.left=c,d&&(a.runtimeStyle.left=d)),e===""?"auto":e}),p.each(["height","width"],function(a,b){p.cssHooks[b]={get:function(a,c,d){if(c)return a.offsetWidth===0&&bN.test(bH(a,"display"))?p.swap(a,bT,function(){return cb(a,b,d)}):cb(a,b,d)},set:function(a,c,d){return b_(a,c,d?ca(a,b,d,p.support.boxSizing&&p.css(a,"boxSizing")==="border-box"):0)}}}),p.support.opacity||(p.cssHooks.opacity={get:function(a,b){return bL.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=p.isNumeric(b)?"alpha(opacity="+b*100+")":"",f=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&p.trim(f.replace(bK,""))===""&&c.removeAttribute){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bK.test(f)?f.replace(bK,e):f+" "+e}}),p(function(){p.support.reliableMarginRight||(p.cssHooks.marginRight={get:function(a,b){return p.swap(a,{display:"inline-block"},function(){if(b)return bH(a,"marginRight")})}}),!p.support.pixelPosition&&p.fn.position&&p.each(["top","left"],function(a,b){p.cssHooks[b]={get:function(a,c){if(c){var d=bH(a,b);return bQ.test(d)?p(a).position()[b]+"px":d}}}})}),p.expr&&p.expr.filters&&(p.expr.filters.hidden=function(a){return a.offsetWidth===0&&a.offsetHeight===0||!p.support.reliableHiddenOffsets&&(a.style&&a.style.display||bH(a,"display"))==="none"},p.expr.filters.visible=function(a){return!p.expr.filters.hidden(a)}),p.each({margin:"",padding:"",border:"Width"},function(a,b){p.cssHooks[a+b]={expand:function(c){var d,e=typeof c=="string"?c.split(" "):[c],f={};for(d=0;d<4;d++)f[a+bV[d]+b]=e[d]||e[d-2]||e[0];return f}},bO.test(a)||(p.cssHooks[a+b].set=b_)});var cd=/%20/g,ce=/\[\]$/,cf=/\r?\n/g,cg=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,ch=/^(?:select|textarea)/i;p.fn.extend({serialize:function(){return p.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?p.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||ch.test(this.nodeName)||cg.test(this.type))}).map(function(a,b){var c=p(this).val();return c==null?null:p.isArray(c)?p.map(c,function(a,c){return{name:b.name,value:a.replace(cf,"\r\n")}}):{name:b.name,value:c.replace(cf,"\r\n")}}).get()}}),p.param=function(a,c){var d,e=[],f=function(a,b){b=p.isFunction(b)?b():b==null?"":b,e[e.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=p.ajaxSettings&&p.ajaxSettings.traditional);if(p.isArray(a)||a.jquery&&!p.isPlainObject(a))p.each(a,function(){f(this.name,this.value)});else for(d in a)ci(d,a[d],c,f);return e.join("&").replace(cd,"+")};var cj,ck,cl=/#.*$/,cm=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,cn=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,co=/^(?:GET|HEAD)$/,cp=/^\/\//,cq=/\?/,cr=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,cs=/([?&])_=[^&]*/,ct=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,cu=p.fn.load,cv={},cw={},cx=["*/"]+["*"];try{ck=f.href}catch(cy){ck=e.createElement("a"),ck.href="",ck=ck.href}cj=ct.exec(ck.toLowerCase())||[],p.fn.load=function(a,c,d){if(typeof a!="string"&&cu)return cu.apply(this,arguments);if(!this.length)return this;var e,f,g,h=this,i=a.indexOf(" ");return i>=0&&(e=a.slice(i,a.length),a=a.slice(0,i)),p.isFunction(c)?(d=c,c=b):c&&typeof c=="object"&&(f="POST"),p.ajax({url:a,type:f,dataType:"html",data:c,complete:function(a,b){d&&h.each(d,g||[a.responseText,b,a])}}).done(function(a){g=arguments,h.html(e?p("<div>").append(a.replace(cr,"")).find(e):a)}),this},p.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){p.fn[b]=function(a){return this.on(b,a)}}),p.each(["get","post"],function(a,c){p[c]=function(a,d,e,f){return p.isFunction(d)&&(f=f||e,e=d,d=b),p.ajax({type:c,url:a,data:d,success:e,dataType:f})}}),p.extend({getScript:function(a,c){return p.get(a,b,c,"script")},getJSON:function(a,b,c){return p.get(a,b,c,"json")},ajaxSetup:function(a,b){return b?cB(a,p.ajaxSettings):(b=a,a=p.ajaxSettings),cB(a,b),a},ajaxSettings:{url:ck,isLocal:cn.test(cj[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":cx},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":p.parseJSON,"text xml":p.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:cz(cv),ajaxTransport:cz(cw),ajax:function(a,c){function y(a,c,f,i){var k,s,t,u,w,y=c;if(v===2)return;v=2,h&&clearTimeout(h),g=b,e=i||"",x.readyState=a>0?4:0,f&&(u=cC(l,x,f));if(a>=200&&a<300||a===304)l.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(p.lastModified[d]=w),w=x.getResponseHeader("Etag"),w&&(p.etag[d]=w)),a===304?(y="notmodified",k=!0):(k=cD(l,u),y=k.state,s=k.data,t=k.error,k=!t);else{t=y;if(!y||a)y="error",a<0&&(a=0)}x.status=a,x.statusText=(c||y)+"",k?o.resolveWith(m,[s,y,x]):o.rejectWith(m,[x,y,t]),x.statusCode(r),r=b,j&&n.trigger("ajax"+(k?"Success":"Error"),[x,l,k?s:t]),q.fireWith(m,[x,y]),j&&(n.trigger("ajaxComplete",[x,l]),--p.active||p.event.trigger("ajaxStop"))}typeof a=="object"&&(c=a,a=b),c=c||{};var d,e,f,g,h,i,j,k,l=p.ajaxSetup({},c),m=l.context||l,n=m!==l&&(m.nodeType||m instanceof p)?p(m):p.event,o=p.Deferred(),q=p.Callbacks("once memory"),r=l.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,setRequestHeader:function(a,b){if(!v){var c=a.toLowerCase();a=u[c]=u[c]||a,t[a]=b}return this},getAllResponseHeaders:function(){return v===2?e:null},getResponseHeader:function(a){var c;if(v===2){if(!f){f={};while(c=cm.exec(e))f[c[1].toLowerCase()]=c[2]}c=f[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){return v||(l.mimeType=a),this},abort:function(a){return a=a||w,g&&g.abort(a),y(0,a),this}};o.promise(x),x.success=x.done,x.error=x.fail,x.complete=q.add,x.statusCode=function(a){if(a){var b;if(v<2)for(b in a)r[b]=[r[b],a[b]];else b=a[x.status],x.always(b)}return this},l.url=((a||l.url)+"").replace(cl,"").replace(cp,cj[1]+"//"),l.dataTypes=p.trim(l.dataType||"*").toLowerCase().split(s),l.crossDomain==null&&(i=ct.exec(l.url.toLowerCase())||!1,l.crossDomain=i&&i.join(":")+(i[3]?"":i[1]==="http:"?80:443)!==cj.join(":")+(cj[3]?"":cj[1]==="http:"?80:443)),l.data&&l.processData&&typeof l.data!="string"&&(l.data=p.param(l.data,l.traditional)),cA(cv,l,c,x);if(v===2)return x;j=l.global,l.type=l.type.toUpperCase(),l.hasContent=!co.test(l.type),j&&p.active++===0&&p.event.trigger("ajaxStart");if(!l.hasContent){l.data&&(l.url+=(cq.test(l.url)?"&":"?")+l.data,delete l.data),d=l.url;if(l.cache===!1){var z=p.now(),A=l.url.replace(cs,"$1_="+z);l.url=A+(A===l.url?(cq.test(l.url)?"&":"?")+"_="+z:"")}}(l.data&&l.hasContent&&l.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",l.contentType),l.ifModified&&(d=d||l.url,p.lastModified[d]&&x.setRequestHeader("If-Modified-Since",p.lastModified[d]),p.etag[d]&&x.setRequestHeader("If-None-Match",p.etag[d])),x.setRequestHeader("Accept",l.dataTypes[0]&&l.accepts[l.dataTypes[0]]?l.accepts[l.dataTypes[0]]+(l.dataTypes[0]!=="*"?", "+cx+"; q=0.01":""):l.accepts["*"]);for(k in l.headers)x.setRequestHeader(k,l.headers[k]);if(!l.beforeSend||l.beforeSend.call(m,x,l)!==!1&&v!==2){w="abort";for(k in{success:1,error:1,complete:1})x[k](l[k]);g=cA(cw,l,c,x);if(!g)y(-1,"No Transport");else{x.readyState=1,j&&n.trigger("ajaxSend",[x,l]),l.async&&l.timeout>0&&(h=setTimeout(function(){x.abort("timeout")},l.timeout));try{v=1,g.send(t,y)}catch(B){if(v<2)y(-1,B);else throw B}}return x}return x.abort()},active:0,lastModified:{},etag:{}});var cE=[],cF=/\?/,cG=/(=)\?(?=&|$)|\?\?/,cH=p.now();p.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=cE.pop()||p.expando+"_"+cH++;return this[a]=!0,a}}),p.ajaxPrefilter("json jsonp",function(c,d,e){var f,g,h,i=c.data,j=c.url,k=c.jsonp!==!1,l=k&&cG.test(j),m=k&&!l&&typeof i=="string"&&!(c.contentType||"").indexOf("application/x-www-form-urlencoded")&&cG.test(i);if(c.dataTypes[0]==="jsonp"||l||m)return f=c.jsonpCallback=p.isFunction(c.jsonpCallback)?c.jsonpCallback():c.jsonpCallback,g=a[f],l?c.url=j.replace(cG,"$1"+f):m?c.data=i.replace(cG,"$1"+f):k&&(c.url+=(cF.test(j)?"&":"?")+c.jsonp+"="+f),c.converters["script json"]=function(){return h||p.error(f+" was not called"),h[0]},c.dataTypes[0]="json",a[f]=function(){h=arguments},e.always(function(){a[f]=g,c[f]&&(c.jsonpCallback=d.jsonpCallback,cE.push(f)),h&&p.isFunction(g)&&g(h[0]),h=g=b}),"script"}),p.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){return p.globalEval(a),a}}}),p.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),p.ajaxTransport("script",function(a){if(a.crossDomain){var c,d=e.head||e.getElementsByTagName("head")[0]||e.documentElement;return{send:function(f,g){c=e.createElement("script"),c.async="async",a.scriptCharset&&(c.charset=a.scriptCharset),c.src=a.url,c.onload=c.onreadystatechange=function(a,e){if(e||!c.readyState||/loaded|complete/.test(c.readyState))c.onload=c.onreadystatechange=null,d&&c.parentNode&&d.removeChild(c),c=b,e||g(200,"success")},d.insertBefore(c,d.firstChild)},abort:function(){c&&c.onload(0,1)}}}});var cI,cJ=a.ActiveXObject?function(){for(var a in cI)cI[a](0,1)}:!1,cK=0;p.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&cL()||cM()}:cL,function(a){p.extend(p.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(p.ajaxSettings.xhr()),p.support.ajax&&p.ajaxTransport(function(c){if(!c.crossDomain||p.support.cors){var d;return{send:function(e,f){var g,h,i=c.xhr();c.username?i.open(c.type,c.url,c.async,c.username,c.password):i.open(c.type,c.url,c.async);if(c.xhrFields)for(h in c.xhrFields)i[h]=c.xhrFields[h];c.mimeType&&i.overrideMimeType&&i.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(h in e)i.setRequestHeader(h,e[h])}catch(j){}i.send(c.hasContent&&c.data||null),d=function(a,e){var h,j,k,l,m;try{if(d&&(e||i.readyState===4)){d=b,g&&(i.onreadystatechange=p.noop,cJ&&delete cI[g]);if(e)i.readyState!==4&&i.abort();else{h=i.status,k=i.getAllResponseHeaders(),l={},m=i.responseXML,m&&m.documentElement&&(l.xml=m);try{l.text=i.responseText}catch(a){}try{j=i.statusText}catch(n){j=""}!h&&c.isLocal&&!c.crossDomain?h=l.text?200:404:h===1223&&(h=204)}}}catch(o){e||f(-1,o)}l&&f(h,j,l,k)},c.async?i.readyState===4?setTimeout(d,0):(g=++cK,cJ&&(cI||(cI={},p(a).unload(cJ)),cI[g]=d),i.onreadystatechange=d):d()},abort:function(){d&&d(0,1)}}}});var cN,cO,cP=/^(?:toggle|show|hide)$/,cQ=new RegExp("^(?:([-+])=|)("+q+")([a-z%]*)$","i"),cR=/queueHooks$/,cS=[cY],cT={"*":[function(a,b){var c,d,e=this.createTween(a,b),f=cQ.exec(b),g=e.cur(),h=+g||0,i=1,j=20;if(f){c=+f[2],d=f[3]||(p.cssNumber[a]?"":"px");if(d!=="px"&&h){h=p.css(e.elem,a,!0)||c||1;do i=i||".5",h=h/i,p.style(e.elem,a,h+d);while(i!==(i=e.cur()/g)&&i!==1&&--j)}e.unit=d,e.start=h,e.end=f[1]?h+(f[1]+1)*c:c}return e}]};p.Animation=p.extend(cW,{tweener:function(a,b){p.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");var c,d=0,e=a.length;for(;d<e;d++)c=a[d],cT[c]=cT[c]||[],cT[c].unshift(b)},prefilter:function(a,b){b?cS.unshift(a):cS.push(a)}}),p.Tween=cZ,cZ.prototype={constructor:cZ,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(p.cssNumber[c]?"":"px")},cur:function(){var a=cZ.propHooks[this.prop];return a&&a.get?a.get(this):cZ.propHooks._default.get(this)},run:function(a){var b,c=cZ.propHooks[this.prop];return this.options.duration?this.pos=b=p.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):cZ.propHooks._default.set(this),this}},cZ.prototype.init.prototype=cZ.prototype,cZ.propHooks={_default:{get:function(a){var b;return a.elem[a.prop]==null||!!a.elem.style&&a.elem.style[a.prop]!=null?(b=p.css(a.elem,a.prop,!1,""),!b||b==="auto"?0:b):a.elem[a.prop]},set:function(a){p.fx.step[a.prop]?p.fx.step[a.prop](a):a.elem.style&&(a.elem.style[p.cssProps[a.prop]]!=null||p.cssHooks[a.prop])?p.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},cZ.propHooks.scrollTop=cZ.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},p.each(["toggle","show","hide"],function(a,b){var c=p.fn[b];p.fn[b]=function(d,e,f){return d==null||typeof d=="boolean"||!a&&p.isFunction(d)&&p.isFunction(e)?c.apply(this,arguments):this.animate(c$(b,!0),d,e,f)}}),p.fn.extend({fadeTo:function(a,b,c,d){return this.filter(bZ).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=p.isEmptyObject(a),f=p.speed(b,c,d),g=function(){var b=cW(this,p.extend({},a),f);e&&b.stop(!0)};return e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,c,d){var e=function(a){var b=a.stop;delete a.stop,b(d)};return typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,c=a!=null&&a+"queueHooks",f=p.timers,g=p._data(this);if(c)g[c]&&g[c].stop&&e(g[c]);else for(c in g)g[c]&&g[c].stop&&cR.test(c)&&e(g[c]);for(c=f.length;c--;)f[c].elem===this&&(a==null||f[c].queue===a)&&(f[c].anim.stop(d),b=!1,f.splice(c,1));(b||!d)&&p.dequeue(this,a)})}}),p.each({slideDown:c$("show"),slideUp:c$("hide"),slideToggle:c$("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){p.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),p.speed=function(a,b,c){var d=a&&typeof a=="object"?p.extend({},a):{complete:c||!c&&b||p.isFunction(a)&&a,duration:a,easing:c&&b||b&&!p.isFunction(b)&&b};d.duration=p.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in p.fx.speeds?p.fx.speeds[d.duration]:p.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";return d.old=d.complete,d.complete=function(){p.isFunction(d.old)&&d.old.call(this),d.queue&&p.dequeue(this,d.queue)},d},p.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},p.timers=[],p.fx=cZ.prototype.init,p.fx.tick=function(){var a,b=p.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||p.fx.stop()},p.fx.timer=function(a){a()&&p.timers.push(a)&&!cO&&(cO=setInterval(p.fx.tick,p.fx.interval))},p.fx.interval=13,p.fx.stop=function(){clearInterval(cO),cO=null},p.fx.speeds={slow:600,fast:200,_default:400},p.fx.step={},p.expr&&p.expr.filters&&(p.expr.filters.animated=function(a){return p.grep(p.timers,function(b){return a===b.elem}).length});var c_=/^(?:body|html)$/i;p.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){p.offset.setOffset(this,a,b)});var c,d,e,f,g,h,i,j={top:0,left:0},k=this[0],l=k&&k.ownerDocument;if(!l)return;return(d=l.body)===k?p.offset.bodyOffset(k):(c=l.documentElement,p.contains(c,k)?(typeof k.getBoundingClientRect!="undefined"&&(j=k.getBoundingClientRect()),e=da(l),f=c.clientTop||d.clientTop||0,g=c.clientLeft||d.clientLeft||0,h=e.pageYOffset||c.scrollTop,i=e.pageXOffset||c.scrollLeft,{top:j.top+h-f,left:j.left+i-g}):j)},p.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;return p.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(p.css(a,"marginTop"))||0,c+=parseFloat(p.css(a,"marginLeft"))||0),{top:b,left:c}},setOffset:function(a,b,c){var d=p.css(a,"position");d==="static"&&(a.style.position="relative");var e=p(a),f=e.offset(),g=p.css(a,"top"),h=p.css(a,"left"),i=(d==="absolute"||d==="fixed")&&p.inArray("auto",[g,h])>-1,j={},k={},l,m;i?(k=e.position(),l=k.top,m=k.left):(l=parseFloat(g)||0,m=parseFloat(h)||0),p.isFunction(b)&&(b=b.call(a,c,f)),b.top!=null&&(j.top=b.top-f.top+l),b.left!=null&&(j.left=b.left-f.left+m),"using"in b?b.using.call(a,j):e.css(j)}},p.fn.extend({position:function(){if(!this[0])return;var a=this[0],b=this.offsetParent(),c=this.offset(),d=c_.test(b[0].nodeName)?{top:0,left:0}:b.offset();return c.top-=parseFloat(p.css(a,"marginTop"))||0,c.left-=parseFloat(p.css(a,"marginLeft"))||0,d.top+=parseFloat(p.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(p.css(b[0],"borderLeftWidth"))||0,{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||e.body;while(a&&!c_.test(a.nodeName)&&p.css(a,"position")==="static")a=a.offsetParent;return a||e.body})}}),p.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,c){var d=/Y/.test(c);p.fn[a]=function(e){return p.access(this,function(a,e,f){var g=da(a);if(f===b)return g?c in g?g[c]:g.document.documentElement[e]:a[e];g?g.scrollTo(d?p(g).scrollLeft():f,d?f:p(g).scrollTop()):a[e]=f},a,e,arguments.length,null)}}),p.each({Height:"height",Width:"width"},function(a,c){p.each({padding:"inner"+a,content:c,"":"outer"+a},function(d,e){p.fn[e]=function(e,f){var g=arguments.length&&(d||typeof e!="boolean"),h=d||(e===!0||f===!0?"margin":"border");return p.access(this,function(c,d,e){var f;return p.isWindow(c)?c.document.documentElement["client"+a]:c.nodeType===9?(f=c.documentElement,Math.max(c.body["scroll"+a],f["scroll"+a],c.body["offset"+a],f["offset"+a],f["client"+a])):e===b?p.css(c,d,e,h):p.style(c,d,e,h)},c,g?e:b,g,null)}})}),a.jQuery=a.$=p,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return p})})(window);
// source ../.reference/libjs/mask/lib/mask.js
// source ../src/umd-head.js
(function (root, factory) {
    'use strict';
    
    var _global, _exports, _document;

    
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' || window.document == null ? global : window;
	}
    
    _document = _global.document;
	_exports = root || _global;
    

    function construct(plugins){

        if (plugins == null) {
            plugins = {};
        }
        var lib = factory(_global, plugins, _document),
            key;

        for (key in plugins) {
            lib[key] = plugins[key];
        }

        return lib;
    };

    
    if (typeof exports !== 'undefined' && exports === root) {
        module.exports = construct();
        return;
    }
    if (typeof define === 'function' && define.amd) {
        define(construct);
        return;
    }
    
    var plugins = {},
        lib = construct(plugins);

    _exports.mask = lib;

    for (var key in plugins) {
        _exports[key] = plugins[key];
    }

    

}(this, function (global, exports, document) {
    'use strict';




	// source ../src/scope-vars.js
	var regexpWhitespace = /\s/g,
		regexpEscapedChar = {
			"'": /\\'/g,
			'"': /\\"/g,
			'{': /\\\{/g,
			'>': /\\>/g,
			';': /\\>/g
		},
		hasOwnProp = {}.hasOwnProperty,
		listeners = null,
		
		__cfg = {
			
			/*
			 * Relevant to node.js only, to enable compo caching
			 */
			allowCache: true
		};
	
	// source ../src/util/util.js
	function util_extend(target, source) {
	
		if (target == null) {
			target = {};
		}
		for (var key in source) {
			// if !SAFE
			if (hasOwnProp.call(source, key) === false) {
				continue;
			}
			// endif
			target[key] = source[key];
		}
		return target;
	}
	
	function util_getProperty(o, chain) {
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
	}
	
	/**
	 * - arr (Array) - array that was prepaired by parser -
	 *  every even index holds interpolate value that was in #{some value}
	 * - model: current model
	 * - type (String const) (node | attr): tell custom utils what part we are
	 *  interpolating
	 * - cntx (Object): current render context object
	 * - element (HTMLElement):
	 * type node - this is a container
	 * type attr - this is element itself
	 * - name
	 *  type attr - attribute name
	 *  type node - undefined
	 *
	 * -returns Array | String
	 *
	 * If we rendere interpolation in a TextNode, then custom util can return not only string values,
	 * but also any HTMLElement, then TextNode will be splitted and HTMLElements will be inserted within.
	 * So in that case we return array where we hold strings and that HTMLElements.
	 *
	 * If custom utils returns only strings, then String will be returned by this function
	 *
	 */
	
	function util_interpolate(arr, type, model, cntx, element, controller, name) {
		var length = arr.length,
			i = 0,
			array = null,
			string = '',
			even = true,
			utility, value, index, key, handler;
	
		for (; i < length; i++) {
			if (even === true) {
				if (array == null){
					string += arr[i];
				} else{
					array.push(arr[i]);
				}
			} else {
				key = arr[i];
				value = null;
				index = key.indexOf(':');
	
				if (index === -1) {
					value = util_getProperty(model, key);
				} else {
					utility = index > 0
						? str_trim(key.substring(0, index))
						: '';
						
					if (utility === '') {
						utility = 'expression';
					}
	
					key = key.substring(index + 1);
					handler = custom_Utils[utility];
					
					value = fn_isFunction(handler)
						? handler(key, model, cntx, element, controller, name, type)
						: handler.process(key, model, cntx, element, controller, name, type);
						
				}
	
				if (value != null){
	
					if (typeof value === 'object' && array == null){
						array = [string];
					}
	
					if (array == null){
						string += value;
					} else {
						array.push(value);
					}
	
				}
			}
	
			even = !even;
		}
	
		return array == null ? string : array;
	}
	
	// source ../src/util/template.js
	function Template(template) {
		this.template = template;
		this.index = 0;
		this.length = template.length;
	}
	
	Template.prototype = {
		skipWhitespace: function () {
	
			var template = this.template,
				index = this.index,
				length = this.length;
	
			for (; index < length; index++) {
				if (template.charCodeAt(index) > 32 /*' '*/) {
					break;
				}
			}
	
			this.index = index;
	
			return this;
		},
	
		skipToAttributeBreak: function () {
	
			var template = this.template,
				index = this.index,
				length = this.length,
				c;
			do {
				c = template.charCodeAt(++index);
				// if c == # && next() == { - continue */
				if (c === 35 && template.charCodeAt(index + 1) === 123) {
					// goto end of template declaration
					this.index = index;
					this.sliceToChar('}');
					this.index++;
					return;
				}
			}
			while (c !== 46 && c !== 35 && c !== 62 && c !== 123 && c !== 32 && c !== 59 && index < length);
			//while(!== ".#>{ ;");
	
			this.index = index;
		},
		sliceToChar: function (c) {
			var template = this.template,
				index = this.index,
				start = index,
				isEscaped = false,
				value, nindex;
	
			while ((nindex = template.indexOf(c, index)) > -1) {
				index = nindex;
				if (template.charCodeAt(index - 1) !== 92 /*'\\'*/) {
					break;
				}
				isEscaped = true;
				index++;
			}
	
			value = template.substring(start, index);
	
			this.index = index;
	
			return isEscaped ? value.replace(regexpEscapedChar[c], c) : value;
		}
	
	};
	
	// source ../src/util/string.js
	function str_trim(str) {
	
		var length = str.length,
			i = 0,
			j = length - 1,
			c;
	
		for (; i < length; i++) {
			c = str.charCodeAt(i);
			if (c < 33) {
				continue;
			}
			break;
	
		}
		
		for (; j >= i; j--) {
			c = str.charCodeAt(j);
			if (c < 33) {
				continue;
			}
			break;
		}
	
		return i === 0 && j === length - 1
			? str
			: str.substring(i, j + 1);
	}
	// source ../src/util/function.js
	function fn_isFunction(x) {
		return typeof x === 'function';
	}
	// source ../src/util/condition.js
	/**
	 *	ConditionUtil
	 *
	 *	Helper to work with conditional expressions
	 **/
	
	var ConditionUtil = (function() {
	
		function parseDirective(T, currentChar) {
			var c = currentChar,
				start = T.index,
				token;
	
			if (c == null) {
				T.skipWhitespace();
				start = T.index;
				currentChar = c = T.template.charCodeAt(T.index);
			}
	
			if (c === 34 /*"*/ || c === 39 /*'*/ ) {
	
				T.index++;
				token = T.sliceToChar(c === 39 ? "'" : '"');
				T.index++;
	
				return token;
			}
	
	
			do {
				c = T.template.charCodeAt(++T.index);
			} while (T.index < T.length && //
			c !== 32 /* */ && //
			c !== 33 /*!*/ && //
			c !== 60 /*<*/ && //
			c !== 61 /*=*/ && //
			c !== 62 /*>*/ && //
			c !== 40 /*(*/ && //
			c !== 41 /*)*/ && //
			c !== 38 /*&*/ && //
			c !== 124 /*|*/ );
	
			token = T.template.substring(start, T.index);
	
			c = currentChar;
	
			if (c === 45 || (c > 47 && c < 58)) { /* [-] || [number] */
				return token - 0;
			}
	
			if (c === 116 /*t*/ && token === 'true') {
				return true;
			}
	
			if (c === 102 /*f*/ && token === 'false') {
				return false;
			}
	
			return {
				value: token
			};
		}
	
	
	
		function parseAssertion(T, output) {
			// use shadow class
			var current = {
				assertions: null,
				join: null,
				left: null,
				right: null
			},
				c;
	
			if (output == null) {
				output = [];
			}
	
			if (typeof T === 'string') {
				T = new Template(T);
			}
			outer: while(1) {
				T.skipWhitespace();
	
				if (T.index >= T.length) {
					break;
				}
	
				c = T.template.charCodeAt(T.index);
	
				switch (c) {
				case 61:
					// <
				case 60:
					// >
				case 62:
					// !
				case 33:
					var start = T.index;
					do {
						c = T.template.charCodeAt(++T.index);
					} while (T.index < T.length && (c === 60 || c === 61 || c === 62));
	
					current.sign = T.template.substring(start, T.index);
					continue;
					// &
				case 38:
					// |
				case 124:
					if (T.template.charCodeAt(++T.index) !== c) {
						console.error('Unary operation not valid');
					}
	
					current.join = c === 38 ? '&&' : '||';
	
					output.push(current);
					current = {
						assertions: null,
						join: null,
						left: null,
						right: null
					};
	
					++T.index;
					continue;
					// (
				case 40:
					T.index++;
					parseAssertion(T, (current.assertions = []));
					break;
					// )
				case 41:
					T.index++;
					break outer;
				default:
					current[current.left == null ? 'left' : 'right'] = parseDirective(T, c);
					continue;
				}
			}
	
			if (current.left || current.assertions) {
				output.push(current);
			}
			return output;
		}
	
	
		var _cache = [];
	
		function parseLinearCondition(line) {
	
			if (_cache[line] != null) {
				return _cache[line];
			}
	
			var length = line.length,
				ternary = {
					assertions: null,
					case1: null,
					case2: null
				},
				questionMark = line.indexOf('?'),
				T = new Template(line);
	
	
			if (questionMark !== -1) {
				T.length = questionMark;
			}
	
			ternary.assertions = parseAssertion(T);
	
			if (questionMark !== -1){
				T.length = length;
				T.index = questionMark + 1;
	
				ternary.case1 = parseDirective(T);
				T.skipWhitespace();
	
				if (T.template.charCodeAt(T.index) === 58 /*:*/ ) {
					T.index++; // skip ':'
					ternary.case2 = parseDirective(T);
				}
			}
	
			return (_cache[line] = ternary);
		}
	
		function isCondition(assertions, model) {
			if (typeof assertions === 'string') {
				assertions = parseLinearCondition(assertions).assertions;
			}
	
			if (assertions.assertions != null) {
				// backwards compatible, as argument was a full condition statement
				assertions = assertions.assertions;
			}
	
			var current = false,
				a, value1, value2, i, length;
	
			for (i = 0, length = assertions.length; i < length; i++) {
				a = assertions[i];
	
				if (a.assertions) {
					current = isCondition(a.assertions, model);
				} else {
					value1 = typeof a.left === 'object' ? util_getProperty(model, a.left.value) : a.left;
	
					if (a.right == null) {
						current = value1;
						if (a.sign === '!') {
							current = !current;
						}
	
					} else {
						value2 = typeof a.right === 'object' ? util_getProperty(model, a.right.value) : a.right;
						switch (a.sign) {
						case '<':
							current = value1 < value2;
							break;
						case '<=':
							current = value1 <= value2;
							break;
						case '>':
							current = value1 > value2;
							break;
						case '>=':
							current = value1 >= value2;
							break;
						case '!=':
							current = value1 !== value2;
							break;
						case '==':
							current = value1 === value2;
							break;
						}
					}
				}
	
				if (current) {
					if (a.join === '&&') {
						continue;
					}
	
					break; // we are in OR and current is truthy
				}
	
				if (a.join === '||') {
					continue;
				}
	
				if (a.join === '&&'){
					// find OR in stack (false && false && false || true -> true)
					for(++i; i<length; i++){
						if (assertions[i].join === '||'){
							break;
						}
					}
				}
			}
			return current;
		}
	
		return {
			/**
			 *	condition(ternary[, model]) -> result
			 *	- ternary (String)
			 *	- model (Object): Data Model
			 *
			 *	Ternary Operator is evaluated via ast parsing.
			 *	All this expressions are valid:
			 *		('name=="me"',{name: 'me'}) -> true
			 *		('name=="me"?"yes"',{name: 'me'}) -> "yes"
			 *		('name=="me"? surname',{name: 'me', surname: 'you'}) -> 'you'
			 *		('name=="me" ? surname : "none"',{}) -> 'none'
			 *
			 **/
			condition: function(line, model) {
				var con = parseLinearCondition(line),
					result = isCondition(con.assertions, model);
	
				if (con.case1 != null){
					result =  result ? con.case1 : con.case2;
				}
	
				if (result == null) {
					return '';
				}
				if (typeof result === 'object' && result.value) {
					return util_getProperty(model, result.value);
				}
	
				return result;
			},
			/**
			 *	isCondition(condition, model) -> Boolean
			 * - condition (String)
			 * - model (Object)
			 *
			 *	Evaluate condition via ast parsing using specified model data
			 **/
			isCondition: isCondition,
	
			/**
			 *	parse(condition) -> Object
			 * - condition (String)
			 *
			 *	Parse condition to an AstTree.
			 **/
			parse: parseLinearCondition,
	
			/* deprecated - moved to parent */
			out: {
				isCondition: isCondition,
				parse: parseLinearCondition
			}
		};
	}());
	
	// source ../src/expression/exports.js
	/**
	 * ExpressionUtil
	 *
	 * Helper to work with expressions
	 **/
	
	var ExpressionUtil = (function(){
	
		// source 1.scope-vars.js
		
		var index = 0,
			length = 0,
			cache = {},
			template, ast;
		
		var op_Minus = '-', //1,
			op_Plus = '+', //2,
			op_Divide = '/', //3,
			op_Multip = '*', //4,
			op_Modulo = '%', //5,
			
			op_LogicalOr = '||', //6,
			op_LogicalAnd = '&&', //7,
			op_LogicalNot = '!', //8,
			op_LogicalEqual = '==', //9,
			op_LogicalNotEqual = '!=', //11,
			op_LogicalGreater = '>', //12,
			op_LogicalGreaterEqual = '>=', //13,
			op_LogicalLess = '<', //14,
			op_LogicalLessEqual = '<=', //15,
			op_Member = '.', // 16
		
			punc_ParantheseOpen = 20,
			punc_ParantheseClose = 21,
			punc_Comma = 22,
			punc_Dot = 23,
			punc_Question = 24,
			punc_Colon = 25,
		
			go_ref = 30,
			go_string = 31,
			go_number = 32;
		
		var type_Body = 1,
			type_Statement = 2,
			type_SymbolRef = 3,
			type_FunctionRef = 4,
			type_Accessor = 5,
			type_Value = 6,
		
		
			type_Number = 7,
			type_String = 8,
			type_UnaryPrefix = 9,
			type_Ternary = 10;
		
		var state_body = 1,
			state_arguments = 2;
		
		
		var precedence = {};
		
		precedence[op_Member] = 1;
		
		precedence[op_Divide] = 2;
		precedence[op_Multip] = 2;
		
		precedence[op_Minus] = 3;
		precedence[op_Plus] = 3;
		
		precedence[op_LogicalGreater] = 4;
		precedence[op_LogicalGreaterEqual] = 4;
		precedence[op_LogicalLess] = 4;
		precedence[op_LogicalLessEqual] = 4;
		
		precedence[op_LogicalEqual] = 5;
		precedence[op_LogicalNotEqual] = 5;
		
		
		precedence[op_LogicalAnd] = 6;
		precedence[op_LogicalOr] = 6;
		
		// source 2.ast.js
		function Ast_Body(parent) {
			this.parent = parent;
			this.type = type_Body;
			this.body = [];
			this.join = null;
		}
		
		function Ast_Statement(parent) {
			this.parent = parent;
		}
		Ast_Statement.prototype = {
			constructor: Ast_Statement,
			type: type_Statement,
			join: null,
			body: null
		};
		
		
		function Ast_Value(value) {
			this.type = type_Value;
			this.body = value;
			this.join = null;
		}
		
		function Ast_FunctionRef(parent, ref) {
			this.parent = parent;
			this.type = type_FunctionRef;
			this.body = ref;
			this.arguments = [];
			this.next = null;
		}
		Ast_FunctionRef.prototype = {
			constructor: Ast_FunctionRef,
			newArgument: function() {
				var body = new Ast_Body(this);
				this.arguments.push(body);
		
				return body;
			}
		};
		
		function Ast_SymbolRef(parent, ref) {
			this.parent = parent;
			this.type = type_SymbolRef;
			this.body = ref;
			this.next = null;
		}
		
		function Ast_Accessor(parent, astRef){
			this.parent = parent;
			this.body = astRef;
			this.next = null;
		}
		
		
		function Ast_UnaryPrefix(parent, prefix) {
			this.parent = parent;
			this.prefix = prefix;
		}
		Ast_UnaryPrefix.prototype = {
			constructor: Ast_UnaryPrefix,
			type: type_UnaryPrefix,
			body: null
		};
		
		
		
		function Ast_TernaryStatement(assertions){
			this.body = assertions;
			this.case1 = new Ast_Body(this);
			this.case2 = new Ast_Body(this);
		}
		Ast_TernaryStatement.prototype = {
			constructor: Ast_TernaryStatement,
			type: type_Ternary,
			case1: null,
			case2: null
		};
		
		
		function ast_append(current, next) {
			if (null == current) {
				console.error('Undefined', current, next);
			}
			var type = current.type;
		
			if (type_Body === type){
				current.body.push(next);
				return next;
			}
		
			if (type_Statement === type || type_UnaryPrefix === type){
				return current.body = next;
			}
		
			if (type_SymbolRef === type || type_FunctionRef === type){
				return current.next = next;
			}
		
			console.error('Unsupported - append:', current, next);
			return next;
		}
		
		function ast_join(){
			if (arguments.length === 0){
				return null;
			}
			var body = new Ast_Body(arguments[0].parent);
		
			body.join = arguments[arguments.length - 1].join;
			body.body = Array.prototype.slice.call(arguments);
		
			return body;
		}
		
		function ast_handlePrecedence(ast){
			if (ast.type !== type_Body){
				if (ast.body != null && typeof ast.body === 'object'){
					ast_handlePrecedence(ast.body);
				}
				return;
			}
		
			var body = ast.body,
				i = 0,
				length = body.length,
				x, prev, array;
		
			for(; i < length; i++){
				ast_handlePrecedence(body[i]);
			}
		
		
			for(i = 1; i < length; i++){
				x = body[i];
				prev = body[i-1];
		
				if (precedence[prev.join] > precedence[x.join]){
					break;
				}
			}
		
			if (i === length){
				return;
			}
		
			array = [body[0]];
			for(i = 1; i < length; i++){
				x = body[i];
				prev = body[i-1];
		
				if (precedence[prev.join] > precedence[x.join] && i < length - 1){
					x = ast_join(body[i], body[++i]);
				}
		
				array.push(x);
			}
		
			ast.body = array;
		
		}
		
		// source 3.util.js
		function _throw(message, token) {
			console.error('Expression parser:', message, token, template.substring(index));
		}
		
		
		function util_resolveRef(astRef, model, cntx, controller) {
			var current = astRef,
				key = astRef.body,
				object, value;
		
			if (value == null && model != null) {
				object = model;
				value = model[key];
			}
		
			if (value == null && cntx != null) {
				object = cntx;
				value = cntx[key];
			}
		
			if (value == null && controller != null) {
				do {
					object = controller;
					value = controller[key];
				} while (value == null && (controller = controller.parent) != null);
			}
		
			if (value != null) {
				do {
					if (current.type === type_FunctionRef) {
						var args = [];
						for (var i = 0, x, length = current.arguments.length; i < length; i++) {
							x = current.arguments[i];
							args[i] = expression_evaluate(x, model, cntx, controller);
						}
						value = value.apply(object, args);
					}
		
					if (value == null || current.next == null) {
						break;
					}
		
					current = current.next;
					key = current.body;
					object = value;
					value = value[key];
		
					if (value == null) {
						break;
					}
		
				} while (true);
			}
		
			if (value == null){
				if (current == null || current.next != null){
					_throw('Mask - Accessor error - ', key);
				}
			}
		
			return value;
		
		
		}
		
		function util_getValue(object, props, length) {
			var i = -1,
				value = object;
			while (value != null && ++i < length) {
				value = value[props[i]];
			}
			return value;
		}
		
		// source 4.parser.helper.js
		function parser_skipWhitespace() {
			var c;
			while (index < length) {
				c = template.charCodeAt(index);
				if (c > 32) {
					return c;
				}
				index++;
			}
			return null;
		}
		
		
		function parser_getString(c) {
			var isEscaped = false,
				_char = c === 39 ? "'" : '"',
				start = index,
				nindex, string;
		
			while ((nindex = template.indexOf(_char, index)) > -1) {
				index = nindex;
				if (template.charCodeAt(nindex - 1) !== 92 /*'\\'*/ ) {
					break;
				}
				isEscaped = true;
				index++;
			}
		
			string = template.substring(start, index);
			if (isEscaped === true) {
				string = string.replace(regexpEscapedChar[_char], _char);
			}
			return string;
		}
		
		function parser_getNumber() {
			var start = index,
				code, isDouble;
			while (true) {
		
				code = template.charCodeAt(index);
				if (code === 46) {
					// .
					if (isDouble === true) {
						_throw('Unexpected punc');
						return null;
					}
					isDouble = true;
				}
				if ((code >= 48 && code <= 57 || code === 46) && index < length) {
					index++;
					continue;
				}
				break;
			}
		
			return +template.substring(start, index);
		}
		
		function parser_getRef() {
			var start = index,
				c = template.charCodeAt(index),
				ref;
		
			if (c === 34 || c === 39) {
				index++;
				ref = parser_getString(c);
				index++;
				return ref;
			}
		
			while (true) {
		
				c = template.charCodeAt(index);
				if (
					c > 47 && // ()+-*,/
		
				c !== 58 && // :
				c !== 60 && // <
				c !== 61 && // =
				c !== 62 && // >
				c !== 63 && // ?
		
				c !== 124 && // |
		
				index < length) {
		
					index++;
					continue;
				}
		
				break;
			}
		
			return template.substring(start, index);
		}
		
		function parser_getDirective(code) {
			if (code == null && index === length) {
				return null;
			}
		
			switch (code) {
				case 40:
					// )
					return punc_ParantheseOpen;
				case 41:
					// )
					return punc_ParantheseClose;
				case 44:
					// ,
					return punc_Comma;
				case 46:
					// .
					return punc_Dot;
				case 43:
					// +
					return op_Plus;
				case 45:
					// -
					return op_Minus;
				case 42:
					// *
					return op_Multip;
				case 47:
					// /
					return op_Divide;
				case 37:
					// %
					return op_Modulo;
		
				case 61:
					// =
					if (template.charCodeAt(++index) !== code) {
						_throw('Not supported (Apply directive) - view can only access model/controllers');
						return null;
					}
					return op_LogicalEqual;
		
				case 33:
					// !
					if (template.charCodeAt(index + 1) === 61) {
						// =
						index++;
						return op_LogicalNotEqual;
					}
					return op_LogicalNot;
		
				case 62:
					// >
					if (template.charCodeAt(index + 1) === 61) {
						index++;
						return op_LogicalGreaterEqual;
					}
					return op_LogicalGreater;
		
				case 60:
					// <
					if (template.charCodeAt(index + 1) === 61) {
						index++;
						return op_LogicalLessEqual;
					}
					return op_LogicalLess;
		
				case 38:
					// &
					if (template.charCodeAt(++index) !== code) {
						_throw('Single Binary Operator AND');
						return null;
					}
					return op_LogicalAnd;
		
				case 124:
					// |
					if (template.charCodeAt(++index) !== code) {
						_throw('Single Binary Operator OR');
						return null;
					}
					return op_LogicalOr;
				
				case 63:
					// ?
					return punc_Question;
		
				case 58:
					// :
					return punc_Colon;
		
			}
		
			if (code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95 || code === 36) {
				// A-Z a-z _ $
				return go_ref;
			}
		
			if (code >= 48 && code <= 57) {
				// 0-9 .
				return go_number;
			}
		
			if (code === 34 || code === 39) {
				// " '
				return go_string;
			}
		
			_throw('Unexpected / Unsupported directive');
			return null;
		}
		// source 5.parser.js
		function expression_parse(expr) {
		
			template = expr;
			index = 0;
			length = expr.length;
		
			ast = new Ast_Body();
		
			var current = ast,
				state = state_body,
				c, next, directive;
		
			outer: while (true) {
		
				if (index < length && (c = template.charCodeAt(index)) < 33) {
					index++;
					continue;
				}
		
				if (index >= length) {
					break;
				}
		
				directive = parser_getDirective(c);
		
				if (directive == null && index < length) {
					break;
				}
		
				switch (directive) {
					case punc_ParantheseOpen:
						current = ast_append(current, new Ast_Statement(current));
						current = ast_append(current, new Ast_Body(current));
		
						index++;
						continue;
		
		
					case punc_ParantheseClose:
						var closest = type_Body;
						if (state === state_arguments) {
							state = state_body;
							closest = type_FunctionRef;
						}
		
						do {
							current = current.parent;
						} while (current != null && current.type !== closest);
		
						if (closest === type_Body) {
							current = current.parent;
						}
		
						if (current == null) {
							_throw('OutOfAst Exception - body closed');
							break outer;
						}
		
						index++;
						continue;
		
		
					case punc_Comma:
						if (state !== state_arguments) {
							_throw('Unexpected punctuation, comma');
							break outer;
						}
						do {
							current = current.parent;
						} while (current != null && current.type !== type_FunctionRef);
		
						if (current == null) {
							_throw('OutOfAst Exception - next argument');
							break outer;
						}
		
						current = current.newArgument();
		
						index++;
						continue;
		
					case punc_Question:
						ast = new Ast_TernaryStatement(ast);
						current = ast.case1;
		
						index++;
						continue;
		
		
					case punc_Colon:
						current = ast.case2;
		
						index++;
						continue;
		
		
					case punc_Dot:
						c = template.charCodeAt(index + 1);
						if (c >= 48 && c <= 57) {
							directive = go_number;
						} else {
							directive = go_ref;
							index++;
						}
				}
		
		
				if (current.type === type_Body) {
					current = ast_append(current, new Ast_Statement(current));
				}
		
				if ((op_Minus === directive || op_LogicalNot === directive) && current.body == null) {
					current = ast_append(current, new Ast_UnaryPrefix(current, directive));
					index++;
					continue;
				}
		
				switch (directive) {
		
					case op_Minus:
					case op_Plus:
					case op_Multip:
					case op_Divide:
					case op_Modulo:
		
					case op_LogicalAnd:
					case op_LogicalOr:
					case op_LogicalEqual:
					case op_LogicalNotEqual:
		
					case op_LogicalGreater:
					case op_LogicalGreaterEqual:
					case op_LogicalLess:
					case op_LogicalLessEqual:
		
						while (current && current.type !== type_Statement) {
							current = current.parent;
						}
		
						if (current.body == null) {
							_throw('Unexpected operator', current);
							break outer;
						}
		
						current.join = directive;
		
						do {
							current = current.parent;
						} while (current != null && current.type !== type_Body);
		
						if (current == null) {
							console.error('Unexpected parent', current);
						}
		
		
						index++;
						continue;
					case go_string:
					case go_number:
						if (current.body != null && current.join == null) {
							_throw('Directive Expected');
							break;
						}
						if (go_string === directive) {
							index++;
							ast_append(current, new Ast_Value(parser_getString(c)));
							index++;
		
						}
		
						if (go_number === directive) {
							ast_append(current, new Ast_Value(parser_getNumber(c)));
						}
		
						continue;
		
					case go_ref:
						var ref = parser_getRef();
		
						while (index < length) {
							c = template.charCodeAt(index);
							if (c < 33) {
								index++;
								continue;
							}
							break;
						}
		
						if (c === 40) {
		
							// (
							// function ref
							state = state_arguments;
							index++;
		
							var fn = ast_append(current, new Ast_FunctionRef(current, ref));
		
							current = fn.newArgument();
							continue;
						}
		
						if (c === 110 && ref === 'null') {
							ref = null;
						}
		
						if (c === 102 && ref === 'false') {
							ref = false;
						}
		
						if (c === 116 && ref === 'true') {
							ref = true;
						}
		
						current = ast_append(current, typeof ref === 'string' ? new Ast_SymbolRef(current, ref) : new Ast_Value(ref));
						
						break;
				}
			}
		
			if (current.body == null && current.type === type_Statement) {
				_throw('Unexpected end of expression');
			}
		
			ast_handlePrecedence(ast);
		
			return ast;
		}
		// source 6.eval.js
		function expression_evaluate(mix, model, cntx, controller) {
		
			var result, ast;
		
			if (mix == null){
				return null;
			}
		
			if (typeof mix === 'string'){
				if (cache.hasOwnProperty(mix) === true){
					ast = cache[mix];
				}else{
					ast = (cache[mix] = expression_parse(mix));
				}
			}else{
				ast = mix;
			}
		
			var type = ast.type,
				i, x, length;
		
			if (type_Body === type) {
				var value, prev;
		
				outer: for (i = 0, length = ast.body.length; i < length; i++) {
					x = ast.body[i];
		
					value = expression_evaluate(x, model, cntx, controller);
		
					if (prev == null) {
						prev = x;
						result = value;
						continue;
					}
		
					if (prev.join === op_LogicalAnd) {
						if (!result) {
							for (; i < length; i++) {
								if (ast.body[i].join === op_LogicalOr) {
									break;
								}
							}
						}else{
							result = value;
						}
					}
		
					if (prev.join === op_LogicalOr) {
						if (result){
							break outer;
						}
						if (value) {
							result = value;
							break outer;
						}
					}
		
					switch (prev.join) {
					case op_Minus:
						result -= value;
						break;
					case op_Plus:
						result += value;
						break;
					case op_Divide:
						result /= value;
						break;
					case op_Multip:
						result *= value;
						break;
					case op_Modulo:
						result %= value;
						break;
					case op_LogicalNotEqual:
						result = result != value;
						break;
					case op_LogicalEqual:
						result = result == value;
						break;
					case op_LogicalGreater:
						result = result > value;
						break;
					case op_LogicalGreaterEqual:
						result = result >= value;
						break;
					case op_LogicalLess:
						result = result < value;
						break;
					case op_LogicalLessEqual:
						result = result <= value;
						break;
					}
		
					prev = x;
				}
			}
		
			if (type_Statement === type) {
				return expression_evaluate(ast.body, model, cntx, controller);
			}
		
			if (type_Value === type) {
				return ast.body;
			}
		
			if (type_SymbolRef === type || type_FunctionRef === type) {
				return util_resolveRef(ast, model, cntx, controller);
			}
			
			if (type_UnaryPrefix === type) {
				result = expression_evaluate(ast.body, model, cntx, controller);
				switch (ast.prefix) {
				case op_Minus:
					result = -result;
					break;
				case op_LogicalNot:
					result = !result;
					break;
				}
			}
		
			if (type_Ternary === type){
				result = expression_evaluate(ast.body, model, cntx, controller);
				result = expression_evaluate(result ? ast.case1 : ast.case2, model, cntx, controller);
		
			}
		
			return result;
		}
		
		// source 7.vars.helper.js
		var refs_extractVars = (function() {
		
			/**
			 * extract symbol references
			 * ~[:user.name + 'px'] -> 'user.name'
			 * ~[:someFn(varName) + user.name] -> ['varName', 'user.name']
			 *
			 * ~[:someFn().user.name] -> {accessor: (Accessor AST function call) , ref: 'user.name'}
			 */
		
		
			return function(expr){
				if (typeof expr === 'string') {
					expr = expression_parse(expr);
				}
				
				return _extractVars(expr);
				
				
			};
			
			
			
			function _extractVars(expr) {
		
				if (expr == null) {
					return null;
				}
		
				var refs, x;
		
				if (type_Body === expr.type) {
		
					for (var i = 0, length = expr.body.length; i < length; i++) {
						x = _extractVars(expr.body[i]);
						refs = _append(refs, x);
					}
				}
		
				if (type_SymbolRef === expr.type) {
					var path = expr.body,
						next = expr.next;
		
					while (next != null) {
						if (type_FunctionRef === next.type) {
							return _extractVars(next);
						}
						if (type_SymbolRef !== next.type) {
							console.error('Ast Exception: next should be a symbol/function ref');
							return null;
						}
		
						path += '.' + next.body;
		
						next = next.next;
					}
		
					return path;
				}
		
		
				switch (expr.type) {
					case type_Statement:
					case type_UnaryPrefix:
					case type_Ternary:
						x = _extractVars(expr.body);
						refs = _append(refs, x);
						break;
				}
				
				// get also from case1 and case2
				if (type_Ternary === expr.type) {
					x = _extractVars(ast.case1);
					refs = _append(refs, x);
		
					x = _extractVars(ast.case2);
					refs = _append(refs, x);
				}
		
		
				if (type_FunctionRef === expr.type) {
					for(var i = 0, length = expr.arguments.length; i < length; i++){
						x = _extractVars(expr.arguments[i]);
						refs = _append(refs, x);
					}
					
					x = null;
					var parent = expr;
					outer: while ((parent = parent.parent)) {
						switch (parent.type) {
							case type_SymbolRef:
								x = parent.body + (x == null ? '' : '.' + x);
								break;
							case type_Body:
							case type_Statement:
								break outer;
							default:
								x = null;
								break outer;
						}
					}
					
					if (x != null) {
						refs = _append(refs, x);
					}
					
					if (expr.next) {
						x = _extractVars(expr.next);
						refs = _append(refs, {accessor: _getAccessor(expr), ref: x});
					}
				}
		
				return refs;
			}
			
			function _append(current, x) {
				if (current == null) {
					return x;
				}
		
				if (x == null) {
					return current;
				}
		
				if (!(typeof current === 'object' && current.length != null)) {
					current = [current];
				}
		
				if (!(typeof x === 'object' && x.length != null)) {
					
					if (current.indexOf(x) === -1) {
						current.push(x);
					}
					
					return current;
				}
				
				for (var i = 0, imax = x.length; i < imax; i++) {
					if (current.indexOf(x[i]) === -1) {
						current.push(x[i]);
					}
				}
				
				return current;
		
			}
			
			function _getAccessor(current) {
				
				var parent = current;
				
				outer: while (parent.parent) {
					switch (parent.parent.type) {
						case type_Body:
						case type_Statement:
							break outer;
					}
					parent = parent.parent;
				}
				
				return _copy(parent, current.next);
			}
			
			function _copy(ast, stop) {
				
				if (ast === stop || ast == null) {
					return null;
				}
				
				if (typeof ast !== 'object') {
					return ast;
				}
				
				if (ast.length != null && typeof ast.splice === 'function') {
					
					var arr = [];
					
					for (var i = 0, imax = ast.length; i < imax; i++){
						arr[i] = _copy(ast[i], stop);
					}
					
					return arr;
				}
				
				
				var clone = {};
				for (var key in ast) {
					if (ast[key] == null || key === 'parent') {
						continue;
					}
					clone[key] = _copy(ast[key], stop);
				}
				
				return clone;
			}
		
		}());
		
	
	
		return {
			parse: expression_parse,
			
			/**
			 * Expression.eval(expression [, model, cntx, controller]) -> result
			 * - expression (String): Expression, only accessors are supoorted
			 *
			 * All symbol and function references will be looked for in 
			 *
			 * 1. model
			 * 2. cntx
			 * 3. controller
			 * 4. controller.parent
			 * 5. and so on
			 *
			 * Sample:
			 * '(user.age + 20) / 2'
			 * 'fn(user.age + "!") + x'
			 **/
			eval: expression_evaluate,
			varRefs: refs_extractVars
		};
	
	}());
	
	// source ../src/custom.js
	var custom_Utils = {
		condition: ConditionUtil.condition,
		expression: function(value, model, cntx, element, controller){
			return ExpressionUtil.eval(value, model, cntx, controller);
		},
	},
		custom_Attributes = {
			'class': null,
			id: null,
			style: null,
			name: null,
			type: null
		},
		custom_Tags = {
			// Most common html tags
			// http://jsperf.com/not-in-vs-null/3
			div: null,
			span: null,
			input: null,
			button: null,
			textarea: null,
			select: null,
			option: null,
			h1: null,
			h2: null,
			h3: null,
			h4: null,
			h5: null,
			h6: null,
			a: null,
			p: null,
			img: null,
			table: null,
			td: null,
			tr: null,
			pre: null,
			ul: null,
			li: null,
			ol: null,
			i: null,
			b: null,
			strong: null,
			form: null
		},
		
		// use on server to define reserved tags and its meta info
		custom_Tags_defs = {};
	
	// source ../src/dom/dom.js
	
	var Dom = {
		NODE: 1,
		TEXTNODE: 2,
		FRAGMENT: 3,
		COMPONENT: 4,
		CONTROLLER: 9,
		SET: 10,
	
		Node: Node,
		TextNode: TextNode,
		Fragment: Fragment,
		Component: Component
	};
	
	function Node(tagName, parent) {
		this.type = Dom.NODE;
	
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
	}
	
	Node.prototype = {
		constructor: Node,
		type: Dom.NODE,
		tagName: null,
		parent: null,
		attr: null,
		nodes: null,
		__single: null
	};
	
	function TextNode(text, parent) {
		this.content = text;
		this.parent = parent;
		this.type = Dom.TEXTNODE;
	}
	
	TextNode.prototype = {
		type: Dom.TEXTNODE,
		content: null,
		parent: null
	};
	
	function Fragment(){
		this.nodes = [];
	}
	
	Fragment.prototype = {
		constructor: Fragment,
		type: Dom.FRAGMENT,
		nodes: null
	};
	
	function Component(compoName, parent, controller){
		this.tagName = compoName;
		this.parent = parent;
		this.controller = controller;
		this.attr = {};
	}
	
	Component.prototype = {
		constructor: Component,
		type: Dom.COMPONENT,
		parent: null,
		attr: null,
		controller: null,
		nodes: null,
		components: null,
		model: null,
		modelRef: null
	};
	
	// source ../src/parse/parser.js
	var Parser = (function(Node, TextNode, Fragment, Component) {
	
		var interp_START = '~',
			interp_CLOSE = ']',
	
			// ~
			interp_code_START = 126,
			// [
			interp_code_OPEN = 91,
			// ]
			interp_code_CLOSE = 93,
	
			_serialize;
	
	
		function ensureTemplateFunction(template) {
			var index = -1;
	
			/*
			 * - single char indexOf is much faster then '~[' search
			 * - function is divided in 2 parts: interpolation start lookup/ interpolation parse
			 * for better performance
			 */
			while ((index = template.indexOf(interp_START, index)) !== -1) {
				if (template.charCodeAt(index + 1) === interp_code_OPEN) {
					break;
				}
				index++;
			}
	
			if (index === -1) {
				return template;
			}
	
	
			var array = [],
				lastIndex = 0,
				i = 0,
				end;
	
	
			while (true) {
				end = template.indexOf(interp_CLOSE, index + 2);
				if (end === -1) {
					break;
				}
	
				array[i++] = lastIndex === index ? '' : template.substring(lastIndex, index);
				array[i++] = template.substring(index + 2, end);
	
	
				lastIndex = index = end + 1;
	
				while ((index = template.indexOf(interp_START, index)) !== -1) {
					if (template.charCodeAt(index + 1) === interp_code_OPEN) {
						break;
					}
					index++;
				}
	
				if (index === -1) {
					break;
				}
	
			}
	
			if (lastIndex < template.length) {
				array[i] = template.substring(lastIndex);
			}
	
			template = null;
			return function(type, model, cntx, element, controller, name) {
				if (type == null) {
					// http://jsperf.com/arguments-length-vs-null-check
					// this should be used to stringify parsed MaskDOM
					var string = '';
					for (var i = 0, x, length = array.length; i < length; i++) {
						x = array[i];
						if (i % 2 === 1) {
							string += '~[' + x + ']';
						} else {
							string += x;
						}
					}
					return string;
				}
	
				return util_interpolate(array, type, model, cntx, element, controller, name);
			};
	
		}
	
	
		function _throw(template, index, state, token) {
			var parsing = {
					2: 'tag',
					3: 'tag',
					5: 'attribute key',
					6: 'attribute value',
					8: 'literal'
				}[state],
	
				lines = template.substring(0, index).split('\n'),
				line = lines.length,
				row = lines[line - 1].length,
	
				message = ['Mask - Unexpected:', token, 'at(', line, ':', row, ') [ in', parsing, ']'];
	
			console.error(message.join(' '), {
				stopped: template.substring(index),
				template: template
			});
		}
	
	
	
		return {
	
			/** @out : nodes */
			parse: function(template) {
	
				//_serialize = T.serialize;
	
				var current = new Fragment(),
					fragment = current,
					state = 2,
					last = 3,
					index = 0,
					length = template.length,
					classNames,
					token,
					key,
					value,
					next,
					c, // charCode
					start,
					nextC;
	
				var go_tag = 2,
					state_tag = 3,
					state_attr = 5,
					go_attrVal = 6,
					go_attrHeadVal = 7,
					state_literal = 8,
					go_up = 9;
	
	
				outer: while (true) {
	
					if (index < length && (c = template.charCodeAt(index)) < 33) {
						index++;
						continue;
					}
	
					// inline comments
					if (c === 47 && template.charCodeAt(index + 1) === 47) {
						// /
						index++;
						while (c !== 10 && c !== 13 && index < length) {
							// goto newline
							c = template.charCodeAt(++index);
						}
						continue;
					}
	
					if (last === state_attr) {
						if (classNames != null) {
							current.attr['class'] = ensureTemplateFunction(classNames);
							classNames = null;
						}
						if (key != null) {
							current.attr[key] = key;
							key = null;
							token = null;
						}
					}
	
					if (token != null) {
	
						if (state === state_attr) {
	
							if (key == null) {
								key = token;
							} else {
								value = token;
							}
	
							if (key != null && value != null) {
								if (key !== 'class') {
									current.attr[key] = value;
								} else {
									classNames = classNames == null ? value : classNames + ' ' + value;
								}
	
								key = null;
								value = null;
							}
	
						} else if (last === state_tag) {
	
							next = custom_Tags[token] != null
								? new Component(token, current, custom_Tags[token])
								: new Node(token, current);
	
							if (current.nodes == null) {
								current.nodes = [next];
							} else {
								current.nodes.push(next);
							}
	
							current = next;
	
	
							state = state_attr;
	
						} else if (last === state_literal) {
	
							next = new TextNode(token, current);
	
							if (current.nodes == null) {
								current.nodes = [next];
							} else {
								current.nodes.push(next);
							}
	
							if (current.__single === true) {
								do {
									current = current.parent;
								} while (current != null && current.__single != null);
							}
							state = go_tag;
	
						}
	
						token = null;
					}
	
					if (index >= length) {
						if (state === state_attr) {
							if (classNames != null) {
								current.attr['class'] = ensureTemplateFunction(classNames);
							}
							if (key != null) {
								current.attr[key] = key;
							}
						}
	
						break;
					}
	
					if (state === go_up) {
						current = current.parent;
						while (current != null && current.__single != null) {
							current = current.parent;
						}
						state = go_tag;
					}
	
					switch (c) {
					case 123:
						// {
	
						last = state;
						state = go_tag;
						index++;
	
						continue;
					case 62:
						// >
						last = state;
						state = go_tag;
						index++;
						current.__single = true;
						continue;
	
	
					case 59:
						// ;
	
						// skip ; , when node is not a single tag (else goto 125)
						if (current.nodes != null) {
							index++;
							continue;
						}
	
						/* falls through */
					case 125:
						// ;}
	
						index++;
						last = state;
						state = go_up;
						continue;
	
					case 39:
					case 34:
						// '"
						// Literal - could be as textnode or attribute value
						if (state === go_attrVal) {
							state = state_attr;
						} else {
							last = state = state_literal;
						}
	
						index++;
	
	
	
						var isEscaped = false,
							isUnescapedBlock = false,
							nindex, _char = c === 39 ? "'" : '"';
	
						start = index;
	
						while ((nindex = template.indexOf(_char, index)) > -1) {
							index = nindex;
							if (template.charCodeAt(nindex - 1) !== 92 /*'\\'*/ ) {
								break;
							}
							isEscaped = true;
							index++;
						}
	
						if (start === index) {
							nextC = template.charCodeAt(index + 1);
							if (nextC === 124 || nextC === c) {
								// | (obsolete) or triple quote
								isUnescapedBlock = true;
								start = index + 2;
								index = nindex = template.indexOf((nextC === 124 ? '|' : _char) + _char + _char, start);
	
								if (index === -1) {
									index = length;
								}
	
							}
						}
	
						token = template.substring(start, index);
						if (isEscaped === true) {
							token = token.replace(regexpEscapedChar[_char], _char);
						}
	
						token = ensureTemplateFunction(token);
	
	
						index += isUnescapedBlock ? 3 : 1;
						continue;
					}
	
	
					if (state === go_tag) {
						last = state_tag;
						state = state_tag;
	
						if (c === 46 /* . */ || c === 35 /* # */ ) {
							token = 'div';
							continue;
						}
					}
	
					else if (state === state_attr) {
						if (c === 46) {
							// .
							index++;
							key = 'class';
							state = go_attrHeadVal;
						} else if (c === 35) {
							// #
							index++;
							key = 'id';
							state = go_attrHeadVal;
						} else if (c === 61) {
							// =;
							index++;
							state = go_attrVal;
							continue;
						} else {
	
							if (key != null) {
								token = key;
								continue;
							}
						}
					}
	
					if (state === go_attrVal || state === go_attrHeadVal) {
						last = state;
						state = state_attr;
					}
	
	
	
					/* TOKEN */
	
					var isInterpolated = null;
	
					start = index;
					while (index < length) {
	
						c = template.charCodeAt(index);
	
						if (c === interp_code_START && template.charCodeAt(index + 1) === interp_code_OPEN) {
							isInterpolated = true;
							++index;
							do {
								// goto end of template declaration
								c = template.charCodeAt(++index);
							}
							while (c !== interp_code_CLOSE && index < length);
						}
	
						// if DEBUG
						if (c === 0x0027 || c === 0x0022 || c === 0x002F || c === 0x003C || c === 0x002C) {
							// '"/<,
							_throw(template, index, state, String.fromCharCode(c));
							break;
						}
						// endif
	
	
						if (last !== go_attrVal && (c === 46 || c === 35)) {
							// .#
							// break on .# only if parsing attribute head values
							break;
						}
	
						if (c === 61 || c === 62 || c === 123 || c < 33 || c === 59) {
							// =>{ ;
							break;
						}
	
	
						index++;
					}
	
					token = template.substring(start, index);
	
					// if DEBUG
					if (!token) {
						_throw(template, index, state, '*EMPTY*');
						break;
					}
					if (isInterpolated === true && state === state_tag) {
						_throw(template, index, state, 'Tag Names cannt be interpolated (in dev)');
						break;
					}
					// endif
	
	
					if (isInterpolated === true && (state === state_attr && key === 'class') === false) {
						token = ensureTemplateFunction(token);
					}
	
				}
	
				////if (isNaN(c)) {
				////	_throw(template, index, state, 'Parse IndexOverflow');
				////
				////}
	
				// if DEBUG
				if (current.parent != null && current.parent !== fragment && current.parent.__single !== true && current.nodes != null) {
					console.warn('Mask - ', current.parent.tagName, JSON.stringify(current.parent.attr), 'was not proper closed.');
				}
				// endif
	
	
				return fragment.nodes.length === 1 ? fragment.nodes[0] : fragment;
			},
			cleanObject: function(obj) {
				if (obj instanceof Array) {
					for (var i = 0; i < obj.length; i++) {
						this.cleanObject(obj[i]);
					}
					return obj;
				}
				delete obj.parent;
				delete obj.__single;
	
				if (obj.nodes != null) {
					this.cleanObject(obj.nodes);
				}
	
				return obj;
			},
			setInterpolationQuotes: function(start, end) {
				if (!start || start.length !== 2) {
					console.error('Interpolation Start must contain 2 Characters');
					return;
				}
				if (!end || end.length !== 1) {
					console.error('Interpolation End must be of 1 Character');
					return;
				}
	
				interp_code_START = start.charCodeAt(0);
				interp_code_OPEN = start.charCodeAt(1);
				interp_code_CLOSE = end.charCodeAt(0);
				interp_CLOSE = end;
				interp_START = start.charAt(0);
			},
			
			ensureTemplateFunction: ensureTemplateFunction
		};
	}(Node, TextNode, Fragment, Component));
	
	// source ../src/build/builder.dom.js
	
	// source util.js
	function build_resumeDelegate(controller, model, cntx, container, childs){
		var anchor = container.appendChild(document.createComment(''));
		
		return function(){
			return build_resumeController(controller, model, cntx, anchor, childs);
		};
	}
	
	
	function build_resumeController(controller, model, cntx, anchor, childs) {
		
		
		if (controller.tagName != null && controller.tagName !== controller.compoName) {
			controller.nodes = {
				tagName: controller.tagName,
				attr: controller.attr,
				nodes: controller.nodes,
				type: 1
			};
		}
		
		if (controller.model != null) {
			model = controller.model;
		}
		
		
		var nodes = controller.nodes,
			elements = [];
		if (nodes != null) {
	
			
			var isarray = nodes instanceof Array,
				length = isarray === true ? nodes.length : 1,
				i = 0,
				childNode = null,
				fragment = document.createDocumentFragment();
	
			for (; i < length; i++) {
				childNode = isarray === true ? nodes[i] : nodes;
				
				builder_build(childNode, model, cntx, fragment, controller, elements);
			}
			
			anchor.parentNode.insertBefore(fragment, anchor);
		}
		
			
		// use or override custom attr handlers
		// in Compo.handlers.attr object
		// but only on a component, not a tag controller
		if (controller.tagName == null) {
			var attrHandlers = controller.handlers && controller.handlers.attr,
				attrFn,
				key;
			for (key in controller.attr) {
				
				attrFn = null;
				
				if (attrHandlers && fn_isFunction(attrHandlers[key])) {
					attrFn = attrHandlers[key];
				}
				
				if (attrFn == null && fn_isFunction(custom_Attributes[key])) {
					attrFn = custom_Attributes[key];
				}
				
				if (attrFn != null) {
					attrFn(node, controller.attr[key], model, cntx, elements[0], controller);
				}
			}
		}
		
		if (fn_isFunction(controller.renderEnd)) {
			/* if !DEBUG
			try{
			*/
			controller.renderEnd(elements, model, cntx, anchor.parentNode);
			/* if !DEBUG
			} catch(error){ console.error('Custom Tag Handler:', controller.tagName, error); }
			*/
		}
		
	
		if (childs != null && childs !== elements){
			var il = childs.length,
				jl = elements.length;
	
			j = -1;
			while(++j < jl){
				childs[il + j] = elements[j];
			}
		}
	}
	
	var _controllerID = 0;
	
	function builder_build(node, model, cntx, container, controller, childs) {
	
		if (node == null) {
			return container;
		}
	
		var type = node.type,
			elements = null,
			j, jmax, key, value;
	
		if (container == null && type !== 1) {
			container = document.createDocumentFragment();
		}
	
		if (controller == null) {
			controller = new Component();
		}
	
		if (type === 10 /*SET*/ || node instanceof Array){
			for(j = 0, jmax = node.length; j < jmax; j++){
				builder_build(node[j], model, cntx, container, controller, childs);
			}
			return container;
		}
	
		if (type == null){
			// in case if node was added manually, but type was not set
			if (node.tagName != null){
				type = 1;
			}
			else if (node.content != null){
				type = 2;
			}
		}
	
		// Dom.NODE
		if (type === 1){
	
			// source type.node.js
			
			var tagName = node.tagName,
				attr = node.attr,
				tag;
			
			// if DEBUG
			try {
			// endif
				tag = document.createElement(tagName);
			// if DEBUG
			} catch(error) {
				console.error(tagName, 'element cannot be created. If this should be a custom handler tag, then controller is not defined');
				return;
			}
			// endif
			
			
			if (childs != null){
				childs.push(tag);
				childs = null;
				attr['x-compo-id'] = controller.ID;
			}
			
			// ++ insert tag into container before setting attributes, so that in any
			// custom util parentNode is available. This is for mask.node important
			// http://jsperf.com/setattribute-before-after-dom-insertion/2
			if (container != null) {
				container.appendChild(tag);
			}
			
			
			for (key in attr) {
			
				/* if !SAFE
				if (hasOwnProp.call(attr, key) === false) {
					continue;
				}
				*/
			
				if (typeof attr[key] === 'function') {
					value = attr[key]('attr', model, cntx, tag, controller, key);
					if (value instanceof Array) {
						value = value.join('');
					}
			
				} else {
					value = attr[key];
				}
			
				// null or empty string will not be handled
				if (value) {
					if (typeof custom_Attributes[key] === 'function') {
						custom_Attributes[key](node, value, model, cntx, tag, controller, container);
					} else {
						tag.setAttribute(key, value);
					}
				}
			
			}
			
			
			container = tag;
			
	
		}
	
		// Dom.TEXTNODE
		if (type === 2){
	
			// source type.textNode.js
			var x, content, result, text;
			
			content = node.content;
			
			if (typeof content === 'function') {
			
				result = content('node', model, cntx, container, controller);
			
				if (typeof result === 'string') {
					container.appendChild(document.createTextNode(result));
			
				} else {
			
					text = '';
					// result is array with some htmlelements
					for (j = 0, jmax = result.length; j < jmax; j++) {
						x = result[j];
			
						if (typeof x === 'object') {
							// In this casee result[j] should be any HTMLElement
							if (text !== '') {
								container.appendChild(document.createTextNode(text));
								text = '';
							}
							if (x.nodeType == null) {
								text += x.toString();
								continue;
							}
							container.appendChild(x);
							continue;
						}
			
						text += x;
					}
					if (text !== '') {
						container.appendChild(document.createTextNode(text));
					}
				}
			
			} else {
				container.appendChild(document.createTextNode(content));
			}
			
			return container;
		}
	
		// Dom.COMPONENT
		if (type === 4) {
	
			// source type.component.js
			var Handler = node.controller,
				handler = typeof Handler === 'function' ? new Handler(model) : Handler,
				attr;
			
			if (handler != null) {
				/* if (!DEBUG)
				try{
				*/
			
				handler.compoName = node.tagName;
				handler.attr = attr = util_extend(handler.attr, node.attr);
			
			
				for (key in attr) {
					if (typeof attr[key] === 'function') {
						attr[key] = attr[key]('attr', model, cntx, container, controller, key);
					}
				}
			
				if (node.nodes != null) {
					handler.nodes = node.nodes;
				}
				
				handler.parent = controller;
			
				if (listeners != null && listeners['compoCreated'] != null) {
					var fns = listeners.compoCreated;
			
					for (j = 0, jmax = fns.length; j < jmax; j++) {
						fns[j](handler, model, cntx, container);
					}
			
				}
			
				if (typeof handler.renderStart === 'function') {
					handler.renderStart(model, cntx, container);
				}
			
				/* if (!DEBUG)
				} catch(error){ console.error('Custom Tag Handler:', node.tagName, error); }
				*/
			
			
				node = handler;
			}
			
			if (controller.components == null) {
				controller.components = [node];
			} else {
				controller.components.push(node);
			}
			
			controller = node;
			controller.ID = ++_controllerID;
			elements = [];
			
			if (controller.async === true) {
				controller.await(build_resumeDelegate(controller, model, cntx, container));
				return container;
			}
			
			if (controller.model != null) {
				model = controller.model;
			}
			
			if (handler != null && handler.tagName != null && handler.tagName !== node.compoName) {
				handler.nodes = {
					tagName: handler.tagName,
					attr: handler.attr,
					nodes: handler.nodes,
					type: 1
				};
			}
			
			
			if (typeof controller.render === 'function') {
				// with render implementation, handler overrides render behaviour of subnodes
				controller.render(model, cntx, container);
				return container;
			}
			
	
		}
	
		var nodes = node.nodes;
		if (nodes != null) {
	
			if (childs != null && elements == null){
				elements = childs;
			}
	
			var isarray = nodes instanceof Array,
				length = isarray === true ? nodes.length : 1,
				i = 0,
				childNode = null;
	
			for (; i < length; i++) {
				childNode = isarray === true ? nodes[i] : nodes;
	
				//// - moved to tag creation
				////if (type === 4 && childNode.type === 1){
				////	childNode.attr['x-compo-id'] = node.ID;
				////}
	
				builder_build(childNode, model, cntx, container, controller, elements);
			}
	
		}
	
		if (type === 4) {
			
			// use or override custom attr handlers
			// in Compo.handlers.attr object
			// but only on a component, not a tag controller
			if (node.tagName == null) {
				var attrHandlers = node.handlers && node.handlers.attr,
					attrFn,
					key;
					
				for (key in node.attr) {
					
					attrFn = null;
					
					if (attrHandlers && fn_isFunction(attrHandlers[key])) {
						attrFn = attrHandlers[key];
					}
					
					if (attrFn == null && fn_isFunction(custom_Attributes[key])) {
						attrFn = custom_Attributes[key];
					}
					
					if (attrFn != null) {
						attrFn(node, node.attr[key], model, cntx, elements[0], controller);
					}
				}
			}
			
			if (fn_isFunction(node.renderEnd)) {
				/* if !DEBUG
				try{
				*/
				node.renderEnd(elements, model, cntx, container);
				/* if !DEBUG
				} catch(error){ console.error('Custom Tag Handler:', node.tagName, error); }
				*/
			}
		}
	
		if (childs != null && childs !== elements){
			var il = childs.length,
				jl = elements.length;
	
			j = -1;
			while(++j < jl){
				childs[il + j] = elements[j];
			}
		}
	
		return container;
	}
	
	// source ../src/mask.js
	
	/**
	 *  mask
	 *
	 **/
	
	var cache = {},
		Mask = {
	
			/**
			 *	mask.render(template[, model, cntx, container = DocumentFragment, controller]) -> container
			 * - template (String | MaskDOM): Mask String or Mask DOM Json template to render from.
			 * - model (Object): template values
			 * - cntx (Object): can store any additional information, that custom handler may need,
			 * this object stays untouched and is passed to all custom handlers
			 * - container (IAppendChild): container where template is rendered into
			 * - controller (Object): instance of an controller that own this template
			 *
			 *	Create new Document Fragment from template or append rendered template to container
			 **/
			render: function (template, model, cntx, container, controller) {
	
				// if DEBUG
				if (container != null && typeof container.appendChild !== 'function'){
					console.error('.render(template[, model, cntx, container, controller]', 'Container should implement .appendChild method');
					console.warn('Args:', arguments);
				}
				// endif
	
				if (typeof template === 'string') {
					if (hasOwnProp.call(cache, template)){
						/* if Object doesnt contains property that check is faster
						then "!=null" http://jsperf.com/not-in-vs-null/2 */
						template = cache[template];
					}else{
						template = cache[template] = Parser.parse(template);
					}
				}
				
				if (cntx == null) {
					cntx = {};
				}
				
				return builder_build(template, model, cntx, container, controller);
			},
	
			/* deprecated, renamed to parse */
			compile: Parser.parse,
	
			/**
			 *	mask.parse(template) -> MaskDOM
			 * - template (String): string to be parsed into MaskDOM
			 *
			 * Create MaskDOM from Mask markup
			 **/
			parse: Parser.parse,
	
			build: builder_build,
			/**
			 * mask.registerHandler(tagName, tagHandler) -> void
			 * - tagName (String): Any tag name. Good practice for custom handlers it when its name begins with ':'
			 * - tagHandler (Function|Object):
			 *
			 *	When Mask.Builder matches the tag binded to this tagHandler, it -
			 *	creates instances of the class(in case of Function) or uses specified object.
			 *	Shallow copies -
			 *		.nodes(MaskDOM) - Template Object of this node
			 *		.attr(Object) - Attributes of this node
			 *	And calls
			 *		.renderStart(model, cntx, container)
			 *		.renderEnd(elements, model, cntx, container)
			 *
			 *	Custom Handler now can handle rendering of underlined nodes.
			 *	The most simple example to continue rendering is:
			 *	mask.render(this.nodes, model, container, cntx);
			 **/
			registerHandler: function (tagName, TagHandler) {
				custom_Tags[tagName] = TagHandler;
			},
			/**
			 *	mask.getHandler(tagName) -> Function | Object
			 * - tagName (String):
			 *
			 *	Get Registered Handler
			 **/
			getHandler: function (tagName) {
				return tagName != null
					? custom_Tags[tagName]
					: custom_Tags;
			},
	
	
			/**
			 * mask.registerAttrHandler(attrName, mix, Handler) -> void
			 * - attrName (String): any attribute string name
			 * - mix (String | Function): Render Mode or Handler Function if 'both'
			 * - Handler (Function)
			 *
			 * Handler Interface, <i>(similar to Utility Interface)</i>
			 * ``` customAttribute(maskNode, attributeValue, model, cntx, element, controller) ```
			 *
			 * You can change do any changes to maskNode's template, current element value,
			 * controller, model.
			 *
			 * Note: Attribute wont be set to an element.
			 **/
			registerAttrHandler: function(attrName, mix, Handler){
				if (fn_isFunction(mix)) {
					Handler = mix;
				}
				
				custom_Attributes[attrName] = Handler;
			},
			
			getAttrHandler: function(attrName){
				return attrName != null
					? custom_Attributes[attrName]
					: custom_Attributes;
			},
			/**
			 *	mask.registerUtil(utilName, mix) -> void
			 * - utilName (String): name of the utility
			 * - mix (Function, Object): Util Handler
			 *
			 *	Register Util Handler. Template Example: '~[myUtil: value]'
			 *
			 *	Function interface:
			 *	```
			 *	function(expr, model, cntx, element, controller, attrName, type);
			 *	```
			 *
			 *	- value (String): string from interpolation part after util definition
			 *	- model (Object): current Model
			 *	- type (String): 'attr' or 'node' - tells if interpolation is in TEXTNODE value or Attribute
			 *	- cntx (Object): Context Object
			 *	- element (HTMLNode): current html node
			 *	- name (String): If interpolation is in node attribute, then this will contain attribute name
			 *
			 *  Object interface:
			 *  ```
			 *  {
			 *  	nodeRenderStart: function(expr, model, cntx, element, controller){}
			 *  	node: function(expr, model, cntx, element, controller){}
			 *
			 *  	attrRenderStart: function(expr, model, cntx, element, controller, attrName){}
			 *  	attr: function(expr, model, cntx, element, controller, attrName){}
			 *  }
			 *  ```
			 *
			 *	This diff nodeRenderStart/node is needed to seperate util logic.
			 *	Mask in node.js will call only node-/attrRenderStart,
			 *  
			 **/
			
			registerUtil: function(utilName, mix){
				if (typeof mix === 'function') {
					custom_Utils[utilName] = mix;
					return;
				}
				
				if (typeof mix.process !== 'function') {
					mix.process = function(expr, model, cntx, element, controller, attrName, type){
						if ('node' === type) {
							
							this.nodeRenderStart(expr, model, cntx, element, controller);
							return this.node(expr, model, cntx, element, controller);
						}
						
						// asume 'attr'
						
						this.attrRenderStart(expr, model, cntx, element, controller, attrName);
						return this.attr(expr, model, cntx, element, controller, attrName);
					};
				
				}
				
				custom_Utils[utilName] = mix;
			},
			
			getUtil: function(util){
				return util != null
					? custom_Utils[util]
					: custom_Utils;
			},
			
			registerUtility: function (utilityName, fn) {
				console.warn('@registerUtility - deprecated - use registerUtil(utilName, mix)', utilityName);
				
				this.registerUtility = this.registerUtil;
				this.registerUtility(utilityName, fn);
			},
			
			getUtility: function(util){
				console.warn('@getUtility - deprecated - use getUtil(utilName)', util);
				this.getUtility = this.getUtil;
				
				return this.getUtility();
			},
			/**
			 * mask.clearCache([key]) -> void
			 * - key (String): template to remove from cache
			 *
			 *	Mask Caches all templates, so this function removes
			 *	one or all templates from cache
			 **/
			clearCache: function(key){
				if (typeof key === 'string'){
					delete cache[key];
				}else{
					cache = {};
				}
			},
			//- removed as needed interface can be implemented without this
			//- ICustomTag: ICustomTag,
	
			/** deprecated
			 *	mask.ValueUtils -> Object
			 *
			 *	see Utils.Condition Object instead
			 **/
			ValueUtils: {
				condition: ConditionUtil.condition,
				out: ConditionUtil
			},
	
			Utils: {
				Condition: ConditionUtil,
				
				/**
				 * mask.Util.Expression -> ExpressionUtil
				 *
				 * [[ExpressionUtil]]
				 **/
				Expression: ExpressionUtil,
	
				/**
				 *	mask.Util.getProperty(model, path) -> value
				 *	- model (Object | value)
				 *	- path (String): Property or dot chainable path to retrieve the value
				 *		if path is '.' returns model itself
				 *
				 *	```javascript
				 *	mask.render('span > ~[.]', 'Some string') // -> <span>Some string</span>
				 *	```
				 **/
				getProperty: util_getProperty,
				
				ensureTmplFn: Parser.ensureTemplateFunction
			},
			Dom: Dom,
			plugin: function(source){
				eval(source);
			},
			on: function(event, fn){
				if (listeners == null){
					listeners = {};
				}
	
				(listeners[event] || (listeners[event] = [])).push(fn);
			},
	
			/*
			 *	Stub for reload.js, which will be used by includejs.autoreload
			 */
			delegateReload: function(){},
	
			/**
			 *	mask.setInterpolationQuotes(start,end) -> void
			 * -start (String): Must contain 2 Characters
			 * -end (String): Must contain 1 Character
			 *
			 * Starting from 0.6.9 mask uses ~[] for string interpolation.
			 * Old '#{}' was changed to '~[]', while template is already overloaded with #, { and } usage.
			 *
			 **/
			setInterpolationQuotes: Parser.setInterpolationQuotes,
			
			
			compoIndex: function(index){
				_controllerID = index;
			},
			
			cfg: function(){
				var args = arguments;
				if (args.length === 0) {
					return __cfg;
				}
				
				var key, value;
				
				if (args.length === 2) {
					key = args[0];
					
					__cfg[key] = args[1];
					return;
				}
				
				var obj = args[0];
				if (typeof obj === 'object') {
					
					for (key in obj) {
						__cfg[key] = obj[key]
					}
				}
			}
		};
	
	
	/**	deprecated
	 *	mask.renderDom(template[, model, container, cntx]) -> container
	 *
	 * Use [[mask.render]] instead
	 * (to keep backwards compatiable)
	 **/
	Mask.renderDom = Mask.render;
	



	// source ../src/formatter/stringify.lib.js
	(function(mask){
	
	
		// source stringify.js
		
		var stringify = (function() {
		
		
			var _minimizeAttributes,
				_indent,
				Dom = mask.Dom;
		
			function doindent(count) {
				var output = '';
				while (count--) {
					output += ' ';
				}
				return output;
			}
		
		
		
			function run(node, indent, output) {
		
				var outer, i;
		
				if (indent == null) {
					indent = 0;
				}
		
				if (output == null) {
					outer = true;
					output = [];
				}
		
				var index = output.length;
		
				if (node.type === Dom.FRAGMENT){
					node = node.nodes;
				}
		
				if (node instanceof Array) {
					for (i = 0; i < node.length; i++) {
						processNode(node[i], indent, output);
					}
				} else {
					processNode(node, indent, output);
				}
		
		
				var spaces = doindent(indent);
				for (i = index; i < output.length; i++) {
					output[i] = spaces + output[i];
				}
		
				if (outer) {
					return output.join(_indent === 0 ? '' : '\n');
				}
		
			}
		
			function processNode(node, currentIndent, output) {
				if (typeof node.content === 'string') {
					output.push(wrapString(node.content));
					return;
				}
		
				if (typeof node.content === 'function'){
					output.push(wrapString(node.content()));
					return;
				}
		
				if (isEmpty(node)) {
					output.push(processNodeHead(node) + ';');
					return;
				}
		
				if (isSingle(node)) {
					output.push(processNodeHead(node) + ' > ');
					run(getSingle(node), _indent, output);
					return;
				}
		
				output.push(processNodeHead(node) + '{');
				run(node.nodes, _indent, output);
				output.push('}');
				return;
			}
		
			function processNodeHead(node) {
				var tagName = node.tagName,
					_id = node.attr.id || '',
					_class = node.attr['class'] || '';
		
		
				if (typeof _id === 'function'){
					_id = _id();
				}
				if (typeof _class === 'function'){
					_class = _class();
				}
		
				if (_id) {
					if (_id.indexOf(' ') !== -1) {
						_id = '';
					} else {
						_id = '#' + _id;
					}
				}
		
				if (_class) {
					_class = '.' + _class.split(' ').join('.');
				}
		
				var attr = '';
		
				for (var key in node.attr) {
					if (key === 'id' || key === 'class') {
						// the properties was not deleted as this template can be used later
						continue;
					}
					var value = node.attr[key];
		
					if (typeof value === 'function'){
						value = value();
					}
		
					if (_minimizeAttributes === false || /\s/.test(value)){
						value = wrapString(value);
					}
		
					attr += ' ' + key + '=' + value;
				}
		
				if (tagName === 'div' && (_id || _class)) {
					tagName = '';
				}
		
				return tagName + _id + _class + attr;
			}
		
		
			function isEmpty(node) {
				return node.nodes == null || (node.nodes instanceof Array && node.nodes.length === 0);
			}
		
			function isSingle(node) {
				return node.nodes && (node.nodes instanceof Array === false || node.nodes.length === 1);
			}
		
			function getSingle(node) {
				if (node.nodes instanceof Array) {
					return node.nodes[0];
				}
				return node.nodes;
			}
		
			function wrapString(str) {
				if (str.indexOf('"') === -1) {
					return '"' + str.trim() + '"';
				}
		
				if (str.indexOf("'") === -1) {
					return "'" + str.trim() + "'";
				}
		
				return '"' + str.replace(/"/g, '\\"').trim() + '"';
			}
		
			/**
			 *	- settings (Number | Object) - Indention Number (0 - for minification)
			 **/
			return function(input, settings) {
				if (input == null) {
					return '';
				}
				
				if (typeof input === 'string') {
					input = mask.parse(input);
				}
		
		
				if (typeof settings === 'number'){
					_indent = settings;
					_minimizeAttributes = _indent === 0;
				}else{
					_indent = settings && settings.indent || 4;
					_minimizeAttributes = _indent === 0 || settings && settings.minimizeAttributes;
				}
		
		
				return run(input);
			};
		}());
		
	
		mask.stringify = stringify;
	
	}(Mask));
	

	/* Handlers */

	// source ../src/handlers/sys.js
	(function(mask) {
	
		function Sys() {
			this.attr = {};
		}
	
		mask.registerHandler('%', Sys);
	
		Sys.prototype = {
			'debugger': null,
			'use': null,
			'repeat': null,
			'if': null,
			'else': null,
			'each': null,
			'log': null,
			'visible': null,
			'model': null,
			
			constructor: Sys,
			renderStart: function(model, cntx, container) {
				var attr = this.attr;
	
				if (attr['use'] != null) {
					var use = attr['use'];
					this.model = util_getProperty(model, use);
					this.modelRef = use;
					return;
				}
	
				if (attr['debugger'] != null) {
					debugger;
					return;
				}
				
				if (attr['visible'] != null) {
					var state = ExpressionUtil.eval(attr.visible, model, cntx, this.parent);
					if (!state) {
						this.nodes = null;
					}
					return;
				}
	
				if (attr['log'] != null) {
					var key = attr.log,
						value = util_getProperty(model, key);
	
					console.log('Key: %s, Value: %s', key, value);
					return;
				}
	
				if (attr['repeat'] != null) {
					repeat(this, model, cntx, container);
				}
	
				if (attr['if'] != null) {
					var check = attr['if'];
	
					this.state = ConditionUtil.isCondition(check, model);
	
					if (!this.state) {
						this.nodes = null;
					}
					return;
				}
	
				if (attr['else'] != null) {
					var compos = this.parent.components,
						prev = compos && compos[compos.length - 1];
	
					if (prev != null && prev.compoName === '%' && prev.attr['if'] != null) {
	
						if (prev.state) {
							this.nodes = null;
						}
						return;
					}
					console.error('Previous Node should be "% if=\'condition\'"', prev, this.parent);
					return;
				}
	
				// foreach is deprecated
				if (attr['each'] != null || attr['foreach'] != null) {
					each(this, model, cntx, container);
				}
			},
			render: null
		};
	
	
		function each(compo, model, cntx, container){
			if (compo.nodes == null && typeof Compo !== 'undefined'){
				Compo.ensureTemplate(compo);
			}
	
			var prop = compo.attr.foreach || compo.attr.each,
				array = util_getProperty(model, prop),
				nodes = compo.nodes,
				item = null,
				indexAttr = compo.attr.index || 'index';
	
			if (array == null) {
				var parent = compo;
				while (parent != null && array == null) {
					array = util_getProperty(parent, prop);
					parent = parent.parent;
				}
			}
			
			compo.nodes = [];
			compo.model = array;
			compo.modelRef = prop;
			
			compo.template = nodes;
			compo.container = container;
			
	
			if (array == null || typeof array !== 'object' || array.length == null){
				return;
			}
	
			for (var i = 0, x, length = array.length; i < length; i++) {
				x = compo_init(nodes, array[i], i, container, compo);
				x[indexAttr] = i;
				compo.nodes[i] = x;
			}
	
			for(var method in ListProto){
				compo[method] = ListProto[method];
			}
		}
	
		function repeat(compo, model, cntx, container) {
			var repeat = compo.attr.repeat.split('..'),
				index = +repeat[0],
				length = +repeat[1],
				template = compo.nodes,
				x;
	
			// if DEBUG
			(isNaN(index) || isNaN(length)) && console.error('Repeat attribute(from..to) invalid', compo.attr.repeat);
			// endif
	
			compo.nodes = [];
	
			for (var i = 0; index < length; index++) {
				x = compo_init(template, model, index, container, compo);
				x._repeatIndex = index;
	
				compo.nodes[i++] = x;
			}
		}
	
		function compo_init(nodes, model, modelRef, container, parent) {
			var item = new Component();
			item.nodes = nodes;
			item.model = model;
			item.container = container;
			item.parent = parent;
			item.modelRef = modelRef;
	
			return item;
		}
	
	
		var ListProto = {
			append: function(model){
				var item;
				item = new Component();
				item.nodes = this.template;
				item.model = model;
	
				mask.render(item, model, null, this.container, this);
			}
		};
	
	}(Mask));
	
	// source ../src/handlers/utils.js
	(function(mask) {
	
		/**
		 *	:template
		 *
		 *	Child nodes wont be rendered. You can resolve it as custom component and get its nodes for some use
		 *
		 **/
	
		var TemplateCollection = {};
	
		mask.templates = TemplateCollection;
	
		mask.registerHandler(':template', TemplateHandler);
	
		function TemplateHandler() {}
		TemplateHandler.prototype.render = function() {
			if (this.attr.id == null) {
				console.warn('Template Should be defined with ID attribute for future lookup');
				return;
			}
	
			TemplateCollection[this.attr.id] = this.nodes;
		};
	
	
		mask.registerHandler(':import', ImportHandler);
	
		function ImportHandler() {}
		ImportHandler.prototype = {
			constructor: ImportHandler,
			attr: null,
			template: null,
	
			renderStart: function() {
				if (this.attr.id) {
	
					this.nodes = this.template;
	
					if (this.nodes == null) {
						this.nodes = TemplateCollection[this.attr.id];
					}
	
					// @TODO = optimize, not use jmask
					if (this.nodes == null) {
						var parent = this,
							template,
							selector = ':template[id='+this.attr.id+']';
	
						while (template == null && (parent = parent.parent) != null) {
							if (parent.nodes != null) {
								template = jmask(parent.nodes).filter(selector).get(0);
							}
						}
	
						if (template != null) {
							this.nodes = template.nodes;
						}
	
	
					}
	
					// @TODO = load template from remote
					if (this.nodes == null) {
						console.warn('Template could be not imported', this.attr.id);
					}
				}
			}
		};
	
	
		/**
		 *	:html
		 *
		 *	Shoud contain literal, that will be added as innerHTML to parents node
		 *
		 **/
		mask.registerHandler(':html', HTMLHandler);
	
		function HTMLHandler() {}
		
		HTMLHandler.prototype = {
			mode: 'server:all',
			render: function(model, cntx, container) {
	
				var html = jmask(this.nodes).text(model, cntx, this);
		
				if (!html) {
					console.warn('No HTML for node', this);
					return;
				}
				
				if (container.insertAdjacentHTML) {
					container.insertAdjacentHTML('beforeend', html);
					return;
				}
			
				this.toHtml = function(){
					return html;
				};
				
			}
		};
	
	}(Mask));
	

	// source ../src/libs/compo.js
	
	var Compo = exports.Compo = (function(mask){
		'use strict';
		// source ../src/scope-vars.js
		var domLib = global.jQuery || global.Zepto || global.$,
			Dom = mask.Dom,
			__array_slice = Array.prototype.slice,
			
			_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn;
		
		function _mask_ensureTmplFn(value) {
			if (typeof value !== 'string') {
				return value;
			}
			return _mask_ensureTmplFnOrig(value);
		}
		
		if (document != null && domLib == null){
			console.warn('jQuery / Zepto etc. was not loaded before compo.js, please use Compo.config.setDOMLibrary to define dom engine');
		}
		
	
		// source ../src/util/object.js
		function obj_extend(target, source){
			if (target == null){
				target = {};
			}
			if (source == null){
				return target;
			}
		
			for(var key in source){
				target[key] = source[key];
			}
		
			return target;
		}
		
		function obj_copy(object) {
			var copy = {};
		
			for (var key in object) {
				copy[key] = object[key];
			}
		
			return copy;
		}
		
		// source ../src/util/function.js
		function fn_proxy(fn, context) {
			
			return function(){
				return fn.apply(context, arguments);
			};
			
		}
		// source ../src/util/selector.js
		function selector_parse(selector, type, direction) {
			if (selector == null){
				console.warn('selector is null for type', type);
			}
		
			if (typeof selector === 'object'){
				return selector;
			}
		
			var key, prop, nextKey;
		
			if (key == null) {
				switch (selector[0]) {
				case '#':
					key = 'id';
					selector = selector.substring(1);
					prop = 'attr';
					break;
				case '.':
					key = 'class';
					selector = new RegExp('\\b' + selector.substring(1) + '\\b');
					prop = 'attr';
					break;
				default:
					key = type === Dom.SET ? 'tagName' : 'compoName';
					break;
				}
			}
		
			if (direction === 'up') {
				nextKey = 'parent';
			} else {
				nextKey = type === Dom.SET ? 'nodes' : 'components';
			}
		
			return {
				key: key,
				prop: prop,
				selector: selector,
				nextKey: nextKey
			};
		}
		
		function selector_match(node, selector, type) {
			if (typeof selector === 'string') {
				if (type == null) {
					type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
				}
				selector = selector_parse(selector, type);
			}
		
			var obj = selector.prop ? node[selector.prop] : node;
			if (obj == null) {
				return false;
			}
		
			if (selector.selector.test != null) {
				if (selector.selector.test(obj[selector.key])) {
					return true;
				}
			} else {
				// == - to match int and string
				if (obj[selector.key] == selector.selector) {
					return true;
				}
			}
		
			return false;
		}
		
		// source ../src/util/traverse.js
		function find_findSingle(node, matcher) {
			if (node instanceof Array) {
				for (var i = 0, x, length = node.length; i < length; i++) {
					x = node[i];
					var r = find_findSingle(x, matcher);
					if (r != null) {
						return r;
					}
				}
				return null;
			}
		
			if (selector_match(node, matcher) === true) {
				return node;
			}
			return (node = node[matcher.nextKey]) && find_findSingle(node, matcher);
		}
		
		// source ../src/util/dom.js
		function dom_addEventListener(element, event, listener) {
			
			// allows custom events - in x-signal, for example
			if (domLib != null) {
				domLib(element).on(event, listener);
				return;
			}
			
			if (element.addEventListener != null) {
				element.addEventListener(event, listener, false);
				return;
			}
			if (element.attachEvent) {
				element.attachEvent("on" + event, listener);
			}
		}
		
		// source ../src/util/domLib.js
		/**
		 *	Combine .filter + .find
		 */
		
		function domLib_find($set, selector) {
			return $set.filter(selector).add($set.find(selector));
		}
		
		function domLib_on($set, type, selector, fn) {
		
			if (selector == null) {
				return $set.on(type, fn);
			}
		
			$set.on(type, selector, fn);
			$set.filter(selector).on(type, fn);
			return $set;
		}
		
	
		// source ../src/compo/children.js
		var Children_ = {
		
			/**
			 *	Component children. Example:
			 *
			 *	Class({
			 *		Base: Compo,
			 *		Construct: function(){
			 *			this.compos = {
			 *				panel: '$: .container',  // querying with DOMLib
			 *				timePicker: 'compo: timePicker', // querying with Compo selector
			 *				button: '#button' // querying with querySelector***
			 *			}
			 *		}
			 *	});
			 *
			 */
			select: function(component, compos) {
				for (var name in compos) {
					var data = compos[name],
						events = null,
						selector = null;
		
					if (data instanceof Array) {
						selector = data[0];
						events = data.splice(1);
					}
					if (typeof data === 'string') {
						selector = data;
					}
					if (data == null || selector == null) {
						console.error('Unknown component child', name, compos[name]);
						console.warn('Is this object shared within multiple compo classes? Define it in constructor!');
						return;
					}
		
					var index = selector.indexOf(':'),
						engine = selector.substring(0, index);
		
					engine = Compo.config.selectors[engine];
		
					if (engine == null) {
						component.compos[name] = component.$[0].querySelector(selector);
					} else {
						selector = selector.substring(++index).trim();
						component.compos[name] = engine(component, selector);
					}
		
					var element = component.compos[name];
		
					if (events != null) {
						if (element.$ != null) {
							element = element.$;
						}
						
						Events_.on(component, events, element);
					}
				}
			}
		};
		
		// source ../src/compo/events.js
		var Events_ = {
			on: function(component, events, $element) {
				if ($element == null) {
					$element = component.$;
				}
		
				var isarray = events instanceof Array,
					length = isarray ? events.length : 1;
		
				for (var i = 0, x; isarray ? i < length : i < 1; i++) {
					x = isarray ? events[i] : events;
		
					if (x instanceof Array) {
						// generic jQuery .on Arguments
		
						if (EventDecorator != null) {
							x[0] = EventDecorator(x[0]);
						}
		
						$element.on.apply($element, x);
						continue;
					}
		
		
					for (var key in x) {
						var fn = typeof x[key] === 'string' ? component[x[key]] : x[key],
							semicolon = key.indexOf(':'),
							type,
							selector;
		
						if (semicolon !== -1) {
							type = key.substring(0, semicolon);
							selector = key.substring(semicolon + 1).trim();
						} else {
							type = key;
						}
		
						if (EventDecorator != null) {
							type = EventDecorator(type);
						}
		
						domLib_on($element, type, selector, fn_proxy(fn, component));
					}
				}
			}
		},
			EventDecorator = null;
		
		// source ../src/compo/events.deco.js
		var EventDecos = (function() {
		
			var hasTouch = (function() {
				if (document == null) {
					return false;
				}
				if ('createTouch' in document) {
					return true;
				}
				try {
					return !!document.createEvent('TouchEvent').initTouchEvent;
				} catch (error) {
					return false;
				}
			}());
		
			return {
		
				'touch': function(type) {
					if (hasTouch === false) {
						return type;
					}
		
					if ('click' === type) {
						return 'touchend';
					}
		
					if ('mousedown' === type) {
						return 'touchstart';
					}
		
					if ('mouseup' === type) {
						return 'touchend';
					}
		
					if ('mousemove' === type) {
						return 'touchmove';
					}
		
					return type;
				}
			};
		
		}());
		
		// source ../src/compo/pipes.js
		var Pipes = (function() {
		
		
			mask.registerAttrHandler('x-pipe-signal', function(node, attrValue, model, cntx, element, controller) {
		
				var arr = attrValue.split(';');
				for (var i = 0, x, length = arr.length; i < length; i++) {
					x = arr[i].trim();
					if (x === '') {
						continue;
					}
		
					var event = x.substring(0, x.indexOf(':')),
						handler = x.substring(x.indexOf(':') + 1).trim(),
						dot = handler.indexOf('.'),
						pipe, signal;
		
					if (dot === -1) {
						console.error('define pipeName "click: pipeName.pipeSignal"');
						return;
					}
		
					pipe = handler.substring(0, dot);
					signal = handler.substring(++dot);
		
					var Handler = _handler(pipe, signal);
		
		
					// if DEBUG
					!event && console.error('Signal: event type is not set', attrValue);
					// endif
		
		
					if (EventDecorator != null) {
						event = EventDecorator(event);
					}
		
					dom_addEventListener(element, event, Handler);
		
				}
			});
		
			function _handler(pipe, signal) {
				return function(){
					new Pipe(pipe).emit(signal);
				};
			}
		
			var Collection = {};
		
		
			function pipe_attach(pipeName, controller) {
				if (controller.pipes[pipeName] == null) {
					console.error('Controller has no pipes to be added to collection', pipeName, controller);
					return;
				}
		
				if (Collection[pipeName] == null) {
					Collection[pipeName] = [];
				}
				Collection[pipeName].push(controller);
			}
		
			function pipe_detach(pipeName, controller) {
				var pipe = Collection[pipeName],
					i = pipe.length;
		
				while (--i) {
					if (pipe[i] === controller) {
						pipe.splice(i, 1);
						i++;
					}
				}
		
			}
		
			function controller_remove() {
				var	controller = this,
					pipes = controller.pipes;
				for (var key in pipes) {
					pipe_detach(key, controller);
				}
			}
		
			function controller_add(controller) {
				var pipes = controller.pipes;
		
				// if DEBUG
				if (pipes == null) {
					console.error('Controller has no pipes', controller);
					return;
				}
				// endif
		
				for (var key in pipes) {
					pipe_attach(key, controller);
				}
		
				Compo.attachDisposer(controller, controller_remove.bind(controller));
			}
		
			function Pipe(pipeName) {
				if (this instanceof Pipe === false) {
					return new Pipe(pipeName);
				}
				this.pipeName = pipeName;
		
				return this;
			}
			Pipe.prototype = {
				constructor: Pipe,
				emit: function(signal, args){
					var controllers = Collection[this.pipeName],
						pipeName = this.pipeName;
					if (controllers == null) {
						console.warn('Pipe.emit: No signals were bound to a Pipe', pipeName);
						return;
					}
		
					var i = controllers.length,
						controller, slots, slot, called;
		
					while (--i !== -1) {
						controller = controllers[i];
						slots = controller.pipes[pipeName];
		
						if (slots == null) {
							continue;
						}
		
						slot = slots[signal];
						if (typeof slot === 'function') {
							slot.apply(controller, args);
							called = true;
						}
					}
		
					// if DEBUG
					called !== true && console.warn('No piped slot found for a signal', signal, pipeName);
					// endif
				}
			};
		
			Pipe.addController = controller_add;
			Pipe.removeController = controller_remove;
		
			return {
				addController: controller_add,
				removeController: controller_remove,
		
				emit: function(pipeName, signal, args) {
					Pipe(pipeName).emit(signal, args);
				},
				pipe: Pipe
			};
		
		}());
		
	
		// source ../src/compo/anchor.js
		
		/**
		 *	Get component that owns an element
		 **/
		
		var Anchor = (function(){
		
			var _cache = {};
		
			return {
				create: function(compo){
					if (compo.ID == null){
						console.warn('Component should have an ID');
						return;
					}
		
					_cache[compo.ID] = compo;
				},
				resolveCompo: function(element){
					if (element == null){
						return null;
					}
		
					var findID, currentID, compo;
					do {
		
						currentID = element.getAttribute('x-compo-id');
		
		
						if (currentID) {
		
							if (findID == null) {
								findID = currentID;
							}
		
							compo = _cache[currentID];
		
							if (compo != null) {
								compo = Compo.find(compo, {
									key: 'ID',
									selector: findID,
									nextKey: 'components'
								});
		
								if (compo != null) {
									return compo;
								}
							}
		
						}
		
						element = element.parentNode;
		
					}while(element && element.nodeType === 1);
		
		
					// if DEBUG
					findID && console.warn('No controller for ID', findID);
					// endif
					return null;
				},
				removeCompo: function(compo){
					if (compo.ID == null){
						return;
					}
					delete _cache[compo.ID];
				}
			};
		
		}());
		
		// source ../src/compo/Compo.js
		var Compo = (function() {
		
			function Compo(controller) {
				if (this instanceof Compo){
					// used in Class({Base: Compo})
					return null;
				}
		
				var klass;
		
				if (controller == null){
					controller = {};
				}
		
				if (controller.attr != null) {
					
					for (var key in controller.attr) {
						controller.attr[key] = _mask_ensureTmplFn(controller.attr[key]);
					}
					
				}
				
				var slots = controller.slots;
				if (slots != null) {
					for (var key in slots) {
						if (typeof slots[key] === 'string'){
							//if DEBUG
							typeof controller[slots[key]] !== 'function' && console.error('Not a Function @Slot.',slots[key]);
							// endif
							slots[key] = controller[slots[key]];
						}
					}
				}
				
				if (controller.hasOwnProperty('constructor')){
					klass = controller.constructor;
				}
		
		
				klass = compo_createConstructor(klass, controller);
		
				if (klass == null){
					klass = function CompoBase(){};
				}
		
				for(var key in Proto){
					if (controller[key] == null){
						controller[key] = Proto[key];
					}
					controller['base_' + key] = Proto[key];
				}
		
				klass.prototype = controller;
		
				controller = null;
		
				return klass;
			}
		
			// source Compo.util.js
			function compo_dispose(compo) {
				if (compo.dispose != null) {
					compo.dispose();
				}
			
				Anchor.removeCompo(compo);
			
				var i = 0,
					compos = compo.components,
					length = compos && compos.length;
			
				if (length) {
					for (; i < length; i++) {
						compo_dispose(compos[i]);
					}
				}
			}
			
			function compo_ensureTemplate(compo) {
				if (compo.nodes != null) {
					return;
				}
				
				if (compo.attr.template != null) {
					compo.template = compo.attr.template;
					
					delete compo.attr.template;
				}
				
				var template = compo.template;
				
				if (typeof template == null) {
					return;
				}
				
			
				if (typeof template === 'string') {
					if (template[0] === '#') {
						var node = document.getElementById(template.substring(1));
						if (node == null) {
							console.error('Template holder not found by id:', template);
							return;
						}
						template = node.innerHTML;
					}
					template = mask.parse(template);
				}
			
				if (typeof template === 'object') {
					compo.nodes = template;
				}
			}
			
			function compo_containerArray() {
				var arr = [];
				arr.appendChild = function(child) {
					this.push(child);
				};
				return arr;
			}
			
			function compo_attachDisposer(controller, disposer) {
			
				if (typeof controller.dispose === 'function') {
					var previous = controller.dispose;
					controller.dispose = function(){
						disposer.call(this);
						previous.call(this);
					};
			
					return;
				}
			
				controller.dispose = disposer;
			}
			
			
			function compo_createConstructor(ctor, proto) {
				var compos = proto.compos,
					pipes = proto.pipes,
					attr = proto.attr;
					
				if (compos == null && pipes == null && proto.attr == null) {
					return ctor;
				}
			
				/* extend compos / attr to keep
				 * original prototyped values untouched
				 */
				return function CompoBase(){
			
					if (compos != null) {
						// use this.compos instead of compos from upper scope
						// : in case compos from proto was extended after
						this.compos = obj_copy(this.compos);
					}
			
					if (pipes != null) {
						Pipes.addController(this);
					}
					
					if (attr != null) {
						this.attr = obj_copy(this.attr);
					}
			
					if (typeof ctor === 'function') {
						ctor.call(this);
					}
				};
			}
			
			// source Compo.static.js
			obj_extend(Compo, {
				create: function(controller){
					var klass;
			
					if (controller == null){
						controller = {};
					}
			
					if (controller.hasOwnProperty('constructor')){
						klass = controller.constructor;
					}
			
					if (klass == null){
						klass = function CompoBase(){};
					}
			
					for(var key in Proto){
						if (controller[key] == null){
							controller[key] = Proto[key];
						}
						controller['base_' + key] = Proto[key];
					}
			
			
					klass.prototype = controller;
			
			
					return klass;
				},
			
				/* obsolete */
				render: function(compo, model, cntx, container) {
			
					compo_ensureTemplate(compo);
			
					var elements = [];
			
					mask.render(compo.tagName == null ? compo.nodes : compo, model, cntx, container, compo, elements);
			
					compo.$ = domLib(elements);
			
					if (compo.events != null) {
						Events_.on(compo, compo.events);
					}
					if (compo.compos != null) {
						Children_.select(compo, compo.compos);
					}
			
					return compo;
				},
			
				initialize: function(compo, model, cntx, container, parent) {
					
					var compoName;
			
					if (container == null){
						if (cntx && cntx.nodeType != null){
							container = cntx;
							cntx = null;
						}else if (model && model.nodeType != null){
							container = model;
							model = null;
						}
					}
			
					if (typeof compo === 'string'){
						compoName = compo;
						
						compo = mask.getHandler(compoName);
						if (!compo){
							console.error('Compo not found:', compo);
						}
					}
			
					var node = {
						controller: compo,
						type: Dom.COMPONENT,
						tagName: compoName
					};
			
					if (parent == null && container != null){
						parent = Anchor.resolveCompo(container);
					}
			
					if (parent == null){
						parent = new Dom.Component();
					}
			
					var dom = mask.render(node, model, cntx, null, parent),
						instance = parent.components[parent.components.length - 1];
			
					if (container != null){
						container.appendChild(dom);
			
						Compo.signal.emitIn(instance, 'domInsert');
					}
			
					return instance;
				},
			
				dispose: function(compo) {
					if (typeof compo.dispose === 'function') {
						compo.dispose();
					}
			
			
					var i = 0,
						compos = compo.components,
						length = compos && compos.length;
			
					if (length) {
						for (; i < length; i++) {
							Compo.dispose(compos[i]);
						}
					}
				},
			
				find: function(compo, selector){
					return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
				},
				closest: function(compo, selector){
					return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
				},
			
				ensureTemplate: compo_ensureTemplate,
				attachDisposer: compo_attachDisposer,
			
				config: {
					selectors: {
						'$': function(compo, selector) {
							var r = domLib_find(compo.$, selector)
							// if DEBUG
							r.length === 0 && console.error('Compo Selector - element not found -', selector, compo);
							// endif
							return r;
						},
						'compo': function(compo, selector) {
							var r = Compo.find(compo, selector);
							if (r == null) {
								console.error('Compo Selector - component not found -', selector, compo);
							}
							return r;
						}
					},
					/**
					 *	@default, global $ is used
					 *	IDOMLibrary = {
					 *	{fn}(elements) - create dom-elements wrapper,
					 *	on(event, selector, fn) - @see jQuery 'on'
					 *	}
					 */
					setDOMLibrary: function(lib) {
						domLib = lib;
					},
			
			
					eventDecorator: function(mix){
						if (typeof mix === 'function') {
							EventDecorator = mix;
							return;
						}
						if (typeof mix === 'string') {
							EventDecorator = EventDecos[mix];
							return;
						}
						if (typeof mix === 'boolean' && mix === false) {
							EventDecorator = null;
							return;
						}
					}
			
				},
			
				//pipes: Pipes,
				pipe: Pipes.pipe,
				
				resource: function(compo){
					var owner = compo;
					
					while (owner != null) {
						
						if (owner.resource) 
							return owner.resource;
						
						owner = owner.parent;
					}
					
					return include.instance();
				}
			});
			
			
			// source async.js
			(function(){
				
				function _on(cntx, type, callback) {
					if (cntx[type] == null)
						cntx[type] = [];
					
					cntx[type].push(callback);
					
					return cntx;
				}
				
				function _call(cntx, type, _arguments) {
					var cbs = cntx[type];
					if (cbs == null) 
						return;
					
					for (var i = 0, x, imax = cbs.length; i < imax; i++){
						x = cbs[i];
						if (x == null)
							continue;
						
						cbs[i] = null;
						
						if (_arguments == null) {
							x();
							continue;
						}
						
						x.apply(this, _arguments);
					}
				}
				
				
				var DeferProto = {
					done: function(callback){
						return _on(this, '_cbs_done', callback);
					},
					fail: function(callback){
						return _on(this, '_cbs_fail', callback);
					},
					always: function(callback){
						return _on(this, '_cbs_always', callback);
					},
					resolve: function(){
						this.async = false;
						_call(this, '_cbs_done', arguments);
						_call(this, '_cbs_always', arguments);
					},
					reject: function(){
						this.async = false;
						_call(this, '_cbs_fail', arguments);
						_call(this, '_cbs_always');
					}
				};
				
				var CompoProto = {
					async: true,
					await: function(resume){
						this.resume = resume;
					}
				}
				
				Compo.pause = function(compo, cntx){
					
					if (cntx.async == null) {
						cntx.defers = [];
						
						cntx._cbs_done = null;
						cntx._cbs_fail = null;
						cntx._cbs_always = null;
						
						for (var key in DeferProto) {
							cntx[key] = DeferProto[key];
						}
					}
					
					cntx.async = true;
					
					for (var key in CompoProto) {
						compo[key] = CompoProto[key];
					}
					
					cntx.defers.push(compo);
				}
				
				Compo.resume = function(compo, cntx){
					
					// fn can be null when calling resume synced after pause
					if (compo.resume) 
						compo.resume();
					
					compo.async = false;
					
					var busy = false;
					for (var i = 0, x, imax = cntx.defers.length; i < imax; i++){
						x = cntx.defers[i];
						
						if (x === compo) {
							cntx.defers[i] = null;
							continue;
						}
						
						if (busy === false) {
							busy = x != null;
						}
					}
					
					if (busy === false) {
						cntx.resolve();
					}
				};
				
			}());
		
			var Proto = {
				type: Dom.CONTROLLER,
				
				tagName: null,
				compoName: null,
				nodes: null,
				attr: null,
				
				slots: null,
				pipes: null,
				
				compos: null,
				events: null,
				
				onRenderStart: null,
				onRenderEnd: null,
				render: null,
				renderStart: function(model, cntx, container){
		
					if (arguments.length === 1 && model != null && model instanceof Array === false && model[0] != null){
						model = arguments[0][0];
						cntx = arguments[0][1];
						container = arguments[0][2];
					}
		
		
					if (typeof this.onRenderStart === 'function'){
						this.onRenderStart(model, cntx, container);
					}
		
					// - do not override with same model
					//if (this.model == null){
					//	this.model = model;
					//}
		
					if (this.nodes == null){
						compo_ensureTemplate(this);
					}
		
				},
				renderEnd: function(elements, model, cntx, container){
					if (arguments.length === 1 && elements instanceof Array === false){
						elements = arguments[0][0];
						model = arguments[0][1];
						cntx = arguments[0][2];
						container = arguments[0][3];
					}
		
					Anchor.create(this, elements);
		
					this.$ = domLib(elements);
		
					if (this.events != null) {
						Events_.on(this, this.events);
					}
		
					if (this.compos != null) {
						Children_.select(this, this.compos);
					}
		
					if (typeof this.onRenderEnd === 'function'){
						this.onRenderEnd(elements, model, cntx, container);
					}
				},
				appendTo: function(x) {
					
					var element = typeof x === 'string' ? document.querySelector(x) : x;
					
		
					if (element == null) {
						console.warn('Compo.appendTo: parent is undefined. Args:', arguments);
						return this;
					}
		
					for (var i = 0; i < this.$.length; i++) {
						element.appendChild(this.$[i]);
					}
		
					this.emitIn('domInsert');
					return this;
				},
				append: function(template, model, selector) {
					var parent;
		
					if (this.$ == null) {
						var dom = typeof template === 'string' ? mask.compile(template) : template;
		
						parent = selector ? find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down')) : this;
						if (parent.nodes == null) {
							this.nodes = dom;
							return this;
						}
		
						parent.nodes = [this.nodes, dom];
		
						return this;
					}
					var array = mask.render(template, model, null, compo_containerArray(), this);
		
					parent = selector ? this.$.find(selector) : this.$;
					for (var i = 0; i < array.length; i++) {
						parent.append(array[i]);
					}
		
					this.emitIn('domInsert');
					//- Shots.emit(this, 'DOMInsert');
					return this;
				},
				find: function(selector){
					return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'));
				},
				closest: function(selector){
					return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'up'));
				},
				on: function() {
					var x = Array.prototype.slice.call(arguments);
					if (arguments.length < 3) {
						console.error('Invalid Arguments Exception @use .on(type,selector,fn)');
						return this;
					}
		
					if (this.$ != null) {
						Events_.on(this, [x]);
					}
		
		
					if (this.events == null) {
						this.events = [x];
					} else if (this.events instanceof Array) {
						this.events.push(x);
					} else {
						this.events = [x, this.events];
					}
					return this;
				},
				remove: function() {
					if (this.$ != null){
						this.$.remove();
						
						var parents = this.parent && this.parent.elements;
						if (parents != null) {
							for (var i = 0, x, imax = parents.length; i < imax; i++){
								x = parents[i];
								
								for (var j = 0, jmax = this.$.length; j < jmax; j++){
									if (x === this.$[j]){
										parents.splice(i, 1);
										
										i--;
										imax--;
									}
									
								}
								
							}
						}
			
						this.$ = null;
					}
		
					compo_dispose(this);
		
					var components = this.parent && this.parent.components;
					if (components != null) {
						var i = components.indexOf(this);
		
						if (i === -1){
							console.warn('Compo::remove - parent doesnt contains me', this);
							return this;
						}
		
						components.splice(i, 1);
					}
					
					return this;
				},
		
				slotState: function(slotName, isActive){
					Compo.slot.toggle(this, slotName, isActive);
				},
		
				signalState: function(signalName, isActive){
					Compo.signal.toggle(this, signalName, isActive);
				},
		
				emitOut: function(signalName /* args */){
					Compo.signal.emitOut(this, signalName, this, arguments.length > 1 ? __array_slice.call(arguments, 1) : null);
				},
		
				emitIn: function(signalName /* args */){
					Compo.signal.emitIn(this, signalName, this, arguments.length > 1 ? __array_slice.call(arguments, 1) : null);
				}
			};
		
			Compo.prototype = Proto;
		
		
			return Compo;
		}());
		
		// source ../src/compo/signals.js
		(function() {
		
			/**
			 *	Mask Custom Attribute
			 *	Bind Closest Controller Handler Function to dom event(s)
			 */
		
			mask.registerAttrHandler('x-signal', 'client', function(node, attrValue, model, cntx, element, controller) {
		
				var arr = attrValue.split(';'),
					signals = '';
				for (var i = 0, x, length = arr.length; i < length; i++) {
					x = arr[i].trim();
					if (x === '') {
						continue;
					}
		
					var event = x.substring(0, x.indexOf(':')),
						handler = x.substring(x.indexOf(':') + 1).trim(),
						Handler = _createListener(controller, handler);
		
		
					// if DEBUG
					!event && console.error('Signal: event type is not set', attrValue);
					// endif
		
					if (Handler) {
		
						if (EventDecorator != null) {
							event = EventDecorator(event);
						}
		
						signals += ',' + handler + ',';
						dom_addEventListener(element, event, Handler);
					}
		
					// if DEBUG
					!Handler && console.warn('No slot found for signal', handler, controller);
					// endif
				}
		
				if (signals !== '') {
					element.setAttribute('data-signals', signals);
				}
		
			});
		
			// @param sender - event if sent from DOM Event or CONTROLLER instance
			function _fire(controller, slot, sender, args, direction) {
				
				if (controller == null) {
					return false;
				}
				
				var found = false,
					fn = controller.slots != null && controller.slots[slot];
					
				if (typeof fn === 'string') {
					fn = controller[fn];
				}
		
				if (typeof fn === 'function') {
					found = true;
					
					var isDisabled = controller.slots.__disabled != null && controller.slots.__disabled[slot];
		
					if (isDisabled !== true) {
		
						var result = args == null
								? fn.call(controller, sender)
								: fn.apply(controller, [sender].concat(args));
		
						if (result === false) {
							return true;
						}
						
						if (result != null && typeof result === 'object' && result.length != null) {
							args = result;
						}
					}
				}
		
				if (direction === -1 && controller.parent != null) {
					return _fire(controller.parent, slot, sender, args, direction) || found;
				}
		
				if (direction === 1 && controller.components != null) {
					var compos = controller.components,
						imax = compos.length,
						i = 0,
						r;
					for (; i < imax; i++) {
						r = _fire(compos[i], slot, sender, args, direction);
						
						!found && (found = r);
					}
				}
				
				return found;
			}
		
			function _hasSlot(controller, slot, direction, isActive) {
				if (controller == null) {
					return false;
				}
		
				var slots = controller.slots;
		
				if (slots != null && slots[slot] != null) {
					if (typeof slots[slot] === 'string') {
						slots[slot] = controller[slots[slot]];
					}
		
					if (typeof slots[slot] === 'function') {
						if (isActive === true) {
							if (slots.__disabled == null || slots.__disabled[slot] !== true) {
								return true;
							}
						} else {
							return true;
						}
					}
				}
		
				if (direction === -1 && controller.parent != null) {
					return _hasSlot(controller.parent, slot, direction);
				}
		
				if (direction === 1 && controller.components != null) {
					for (var i = 0, length = controller.components.length; i < length; i++) {
						if (_hasSlot(controller.components[i], slot, direction)) {
							return true;
						}
		
					}
				}
				return false;
			}
		
			function _createListener(controller, slot) {
		
				if (_hasSlot(controller, slot, -1) === false) {
					return null;
				}
		
				return function(event) {
					var args = arguments.length > 1 ? __array_slice.call(arguments, 1) : null;
					
					_fire(controller, slot, event, args, -1);
				};
			}
		
			function __toggle_slotState(controller, slot, isActive) {
				var slots = controller.slots;
				if (slots == null || slots.hasOwnProperty(slot) === false) {
					return;
				}
		
				if (slots.__disabled == null) {
					slots.__disabled = {};
				}
		
				slots.__disabled[slot] = isActive === false;
			}
		
			function __toggle_slotStateWithChilds(controller, slot, isActive) {
				__toggle_slotState(controller, slot, isActive);
		
				if (controller.components != null) {
					for (var i = 0, length = controller.components.length; i < length; i++) {
						__toggle_slotStateWithChilds(controller.components[i], slot, isActive);
					}
				}
			}
		
			function __toggle_elementsState(controller, slot, isActive) {
				if (controller.$ == null) {
					console.warn('Controller has no elements to toggle state');
					return;
				}
		
				domLib() //
				.add(controller.$.filter('[data-signals]')) //
				.add(controller.$.find('[data-signals]')) //
				.each(function(index, node) {
					var signals = node.getAttribute('data-signals');
		
					if (signals != null && signals.indexOf(slot) !== -1) {
						node[isActive === true ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
					}
				});
			}
		
			function _toggle_all(controller, slot, isActive) {
		
				var parent = controller,
					previous = controller;
				while ((parent = parent.parent) != null) {
					__toggle_slotState(parent, slot, isActive);
		
					if (parent.$ == null || parent.$.length === 0) {
						// we track previous for changing elements :disable state
						continue;
					}
		
					previous = parent;
				}
		
				__toggle_slotStateWithChilds(controller, slot, isActive);
				__toggle_elementsState(previous, slot, isActive);
		
			}
		
			function _toggle_single(controller, slot, isActive) {
				__toggle_slotState(controller, slot, isActive);
		
				if (!isActive && (_hasSlot(controller, slot, -1, true) || _hasSlot(controller, slot, 1, true))) {
					// there are some active slots; do not disable elements;
					return;
				}
				__toggle_elementsState(controller, slot, isActive);
			}
		
		
		
			obj_extend(Compo, {
				signal: {
					toggle: _toggle_all,
		
					// to parent
					emitOut: function(controller, slot, sender, args) {
						var captured = _fire(controller, slot, sender, args, -1);
						
						// if DEBUG
						!captured && console.warn('Signal %c%s','font-weight:bold;', slot, 'was not captured');
						// endif
						
					},
					// to children
					emitIn: function(controller, slot, sender, args) {
						_fire(controller, slot, sender, args, 1);
					},
		
					enable: function(controller, slot) {
						_toggle_all(controller, slot, true);
					},
					disable: function(controller, slot) {
						_toggle_all(controller, slot, false);
					}
				},
				slot: {
					toggle: _toggle_single,
					enable: function(controller, slot) {
						_toggle_single(controller, slot, true);
					},
					disable: function(controller, slot) {
						_toggle_single(controller, slot, false);
					},
					invoke: function(controller, slot, event, args) {
						var slots = controller.slots;
						if (slots == null || typeof slots[slot] !== 'function') {
							console.error('Slot not found', slot, controller);
							return null;
						}
		
						if (args == null) {
							return slots[slot].call(controller, event);
						}
		
						return slots[slot].apply(controller, [event].concat(args));
					},
		
				}
		
			});
		
		}());
		
	
		// source ../src/jcompo/jCompo.js
		(function(){
		
			if (domLib == null || domLib.fn == null){
				return;
			}
		
		
			domLib.fn.compo = function(selector){
				if (this.length === 0){
					return null;
				}
				var compo = Anchor.resolveCompo(this[0]);
		
				if (selector == null){
					return compo;
				}
		
				return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
			};
		
			domLib.fn.model = function(selector){
				var compo = this.compo(selector);
				if (compo == null){
					return null;
				}
				var model = compo.model;
				while(model == null && compo.parent){
					compo = compo.parent;
					model = compo.model;
				}
				return model;
			};
		
		}());
		
	
		// source ../src/handler/slot.js
		
		function SlotHandler() {}
		
		mask.registerHandler(':slot', SlotHandler);
		
		SlotHandler.prototype = {
			constructor: SlotHandler,
			renderEnd: function(element, model, cntx, container){
				this.slots = {};
		
				this.expression = this.attr.on;
		
				this.slots[this.attr.signal] = this.handle;
			},
			handle: function(){
				var expr = this.expression;
		
				mask.Utils.Expression.eval(expr, this.model, global, this);
			}
		};
		
	
	
		return Compo;
	
	}(Mask));
	
	// source ../src/libs/jmask.js
	
	var jmask = exports.jmask = (function(mask){
		'use strict';
		// source ../src/scope-vars.js
		var Dom = mask.Dom,
			_mask_render = mask.render,
			_mask_parse = mask.parse,
			_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
			_signal_emitIn = (global.Compo || mask.Compo || Compo).signal.emitIn;
			
		
		function _mask_ensureTmplFn(value) {
			if (typeof value !== 'string') {
				return value;
			}
			return _mask_ensureTmplFnOrig(value);
		}
		
		
	
		// source ../src/util/object.js
		function util_extend(target, source){
			if (target == null){
				target = {};
			}
			if (source == null){
				return target;
			}
		
			for(var key in source){
				target[key] = source[key];
			}
		
			return target;
		}
		
		// source ../src/util/array.js
		function arr_each(array, fn) {
			for (var i = 0, length = array.length; i < length; i++) {
				fn(array[i], i);
			}
		}
		
		function arr_remove(array, child) {
			if (array == null) {
				console.error('Can not remove myself from parent', child);
				return;
			}
		
			var index = array.indexOf(child);
		
			if (index === -1) {
				console.error('Can not remove myself from parent', child, index);
				return;
			}
		
			array.splice(index, 1);
		}
		
		function arr_isArray(x) {
			return x != null && typeof x === 'object' && x.length != null && typeof x.slice === 'function';
		}
		
		var arr_unique = (function() {
		
			var hasDuplicates = false;
		
			function sort(a, b) {
				if (a === b) {
					hasDuplicates = true;
					return 0;
				}
		
				return 1;
			}
		
			return function(array) {
				var duplicates, i, j, imax;
		
				hasDuplicates = false;
		
				array.sort(sort);
		
				if (hasDuplicates === false) {
					return array;
				}
		
				duplicates = [];
				i = 0;
				j = 0;
				imax = array.length - 1;
		
				while (i < imax) {
					if (array[i++] === array[i]) {
						duplicates[j++] = i;
					}
				}
				while (j--) {
					array.splice(duplicates[j], 1);
				}
		
				return array;
			};
		
		}());
		
		
		// source ../src/util/selector.js
		
		var sel_key_UP = 'parent',
			sel_key_MASK = 'nodes',
			sel_key_COMPOS = 'components',
			sel_key_ATTR = 'attr';
		
		function selector_parse(selector, type, direction) {
			if (selector == null) {
				console.warn('selector is null for type', type);
			}
		
			if (typeof selector === 'object') {
				return selector;
			}
		
			var key,
				prop,
				nextKey,
				filters,
		
				_key,
				_prop,
				_selector;
		
			var index = 0,
				length = selector.length,
				c,
				end,
				matcher,
				eq,
				slicer;
		
			if (direction === 'up') {
				nextKey = sel_key_UP;
			} else {
				nextKey = type === Dom.SET
					? sel_key_MASK
					: sel_key_COMPOS;
			}
		
			while (index < length) {
		
				c = selector.charCodeAt(index);
		
				if (c < 33) {
					continue;
				}
		
				end = selector_moveToBreak(selector, index + 1, length);
		
		
				if (c === 46 /*.*/ ) {
					_key = 'class';
					_prop = sel_key_ATTR;
					_selector = sel_hasClassDelegate(selector.substring(index + 1, end));
				}
		
				else if (c === 35 /*#*/ ) {
					_key = 'id';
					_prop = sel_key_ATTR;
					_selector = selector.substring(index + 1, end);
				}
		
				else if (c === 91 /*[*/ ) {
					eq = selector.indexOf('=', index);
					//if DEBUG
					eq === -1 && console.error('Attribute Selector: should contain "="');
					// endif
		
					_prop = sel_key_ATTR;
					_key = selector.substring(index + 1, eq);
		
					//slice out quotes if any
					c = selector.charCodeAt(eq + 1);
					slicer = c === 34 || c === 39 ? 2 : 1;
		
					_selector = selector.substring(eq + slicer, end - slicer + 1);
		
					// increment, as cursor is on closed ']'
					end++;
				}
		
				else {
					_prop = null;
					_key = type === Dom.SET ? 'tagName' : 'compoName';
					_selector = selector.substring(index, end);
				}
		
				index = end;
		
		
		
				if (matcher == null) {
					matcher = {
						key: _key,
						prop: _prop,
						selector: _selector,
						nextKey: nextKey,
		
						filters: null
					}
		
					continue;
				}
		
				if (matcher.filters == null) {
					matcher.filters = [];
				}
		
				matcher.filters.push({
					key: _key,
					selector: _selector,
					prop: _prop
				});
		
			}
		
			return matcher;
		}
		
		
		function sel_hasClassDelegate(matchClass) {
			return function(className){
				return sel_hasClass(className, matchClass);
			};
		}
		
		// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
		function sel_hasClass(className, matchClass, index) {
			if (className == null) 
				return false;
			
			if (index == null) 
				index = 0;
				
			index = className.indexOf(matchClass, index);
		
			if (index === -1)
				return false;
		
			if (index > 0 && className.charCodeAt(index - 1) > 32)
				return sel_hasClass(className, matchClass, index + 1);
		
			var class_Length = className.length,
				match_Length = matchClass.length;
				
			if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
				return sel_hasClass(className, matchClass, index + 1);
		
			return true;
		}
		
		
		function selector_moveToBreak(selector, index, length) {
			var c, 
				isInQuote = false,
				isEscaped = false;
		
			while (index < length) {
				c = selector.charCodeAt(index);
		
				if (c === 34 || c === 39) {
					// '"
					isInQuote = !isInQuote;
				}
		
				if (c === 92) {
					// [\]
					isEscaped = !isEscaped;
				}
		
				if (c === 46 || c === 35 || c === 91 || c === 93 || c < 33) {
					// .#[]
					if (isInQuote !== true && isEscaped !== true) {
						break;
					}
				}
				index++;
			}
			return index;
		}
		
		function selector_match(node, selector, type) {
			if (typeof selector === 'string') {
				if (type == null) {
					type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
				}
				selector = selector_parse(selector, type);
			}
		
			var obj = selector.prop ? node[selector.prop] : node,
				matched = false;
		
			if (obj == null) {
				return false;
			}
		
			if (typeof selector.selector === 'function') {
				matched = selector.selector(obj[selector.key]);
			}
			
			else if (selector.selector.test != null) {
				if (selector.selector.test(obj[selector.key])) {
					matched = true;
				}
			}
			
			else  if (obj[selector.key] === selector.selector) {
				matched = true;
			}
		
			if (matched === true && selector.filters != null) {
				for(var i = 0, x, imax = selector.filters.length; i < imax; i++){
					x = selector.filters[i];
		
					if (selector_match(node, x, type) === false) {
						return false;
					}
				}
			}
		
			return matched;
		}
		
		// source ../src/util/utils.js
		
		function jmask_filter(arr, matcher) {
			if (matcher == null) {
				return arr;
			}
		
			var result = [];
			for (var i = 0, x, length = arr.length; i < length; i++) {
				x = arr[i];
				if (selector_match(x, matcher)) {
					result.push(x);
				}
			}
			return result;
		}
		
		/**
		 * - mix (Node | Array[Node])
		 */
		function jmask_find(mix, matcher, output) {
			if (mix == null) {
				return output;
			}
		
			if (output == null) {
				output = [];
			}
		
			if (mix instanceof Array){
				for(var i = 0, length = mix.length; i < length; i++){
					jmask_find(mix[i], matcher, output);
				}
				return output;
			}
		
			if (selector_match(mix, matcher)){
				output.push(mix);
			}
		
			var next = mix[matcher.nextKey];
		
			if (next != null){
				jmask_find(next, matcher, output);
			}
		
			return output;
		}
		
		function jmask_clone(node, parent){
		
			var copy = {
				'type': 1,
				'tagName': 1,
				'compoName': 1,
				'controller': 1
			};
		
			var clone = {
				parent: parent
			};
		
			for(var key in node){
				if (copy[key] === 1){
					clone[key] = node[key];
				}
			}
		
			if (node.attr){
				clone.attr = util_extend({}, node.attr);
			}
		
			var nodes = node.nodes;
			if (nodes != null && nodes.length > 0){
				clone.nodes = [];
		
				var isarray = nodes instanceof Array,
					length = isarray === true ? nodes.length : 1,
					i = 0;
				for(; i< length; i++){
					clone.nodes[i] = jmask_clone(isarray === true ? nodes[i] : nodes, clone);
				}
			}
		
			return clone;
		}
		
		
		function jmask_deepest(node){
			var current = node,
				prev;
			while(current != null){
				prev = current;
				current = current.nodes && current.nodes[0];
			}
			return prev;
		}
		
		
		function jmask_getText(node, model, cntx, controller) {
			if (Dom.TEXTNODE === node.type) {
				if (typeof node.content === 'function') {
					return node.content('node', model, cntx, null, controller);
				}
				return node.content;
			}
		
			var output = '';
			if (node.nodes != null) {
				for(var i = 0, x, imax = node.nodes.length; i < imax; i++){
					x = node.nodes[i];
					output += jmask_getText(x, model, cntx, controller);
				}
			}
			return output;
		}
		
		////////function jmask_initHandlers($$, parent){
		////////	var instance;
		////////
		////////	for(var i = 0, x, length = $$.length; i < length; i++){
		////////		x = $$[i];
		////////		if (x.type === Dom.COMPONENT){
		////////			if (typeof x.controller === 'function'){
		////////				instance = new x.controller();
		////////				instance.nodes = x.nodes;
		////////				instance.attr = util_extend(instance.attr, x.attr);
		////////				instance.compoName = x.compoName;
		////////				instance.parent = parent;
		////////
		////////				x = $$[i] = instance;
		////////			}
		////////		}
		////////		if (x.nodes != null){
		////////			jmask_initHandlers(x.nodes, x);
		////////		}
		////////	}
		////////}
		
		
	
		// source ../src/jmask/jmask.js
		function jMask(mix) {
		
		
			if (this instanceof jMask === false) {
				return new jMask(mix);
			}
		
			if (mix == null) {
				return this;
			}
			
			if (mix.type === Dom.SET) {
				return mix;
			}
		
			return this.add(mix);
		}
		
		jMask.prototype = {
			constructor: jMask,
			type: Dom.SET,
			length: 0,
			components: null,
			add: function(mix) {
				var i, length;
		
				if (typeof mix === 'string') {
					mix = _mask_parse(mix);
				}
		
				if (arr_isArray(mix)) {
					for (i = 0, length = mix.length; i < length; i++) {
						this.add(mix[i]);
					}
					return this;
				}
		
				if (typeof mix === 'function' && mix.prototype.type != null) {
					// assume this is a controller
					mix = {
						controller: mix,
						type: Dom.COMPONENT
					};
				}
		
		
				var type = mix.type;
		
				if (!type) {
					// @TODO extend to any type?
					console.error('Only Mask Node/Component/NodeText/Fragment can be added to jmask set', mix);
					return this;
				}
		
				if (type === Dom.FRAGMENT) {
					var nodes = mix.nodes;
		
					for(i = 0, length = nodes.length; i < length;) {
						this[this.length++] = nodes[i++];
					}
					return this;
				}
		
				if (type === Dom.CONTROLLER) {
		
					if (mix.nodes != null && mix.nodes.length) {
						for (i = mix.nodes.length; i !== 0;) {
							// set controller as parent, as parent is mask dom node
							mix.nodes[--i].parent = mix;
						}
					}
		
					if (mix.$ != null) {
						this.type = Dom.CONTROLLER;
					}
				}
		
		
		
				this[this.length++] = mix;
				return this;
			},
			toArray: function() {
				return Array.prototype.slice.call(this);
			},
			/**
			 *	render([model, cntx, container]) -> HTMLNode
			 * - model (Object)
			 * - cntx (Object)
			 * - container (Object)
			 * - returns (HTMLNode)
			 *
			 **/
			render: function(model, cntx, container, controller) {
				this.components = [];
		
				if (this.length === 1) {
					return _mask_render(this[0], model, cntx, container, controller || this);
				}
		
				if (container == null) {
					container = document.createDocumentFragment();
				}
		
				for (var i = 0, length = this.length; i < length; i++) {
					_mask_render(this[i], model, cntx, container, controller || this);
				}
				return container;
			},
			prevObject: null,
			end: function() {
				return this.prevObject || this;
			},
			pushStack: function(nodes) {
				var next;
				next = jMask(nodes);
				next.prevObject = this;
				return next;
			},
			controllers: function() {
				if (this.components == null) {
					console.warn('Set was not rendered');
				}
		
				return this.pushStack(this.components || []);
			},
			mask: function(template) {
				if (template != null) {
					return this.empty().append(template);
				}
		
				if (arguments.length) {
					return this;
				}
		
				var node;
		
				if (this.length === 0) {
					node = new Dom.Node();
				} else if (this.length === 1) {
					node = this[0];
				} else {
					node = new Dom.Fragment();
					for (var i = 0, length = this.length; i < length; i++) {
						node.nodes[i] = this[i];
					}
				}
		
				return mask.stringify(node);
			},
		
			text: function(mix, cntx, controller){
				if (typeof mix === 'string') {
					var node = [new Dom.TextNode(mix)];
		
					for(var i = 0, x, imax = this.length; i < imax; i++){
						x = this[i];
						x.nodes = node;
					}
					return this;
				}
		
				var string = '';
				for(var i = 0, x, imax = this.length; i < imax; i++){
					x = this[i];
					string += jmask_getText(x, mix, cntx, controller);
				}
				return string;
			}
		};
		
		arr_each(['append', 'prepend'], function(method) {
		
			jMask.prototype[method] = function(mix) {
				var $mix = jMask(mix),
					i = 0,
					length = this.length,
					arr, node;
		
				for (; i < length; i++) {
					node = this[i];
					// we create each iteration a new array to prevent collisions in future manipulations
					arr = $mix.toArray();
		
					for (var j = 0, jmax = arr.length; j < jmax; j++) {
						arr[j].parent = node;
					}
		
					if (node.nodes == null) {
						node.nodes = arr;
						continue;
					}
		
					node.nodes = method === 'append' ? node.nodes.concat(arr) : arr.concat(node.nodes);
				}
		
				return this;
			};
		
		});
		
		arr_each(['appendTo'], function(method) {
		
			jMask.prototype[method] = function(mix, model, cntx, controller) {
		
				if (controller == null) {
					controller = this;
				}
		
				if (mix.nodeType != null && typeof mix.appendChild === 'function') {
					mix.appendChild(this.render(model, cntx, null, controller));
		
					_signal_emitIn(controller, 'domInsert');
					return this;
				}
		
				jMask(mix).append(this);
				return this;
			};
		
		});
		
		// source ../src/jmask/manip.attr.js
		(function() {
			arr_each(['add', 'remove', 'toggle', 'has'], function(method) {
		
				jMask.prototype[method + 'Class'] = function(klass) {
					var length = this.length,
						i = 0,
						classNames, j, jmax, node, current;
		
					if (typeof klass !== 'string') {
						if (method === 'remove') {
							for (; i < length; i++) {
								this[0].attr['class'] = null;
							}
						}
						return this;
					}
		
		
					for (; i < length; i++) {
						node = this[i];
		
						if (node.attr == null) {
							continue;
						}
		
						current = node.attr['class'];
		
						if (current == null) {
							current = klass;
						} else {
							current = ' ' + current + ' ';
		
							if (classNames == null) {
								classNames = klass.split(' ');
								jmax = classNames.length;
							}
							for (j = 0; j < jmax; j++) {
								if (!classNames[j]) {
									continue;
								}
		
								var hasClass = current.indexOf(' ' + classNames[j] + ' ') > -1;
		
								if (method === 'has') {
									if (hasClass) {
										return true;
									} else {
										continue;
									}
								}
		
								if (hasClass === false && (method === 'add' || method === 'toggle')) {
									current += classNames[j] + ' ';
								} else if (hasClass === true && (method === 'remove' || method === 'toggle')) {
									current = current.replace(' ' + classNames[j] + ' ', ' ');
								}
							}
							current = current.trim();
						}
		
						if (method !== 'has') {
							node.attr['class'] = current;
						}
					}
		
					if (method === 'has') {
						return false;
					}
		
					return this;
				};
		
			});
		
		
			arr_each(['attr', 'removeAttr', 'prop', 'removeProp'], function(method) {
				jMask.prototype[method] = function(key, value) {
					if (!key) {
						return this;
					}
		
					var length = this.length,
						i = 0,
						args = arguments.length,
						node;
		
					for (; i < length; i++) {
						node = this[i];
		
						switch (method) {
						case 'attr':
						case 'prop':
							if (args === 1) {
								if (typeof key === 'string') {
									return node.attr[key];
								}
		
								for (var x in key) {
									node.attr[x] = _mask_ensureTmplFn(key[x]);
								}
		
							} else if (args === 2) {
								node.attr[key] = _mask_ensureTmplFn(value);
							}
							break;
						case 'removeAttr':
						case 'removeProp':
							node.attr[key] = null;
							break;
						}
					}
		
					return this;
				};
			});
		
			util_extend(jMask.prototype, {
				tag: function(arg) {
					if (typeof arg === 'string') {
						for (var i = 0, length = this.length; i < length; i++) {
							this[i].tagName = arg;
						}
						return this;
					}
					return this[0] && this[0].tagName;
				},
				css: function(mix, value) {
					var args = arguments.length,
						length = this.length,
						i = 0,
						css, key, style;
		
					if (args === 1 && typeof mix === 'string') {
						if (length === 0) {
							return null;
						}
						if (typeof this[0].attr.style === 'string') {
							return css_toObject(this[0].attr.style)[mix];
						} else {
							return null;
						}
					}
		
					for (; i < length; i++) {
						style = this[i].attr.style;
		
						if (typeof style === 'function') {
							continue;
						}
						if (args === 1 && typeof mix === 'object') {
							if (style == null) {
								this[i].attr.style = css_toString(mix);
								continue;
							}
							css = css_toObject(style);
							for (key in mix) {
								css[key] = mix[key];
							}
							this[i].attr.style = css_toString(css);
						}
		
						if (args === 2) {
							if (style == null) {
								this[i].attr.style = mix + ':' + value;
								continue;
							}
							css = css_toObject(style);
							css[mix] = value;
							this[i].attr.style = css_toString(css);
		
						}
					}
		
					return this;
				}
			});
		
			// TODO: val(...)?
		
			function css_toObject(style) {
				var arr = style.split(';'),
					obj = {},
					index;
				for (var i = 0, x, length = arr.length; i < length; i++) {
					x = arr[i];
					index = x.indexOf(':');
					obj[x.substring(0, index).trim()] = x.substring(index + 1).trim();
				}
				return obj;
			}
		
			function css_toString(css) {
				var output = [],
					i = 0;
				for (var key in css) {
					output[i++] = key + ':' + css[key];
				}
				return output.join(';');
			}
		
		}());
		
		// source ../src/jmask/manip.dom.js
		
		
		util_extend(jMask.prototype, {
			clone: function(){
				var result = [];
				for(var i = 0, length = this.length; i < length; i++){
					result[i] = jmask_clone(this[0]);
				}
				return jMask(result);
			},
		
			// @TODO - wrap also in maskdom (modify parents)
			wrap: function(wrapper){
				var $mask = jMask(wrapper),
					result = [],
					$wrapper;
		
				if ($mask.length === 0){
					console.log('Not valid wrapper', wrapper);
					return this;
				}
		
				for(var i = 0, length = this.length; i < length; i++){
					$wrapper = length > 0 ? $mask.clone() : $mask;
					jmask_deepest($wrapper[0]).nodes = [this[i]];
		
					result[i] = $wrapper[0];
		
					if (this[i].parent != null){
						this[i].parent.nodes = result[i];
					}
				}
		
				return jMask(result);
			},
			wrapAll: function(wrapper){
				var $wrapper = jMask(wrapper);
				if ($wrapper.length === 0){
					console.error('Not valid wrapper', wrapper);
					return this;
				}
		
		
				this.parent().mask($wrapper);
		
				jmask_deepest($wrapper[0]).nodes = this.toArray();
				return this.pushStack($wrapper);
			}
		});
		
		arr_each(['empty', 'remove'], function(method) {
			jMask.prototype[method] = function() {
				var i = 0,
					length = this.length,
					node;
		
				for (; i < length; i++) {
					node = this[i];
		
					if (method === 'empty') {
						node.nodes = null;
						continue;
					}
					if (method === 'remove') {
						if (node.parent != null) {
							arr_remove(node.parent.nodes, node);
						}
						continue;
					}
		
				}
		
				return this;
			};
		});
		
		// source ../src/jmask/traverse.js
		util_extend(jMask.prototype, {
			each: function(fn, cntx) {
				for (var i = 0; i < this.length; i++) {
					fn.call(cntx || this, this[i], i)
				}
				return this;
			},
			eq: function(i) {
				return i === -1 ? this.slice(i) : this.slice(i, i + 1);
			},
			get: function(i) {
				return i < 0 ? this[this.length - i] : this[i];
			},
			slice: function() {
				return this.pushStack(Array.prototype.slice.apply(this, arguments));
			}
		});
		
		
		arr_each([
			'filter',
			'children',
			'closest',
			'parent',
			'find',
			'first',
			'last'
		], function(method) {
		
			jMask.prototype[method] = function(selector) {
				var result = [],
					matcher = selector == null ? null : selector_parse(selector, this.type, method === 'closest' ? 'up' : 'down'),
					i, x;
		
				switch (method) {
				case 'filter':
					return jMask(jmask_filter(this, matcher));
				case 'children':
					for (i = 0; i < this.length; i++) {
						x = this[i];
						if (x.nodes == null) {
							continue;
						}
						result = result.concat(matcher == null ? x.nodes : jmask_filter(x.nodes, matcher));
					}
					break;
				case 'parent':
					for (i = 0; i < this.length; i++) {
						x = this[i].parent;
						if (!x || x.type === Dom.FRAGMENT || (matcher && selector_match(x, matcher))) {
							continue;
						}
						result.push(x);
					}
					arr_unique(result);
					break;
				case 'closest':
				case 'find':
					if (matcher == null) {
						break;
					}
					for (i = 0; i < this.length; i++) {
						jmask_find(this[i][matcher.nextKey], matcher, result);
					}
					break;
				case 'first':
				case 'last':
					var index;
					for (i = 0; i < this.length; i++) {
		
						index = method === 'first' ? i : this.length - i - 1;
						x = this[index];
						if (matcher == null || selector_match(x, matcher)) {
							result[0] = x;
							break;
						}
					}
					break;
				}
		
				return this.pushStack(result);
			};
		
		});
		
	
	
	
		return jMask;
	
	}(Mask));
	
	// source ../src/libs/mask.binding.js
	
	(function(mask, Compo){
		'use strict'
	
	
		// source ../src/vars.js
		var domLib = global.jQuery || global.Zepto || global.$,
			__Compo = typeof Compo !== 'undefined' ? Compo : (mask.Compo || global.Compo),
			__array_slice = Array.prototype.slice;
			
		
	
		// source ../src/util/object.js
		/**
		 *	Resolve object, or if property do not exists - create
		 */
		function obj_ensure(obj, chain) {
			for (var i = 0, length = chain.length - 1; i < length; i++) {
				var key = chain[i];
		
				if (obj[key] == null) {
					obj[key] = {};
				}
		
				obj = obj[key];
			}
			return obj;
		}
		
		
		function obj_getProperty(obj, property) {
				var chain = property.split('.'),
				length = chain.length,
				i = 0;
			for (; i < length; i++) {
				if (obj == null) {
					return null;
				}
		
				obj = obj[chain[i]];
			}
			return obj;
		}
		
		
		function obj_setProperty(obj, property, value) {
			var chain = property.split('.'),
				length = chain.length,
				i = 0,
				key = null;
		
			for (; i < length - 1; i++) {
				key = chain[i];
				if (obj[key] == null) {
					obj[key] = {};
				}
				obj = obj[key];
			}
		
			obj[chain[i]] = value;
		}
		
		/*
		 * @TODO refactor - add observer to direct parent with path tracking
		 *
		 * "a.b.c.d" (add observer to "c" on "d" property change)
		 * track if needed also "b" and "a"
		 */ 
		
		function obj_addObserver(obj, property, callback) {
			
			// closest observer
			var parts = property.split('.'),
				imax  = parts.length,
				i = 0, at = 0, x = obj;
			while (imax--) {
				x = x[parts[i++]];
				if (x == null) {
					break;
				}
				if (x.__observers != null) {
					at = i;
					obj = x;
				}
			}
			if (at > 0) {
				property = parts.slice(at).join('.');
			}
			
			
			if (obj.__observers == null) {
				Object.defineProperty(obj, '__observers', {
					value: {
						__dirty: null
					},
					enumerable: false
				});
			}
		
			var observers = obj.__observers;
		
			if (observers[property] != null) {
				observers[property].push(callback);
		
				var value = obj_getProperty(obj, property);
				if (arr_isArray(value)) {
					arr_addObserver(value, callback);
				}
		
				return;
			}
		
			var callbacks = observers[property] = [callback],
				chain = property.split('.'),
				length = chain.length,
				parent = length > 1 ? obj_ensure(obj, chain) : obj,
				key = chain[length - 1],
				currentValue = parent[key];
		
			if (key === 'length' && arr_isArray(parent)) {
				// we cannot redefine array properties like 'length'
				arr_addObserver(parent, callback);
				return;
			}
		
		
			Object.defineProperty(parent, key, {
				get: function() {
					return currentValue;
				},
				set: function(x) {
					if (x === currentValue) {
						return;
					}
					currentValue = x;
		
					if (arr_isArray(x)) {
						arr_addObserver(x, callback);
					}
		
					if (observers.__dirties != null) {
						observers.__dirties[property] = 1;
						return;
					}
		
					for (var i = 0, imax = callbacks.length; i < imax; i++) {
						callbacks[i](x);
					}
				}
			});
		
			if (arr_isArray(currentValue)) {
				arr_addObserver(currentValue, callback);
			}
		}
		
		
		function obj_lockObservers(obj) {
			if (arr_isArray(obj)) {
				arr_lockObservers(obj);
				return;
			}
		
			var obs = obj.__observers;
			if (obs != null) {
				obs.__dirties = {};
			}
		}
		
		function obj_unlockObservers(obj) {
			if (arr_isArray(obj)) {
				arr_unlockObservers(obj);
				return;
			}
		
			var obs = obj.__observers,
				dirties = obs == null ? null : obs.__dirties;
		
			if (dirties != null) {
				for (var prop in dirties) {
					var callbacks = obj.__observers[prop],
						value = obj_getProperty(obj, prop);
		
					if (callbacks != null) {
						for(var i = 0, imax = callbacks.length; i < imax; i++){
							callbacks[i](value);
						}
					}
				}
				obs.__dirties = null;
			}
		}
		
		
		function obj_removeObserver(obj, property, callback) {
			// nested observer
			var parts = property.split('.'),
				imax  = parts.length,
				i = 0, x = obj;
			while (imax--) {
				x = x[parts[i++]];
				if (x == null) {
					break;
				}
				if (x.__observers != null) {
					obj_removeObserver(obj, parts.slice(i).join('.'), callback);
					break;
				}
			}
			
			
			if (obj.__observers == null || obj.__observers[property] == null) {
				return;
			}
		
			var currentValue = obj_getProperty(obj, property);
			if (arguments.length === 2) {
				
				delete obj.__observers[property];
				return;
			}
		
			arr_remove(obj.__observers[property], callback);
		
			if (arr_isArray(currentValue)) {
				arr_removeObserver(currentValue, callback);
			}
		
		}
		
		function obj_extend(obj, source) {
			if (source == null) {
				return obj;
			}
			if (obj == null) {
				obj = {};
			}
			for (var key in source) {
				obj[key] = source[key];
			}
			return obj;
		}
		
		
		function obj_isDefined(obj, path) {
			if (obj == null) {
				return false;
			}
			
			var parts = path.split('.'),
				imax = parts.length,
				i = 0;
			
			while (imax--) {
				
				if ((obj = obj[parts[i++]]) == null) {
					return false;
				}
			}
			
			return true;
		}
		// source ../src/util/array.js
		
		function arr_isArray(x) {
			return x != null && typeof x === 'object' && x.length != null && typeof x.splice === 'function';
		}
		
		function arr_remove(array /*, .. */ ) {
			if (array == null) {
				return false;
			}
		
			var i = 0,
				length = array.length,
				x, j = 1,
				jmax = arguments.length,
				removed = 0;
		
			for (; i < length; i++) {
				x = array[i];
		
				for (j = 1; j < jmax; j++) {
					if (arguments[j] === x) {
		
						array.splice(i, 1);
						i--;
						length--;
						removed++;
						break;
					}
				}
			}
			return removed + 1 === jmax;
		}
		
		
		function arr_addObserver(arr, callback) {
		
			if (arr.__observers == null) {
				Object.defineProperty(arr, '__observers', {
					value: {
						__dirty: null
					},
					enumerable: false
				});
			}
			
			var observers = arr.__observers.__array;
			if (observers == null) {
				observers = arr.__observers.__array = [];
			}
			
			var i = 0,
				fns = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'],
				length = fns.length,
				method;
		
			for (; i < length; i++) {
				method = fns[i];
				arr[method] = _array_createWrapper(arr, arr[method], method);
			}
		
			observers[observers.length++] = callback;
		}
		
		function arr_removeObserver(arr, callback) {
			var obs = arr.__observers && arr.__observers.__array;
			if (obs != null) {
				for (var i = 0, imax = obs.length; i < imax; i++) {
					if (obs[i] === callback) {
						obs[i] = null;
		
						for (var j = i; j < imax; j++) {
							obs[j] = obs[j + 1];
						}
						
						imax--;
						obs.length--;
					}
				}
			}
		}
		
		function arr_lockObservers(arr) {
			if (arr.__observers != null) {
				arr.__observers.__dirty = false;
			}
		}
		
		function arr_unlockObservers(arr) {
			var list = arr.__observers,
				obs = list && list.__array;
				
			if (obs != null) {
				if (list.__dirty === true) {
					for (var i = 0, x, imax = obs.length; i < imax; i++) {
						x = obs[i];
						if (typeof x === 'function') {
							x(arr);
						}
					}
					list.__dirty = null;
				}
			}
		}
		
		function _array_createWrapper(array, originalFn, overridenFn) {
			return function() {
				return _array_methodWrapper(array, originalFn, overridenFn, __array_slice.call(arguments));
			};
		}
		
		
		function _array_methodWrapper(array, original, method, args) {
			var callbacks = array.__observers && array.__observers.__array,
				result = original.apply(array, args);
		
		
			if (callbacks == null || callbacks.length === 0) {
				return result;
			}
		
			if (array.__observers.__dirty != null) {
				array.__observers.__dirty = true;
				return result;
			}
		
		
			for (var i = 0, x, length = callbacks.length; i < length; i++) {
				x = callbacks[i];
				if (typeof x === 'function') {
					x(array, method, args);
				}
			}
		
			return result;
		}
		
		
		function arr_each(array, fn) {
			for (var i = 0, length = array.length; i < length; i++) {
				fn(array[i]);
			}
		}
		//////
		//////function arr_invoke(functions) {
		//////	for(var i = 0, x, imax = functions.length; i < imax; i++){
		//////		x = functions[i];
		//////
		//////		switch (arguments.length) {
		//////			case 1:
		//////				x();
		//////				break;
		//////			case 2:
		//////				x(arguments[1]);
		//////				break;
		//////			case 3:
		//////				x(arguments[1], arguments[2]);
		//////				break;
		//////			case 4:
		//////				x(arguments[1], arguments[2], arguments[3]);
		//////				break;
		//////			case 5:
		//////				x(arguments[1], arguments[2], arguments[3], arguments[4]);
		//////				break;
		//////			default:
		//////				x.apply(null, __array_slice.call(arguments, 1));
		//////				break;
		//////		}
		//////	}
		//////}
		
		// source ../src/util/dom.js
		
		function dom_removeElement(node) {
			return node.parentNode.removeChild(node);
		}
		
		function dom_removeAll(array) {
			if (array == null) {
				return;
			}
			for(var i = 0, length = array.length; i < length; i++){
				dom_removeElement(array[i]);
			}
		}
		
		function dom_insertAfter(element, anchor) {
			return anchor.parentNode.insertBefore(element, anchor.nextSibling);
		}
		
		function dom_insertBefore(element, anchor) {
			return anchor.parentNode.insertBefore(element, anchor);
		}
		
		
		
		function dom_addEventListener(element, event, listener) {
		
			// add event listener with jQuery for custom events
			if (typeof domLib === 'function'){
				domLib(element).on(event, listener);
				return;
			}
		
			if (element.addEventListener != null) {
				element.addEventListener(event, listener, false);
				return;
			}
			if (element.attachEvent) {
				element.attachEvent("on" + event, listener);
			}
		}
		
		// source ../src/util/compo.js
		
		////////function compo_lastChild(compo) {
		////////	return compo.components != null && compo.components[compo.components.length - 1];
		////////}
		////////
		////////function compo_childAt(compo, index) {
		////////	return compo.components && compo.components.length > index && compo.components[index];
		////////}
		////////
		////////function compo_lastElement(compo) {
		////////	var lastCompo = compo_lastChild(compo),
		////////		elements = lastCompo && (lastCompo.elements || lastCompo.$) || compo.elements;
		////////
		////////	return elements != null ? elements[elements.length - 1] : compo.placeholder;
		////////}
		
		function compo_fragmentInsert(compo, index, fragment) {
			if (compo.components == null) {
				return dom_insertAfter(fragment, compo.placeholder);
			}
		
			var compos = compo.components,
				anchor = null,
				insertBefore = true,
				length = compos.length,
				i = index,
				elements;
		
			for (; i< length; i++) {
				elements = compos[i].elements;
		
				if (elements && elements.length) {
					anchor = elements[0];
					break;
				}
			}
		
			if (anchor == null) {
				insertBefore = false;
				i = index < length ? index : length;
		
				while (--i > -1) {
					elements = compos[i].elements;
					if (elements && elements.length) {
						anchor = elements[elements.length - 1];
						break;
					}
				}
			}
		
			if (anchor == null) {
				anchor = compo.placeholder;
			}
		
			if (insertBefore) {
				return dom_insertBefore(fragment, anchor);
			}
		
			return dom_insertAfter(fragment, anchor);
		}
		
		function compo_render(parentController, template, model, cntx, container) {
			return mask.render(template, model, cntx, container, parentController);
		}
		
		function compo_dispose(compo, parent) {
			if (compo == null) {
				return false;
			}
		
			dom_removeAll(compo.elements);
		
			compo.elements = null;
		
			if (__Compo != null) {
				__Compo.dispose(compo);
			}
		
			var components = (parent && parent.components) || (compo.parent && compo.parent.components);
			if (components == null) {
				console.error('Parent Components Collection is undefined');
				return false;
			}
		
			return arr_remove(components, compo);
		
		}
		
		function compo_inserted(compo) {
			if (__Compo != null) {
				__Compo.signal.emitIn(compo, 'domInsert');
			}
		}
		
		function compo_attachDisposer(controller, disposer) {
		
			if (typeof controller.dispose === 'function') {
				var previous = controller.dispose;
				controller.dispose = function(){
					disposer.call(this);
					previous.call(this);
				};
		
				return;
			}
		
			controller.dispose = disposer;
		}
		
		// source ../src/util/expression.js
		var Expression = mask.Utils.Expression,
			expression_eval_origin = Expression.eval,
			expression_eval = function(expr, model, cntx, controller){
				
				if (expr === '.') {
					return model;
				}
				
				var value = expression_eval_origin(expr, model, cntx, controller);
		
				return value == null ? '' : value;
			},
			expression_parse = Expression.parse,
			expression_varRefs = Expression.varRefs;
		
		
		function expression_bind(expr, model, cntx, controller, callback) {
			
			if (expr === '.') {
				
				if (arr_isArray(model)) {
					arr_addObserver(model, callback);
				}
				
				return;
			}
			
			var ast = expression_parse(expr),
				vars = expression_varRefs(ast),
				obj, ref;
		
			if (vars == null) {
				return;
			}
		
			if (typeof vars === 'string') {
				
				if (obj_isDefined(model, vars)) {
					obj = model;
				}
				
				if (obj == null && obj_isDefined(controller, vars)) {
					obj = controller;
				}
				
				if (obj == null) {
					obj = model;
				}
				
				obj_addObserver(obj, vars, callback);
				return;
			}
		
			var isArray = vars.length != null && typeof vars.splice === 'function',
				imax = isArray === true ? vars.length : 1,
				i = 0,
				x;
			
			for (; i < imax; i++) {
				x = isArray ? vars[i] : vars;
				if (x == null) {
					continue;
				}
				
				
				if (typeof x === 'object') {
					
					obj = expression_eval_origin(x.accessor, model, cntx, controller);
					
					if (obj == null || typeof obj !== 'object') {
						console.error('Binding failed to an object over accessor', x);
						continue;
					}
					
					x = x.ref;
				} else if (obj_isDefined(model, x)) {
					
					obj = model;
				} else if (obj_isDefined(controller, x)) {
					
					obj = controller;
				} else {
					
					obj = model;
				}
				
				obj_addObserver(obj, x, callback);
			}
		
			return;
		}
		
		function expression_unbind(expr, model, controller, callback) {
			
			if (typeof controller === 'function') {
				console.warn('[mask.binding] - expression unbind(expr, model, controller, callback)');
			}
			
			if (expr === '.') {
				arr_removeObserver(model, callback);
				return;
			}
			
			var vars = expression_varRefs(expr),
				x, ref;
		
			if (vars == null) {
				return;
			}
			
			if (typeof vars === 'string') {
				if (obj_isDefined(model, vars)) {
					obj_removeObserver(model, vars, callback);
				}
				
				if (obj_isDefined(controller, vars)) {
					obj_removeObserver(controller, vars, callback);
				}
				
				return;
			}
			
			var isArray = vars.length != null && typeof vars.splice === 'function',
				imax = isArray === true ? vars.length : 1,
				i = 0,
				x;
			
			for (; i < imax; i++) {
				x = isArray ? vars[i] : vars;
				if (x == null) {
					continue;
				}
				
				
				if (typeof x === 'object') {
					
					var obj = expression_eval_origin(x.accessor, model, null, controller);
					
					if (obj) {
						obj_removeObserver(obj, x.ref, callback);
					}
					
					continue;
				}
				
				if (obj_isDefined(model, x)) {
					obj_removeObserver(model, x, callback);
				}
				
				if (obj_isDefined(controller, x)) {
					obj_removeObserver(controller, x, callback);
				}
			}
		
		}
		
		/**
		 * expression_bind only fires callback, if some of refs were changed,
		 * but doesnt supply new expression value
		 **/
		function expression_createBinder(expr, model, cntx, controller, callback) {
			var lockes = 0;
			return function binder() {
				if (lockes++ > 10) {
					console.warn('Concurent binder detected', expr);
					return;
				}
				
				var value = expression_eval(expr, model, cntx, controller);
				if (arguments.length > 1) {
					var args = __array_slice.call(arguments);
					
					args[0] = value;
					callback.apply(this, args);
					
				}else{
					
					callback(value);
				}
				
				lockes--;
			};
		}
		
		
		
		// source ../src/util/signal.js
		function signal_parse(str, isPiped, defaultType) {
			var signals = str.split(';'),
				set = [],
				i = 0,
				imax = signals.length,
				x,
				signalName, type,
				signal;
				
		
			for (; i < imax; i++) {
				x = signals[i].split(':');
				
				if (x.length !== 1 && x.length !== 2) {
					console.error('Too much ":" in a signal def.', signals[i]);
					continue;
				}
				
				
				type = x.length == 2 ? x[0] : defaultType;
				signalName = x[x.length == 2 ? 1 : 0];
				
				signal = signal_create(signalName.trim(), type, isPiped);
				
				if (signal != null) {
					set.push(signal);
				}
			}
			
			return set;
		}
		
		
		function signal_create(signal, type, isPiped) {
			if (isPiped !== true) {
				return {
					signal: signal,
					type: type
				};
			}
			
			var index = signal.indexOf('.');
			if (index === -1) {
				console.error('No pipe name in a signal', signal);
				return null;
			}
			
			return {
				signal: signal.substring(index + 1),
				pipe: signal.substring(0, index),
				type: type
			};
		}
	
		// source ../src/bindingProvider.js
		var BindingProvider = (function() {
			var Providers = {};
			
			mask.registerBinding = function(type, binding) {
				Providers[type] = binding;
			};
		
			mask.BindingProvider = BindingProvider;
			
			function BindingProvider(model, element, controller, bindingType) {
		
				if (bindingType == null) {
					bindingType = controller.compoName === ':bind' ? 'single' : 'dual';
				}
		
				var attr = controller.attr,
					type;
		
				this.node = controller; // backwards compat.
				this.controller = controller;
		
				this.model = model;
				this.element = element;
				this.value = attr.value;
				this.property = attr.property;
				this.setter = controller.attr.setter;
				this.getter = controller.attr.getter;
				this.dismiss = 0;
				this.bindingType = bindingType;
				this.log = false;
				this.signal_domChanged = null;
				this.signal_objectChanged = null;
				this.locked = false;
		
				if (this.property == null) {
		
					switch (element.tagName) {
						case 'INPUT':
							type = element.getAttribute('type');
							if ('checkbox' === type) {
								this.property = 'element.checked';
								break;
							}
							this.property = 'element.value';
							break;
						case 'TEXTAREA':
							this.property = 'element.value';
							break;
						case 'SELECT':
							this.domWay = DomWaysProto.SELECT;
							break;
						default:
							this.property = 'element.innerHTML';
							break;
					}
				}
		
				if (attr['log']) {
					this.log = true;
					if (attr.log !== 'log') {
						this.logExpression = attr.log;
					}
				}
		
				/**
				 *	Send signal on OBJECT or DOM change
				 */
				if (attr['x-signal']) {
					var signal = signal_parse(attr['x-signal'], null, 'dom')[0];
					
					if (signal) {
							
						if (signal.type === 'dom') {
							this.signal_domChanged = signal.signal;
						}
						
						else if (signal.type === 'object') {
							this.signal_objectChanged = signal.signal;
						}
						
						else {
							console.error('Type is not supported', signal);
						}
					}
					
				}
				
				if (attr['x-pipe-signal']) {
					var signal = signal_parse(attr['x-pipe-signal'], true, 'dom')[0];
					if (signal) {
						if (signal.type === 'dom') {
							this.pipe_domChanged = signal;
						}
						
						else if (signal.type === 'object') {
							this.pipe_objectChanged = signal;
						}
						
						else {
							console.error('Type is not supported', signal)
						}
					}
				}
				
				
				if (attr['dom-slot']) {
					this.slots = {};
					// @hack - place dualb. provider on the way of a signal
					// 
					var parent = controller.parent,
						newparent = parent.parent;
						
					parent.parent = this;
					this.parent = newparent;
					
					this.slots[attr['dom-slot']] = function(sender, value){
						this.domChanged(sender, value);
					}
				}
				
				/*
				 *  @obsolete: attr name : 'x-pipe-slot'
				 */
				var pipeSlot = attr['object-pipe-slot'] || attr['x-pipe-slot'];
				if (pipeSlot) {
					var str = pipeSlot,
						index = str.indexOf('.'),
						pipeName = str.substring(0, index),
						signal = str.substring(index + 1);
					
					this.pipes = {};
					this.pipes[pipeName] = {};
					this.pipes[pipeName][signal] = function(){
						this.objectChanged();
					};
					
					__Compo.pipe.addController(this);
				}
		
		
				if (attr.expression) {
					this.expression = attr.expression;
					if (this.value == null && bindingType !== 'single') {
						var refs = expression_varRefs(this.expression);
						if (typeof refs === 'string') {
							this.value = refs;
						} else {
							console.warn('Please set value attribute in DualBind Control.');
						}
					}
					return;
				}
				
				this.expression = this.value;
			}
			
			BindingProvider.create = function(model, element, controller, bindingType) {
		
				/* Initialize custom provider */
				var type = controller.attr.bindingProvider,
					CustomProvider = type == null ? null : Providers[type],
					provider;
		
				if (typeof CustomProvider === 'function') {
					return new CustomProvider(model, element, controller, bindingType);
				}
		
				provider = new BindingProvider(model, element, controller, bindingType);
		
				if (CustomProvider != null) {
					obj_extend(provider, CustomProvider);
				}
		
		
				return provider;
			};
			
			BindingProvider.bind = function(provider){
				return apply_bind(provider);
			}
		
		
			BindingProvider.prototype = {
				constructor: BindingProvider,
				
				//////handlers: {
				//////	attr: {
				//////		'x-signal': function(provider, value){
				//////			var signal = signal_parse(value, null, 'dom')[0];
				//////	
				//////			if (signal) {
				//////					
				//////				if (signal.type === 'dom') {
				//////					provider.signal_domChanged = signal.signal;
				//////				}
				//////				
				//////				else if (signal.type === 'object') {
				//////					provider.signal_objectChanged = signal.signal;
				//////				}
				//////				
				//////				else {
				//////					console.error('Type is not supported', signal);
				//////				}
				//////			}
				//////		}
				//////	}
				//////},
				
				dispose: function() {
					expression_unbind(this.expression, this.model, this.controller, this.binder);
				},
				objectChanged: function(x) {
					if (this.dismiss-- > 0) {
						return;
					}
					if (this.locked === true) {
						console.warn('Concurance change detected', this);
						return;
					}
					this.locked = true;
		
					if (x == null) {
						x = this.objectWay.get(this, this.expression);
					}
		
					this.domWay.set(this, x);
		
					if (this.log) {
						console.log('[BindingProvider] objectChanged -', x);
					}
					if (this.signal_objectChanged) {
						signal_emitOut(this.node, this.signal_objectChanged, [x]);
					}
					
					if (this.pipe_objectChanged) {
						var pipe = this.pipe_objectChanged;
						__Compo.pipe(pipe.pipe).emit(pipe.signal);
					}
		
					this.locked = false;
				},
				domChanged: function(event, value) {
		
					if (this.locked === true) {
						console.warn('Concurance change detected', this);
						return;
					}
					this.locked = true;
		
					var x = value || this.domWay.get(this),
						valid = true;
		
					if (this.node.validations) {
		
						for (var i = 0, validation, length = this.node.validations.length; i < length; i++) {
							validation = this.node.validations[i];
							if (validation.validate(x, this.element, this.objectChanged.bind(this)) === false) {
								valid = false;
								break;
							}
						}
					}
		
					if (valid) {
						this.dismiss = 1;
						this.objectWay.set(this.model, this.value, x);
						this.dismiss = 0;
		
						if (this.log) {
							console.log('[BindingProvider] domChanged -', x);
						}
		
						if (this.signal_domChanged) {
							signal_emitOut(this.node, this.signal_domChanged, [x]);
						}
						
						if (this.pipe_domChanged) {
							var pipe = this.pipe_domChanged;
							__Compo.pipe(pipe.pipe).emit(pipe.signal);
						}	
					}
		
					this.locked = false;
				},
				objectWay: {
					get: function(provider, expression) {
						return expression_eval(expression, provider.model, provider.cntx, provider.controller);
					},
					set: function(obj, property, value) {
						obj_setProperty(obj, property, value);
					}
				},
				/**
				 * usually you have to override this object, while getting/setting to element,
				 * can be very element(widget)-specific thing
				 *
				 * Note: The Functions are static
				 */
				domWay: {
					get: function(provider) {
						if (provider.getter) {
							var controller = provider.node.parent;
		
							// if DEBUG
							if (controller == null || typeof controller[provider.getter] !== 'function') {
								console.error('Mask.bindings: Getter should be a function', provider.getter, provider);
								return null;
							}
							// endif
		
							return controller[provider.getter]();
						}
						return obj_getProperty(provider, provider.property);
					},
					set: function(provider, value) {
						if (provider.setter) {
							var controller = provider.node.parent;
		
							// if DEBUG
							if (controller == null || typeof controller[provider.setter] !== 'function') {
								console.error('Mask.bindings: Setter should be a function', provider.setter, provider);
								return;
							}
							// endif
		
							controller[provider.setter](value);
						} else {
							obj_setProperty(provider, provider.property, value);
						}
		
					}
				}
			};
			
			var DomWaysProto = {
				SELECT: {
					get: function(provider) {
						var element = provider.element;
						
						if (element.selectedIndex === -1) {
							return '';
						}
						
						return element.options[element.selectedIndex].getAttribute('name');
					},
					set: function(provider, value) {
						var element = provider.element;
						
						for (var i = 0, x, imax = element.options.length; i < imax; i++){
							x = element.options[i];
							
							if (x.getAttribute('name') === value) {
								element.selectedIndex = i;
								return;
							}
						}
		
					}
				}
			};
		
		
		
			function apply_bind(provider) {
		
				var expr = provider.expression,
					model = provider.model,
					onObjChanged = provider.objectChanged = provider.objectChanged.bind(provider);
		
				provider.binder = expression_createBinder(expr, model, provider.cntx, provider.node, onObjChanged);
		
				expression_bind(expr, model, provider.cntx, provider.node, provider.binder);
		
				if (provider.bindingType === 'dual') {
					var attr = provider.node.attr;
					
					if (!attr['change-slot'] && !attr['change-pipe-event']) {
						var element = provider.element,
							/*
							 * @obsolete: attr name : 'changeEvent'
							 */
							eventType = attr['change-event'] || attr.changeEvent || 'change',
							onDomChange = provider.domChanged.bind(provider);
			
						dom_addEventListener(element, eventType, onDomChange);
					}
				}
		
				// trigger update
				provider.objectChanged();
				return provider;
			}
		
			function signal_emitOut(controller, signal, args) {
				var slots = controller.slots;
				if (slots != null && typeof slots[signal] === 'function') {
					if (slots[signal].apply(controller, args) === false) {
						return;
					}
				}
		
				if (controller.parent != null) {
					signal_emitOut(controller.parent, signal, args);
				}
			}
		
		
			obj_extend(BindingProvider, {
				addObserver: obj_addObserver,
				removeObserver: obj_removeObserver
			});
		
			return BindingProvider;
		
		}());
		
	
		// source ../src/mask-handler/visible.js
		/**
		 * visible handler. Used to bind directly to display:X/none
		 *
		 * attr =
		 *    check - expression to evaluate
		 *    bind - listen for a property change
		 */
		
		function VisibleHandler() {}
		
		mask.registerHandler(':visible', VisibleHandler);
		
		
		VisibleHandler.prototype = {
			constructor: VisibleHandler,
		
			refresh: function(model, container) {
				container.style.display = expression_eval(this.attr.check, model) ? '' : 'none';
			},
			renderStart: function(model, cntx, container) {
				this.refresh(model, container);
		
				if (this.attr.bind) {
					obj_addObserver(model, this.attr.bind, this.refresh.bind(this, model, container));
				}
			}
		};
		
		// source ../src/mask-handler/bind.js
		/**
		 *  Mask Custom Tag Handler
		 *	attr =
		 *		attr: {String} - attribute name to bind
		 *		prop: {Stirng} - property name to bind
		 *		- : {default} - innerHTML
		 */
		
		
		
		(function() {
		
			function Bind() {}
		
			mask.registerHandler(':bind', Bind);
		
			Bind.prototype = {
				constructor: Bind,
				renderEnd: function(els, model, cntx, container){
					
					this.provider = BindingProvider.create(model, container, this, 'single');
					
					BindingProvider.bind(this.provider);
				},
				dispose: function(){
					if (this.provider && typeof this.provider.dispose === 'function') {
						this.provider.dispose();
					}
				}
			};
		
		
		}());
		
		// source ../src/mask-handler/dualbind.js
		/**
		 *	Mask Custom Handler
		 *
		 *	2 Way Data Model binding
		 *
		 *
		 *	attr =
		 *		value: {string} - property path in object
		 *		?property : {default} 'element.value' - value to get/set from/to HTMLElement
		 *		?changeEvent: {default} 'change' - listen to this event for HTMLELement changes
		 *
		 *		?setter: {string} - setter function of a parent controller
		 *		?getter: {string} - getter function of a parent controller
		 *
		 *
		 */
		
		function DualbindHandler() {}
		
		mask.registerHandler(':dualbind', DualbindHandler);
		
		
		
		DualbindHandler.prototype = {
			constructor: DualbindHandler,
			
			renderEnd: function(elements, model, cntx, container) {
				this.provider = BindingProvider.create(model, container, this);
				
				if (this.components) {
					for (var i = 0, x, length = this.components.length; i < length; i++) {
						x = this.components[i];
		
						if (x.compoName === ':validate') {
							(this.validations || (this.validations = [])).push(x);
						}
					}
				}
		
				if (typeof model.Validate === 'object' && !this.attr['no-validation']) {
					
					var validator = model.Validate[this.provider.value];
					if (typeof validator === 'function') {
					
						validator = mask
							.getHandler(':validate')
							.createCustom(container, validator);
						
					
						(this.validations || (this.validations = []))
							.push(validator);
						
					}
				}
				
				
				BindingProvider.bind(this.provider);
			},
			dispose: function(){
				if (this.provider && typeof this.provider.dispose === 'function') {
					this.provider.dispose();
				}
			},
			
			handlers: {
				attr: {
					'x-signal' : function(){}
				}
			}
		};
		
		// source ../src/mask-handler/validate.js
		(function() {
			
			var class_INVALID = '-validate-invalid';
		
			mask.registerValidator = function(type, validator) {
				Validators[type] = validator;
			};
		
			function Validate() {}
		
			mask.registerHandler(':validate', Validate);
		
		
		
		
			Validate.prototype = {
				constructor: Validate,
				renderStart: function(model, cntx, container) {
					this.element = container;
					
					if (this.attr.value) {
						var validatorFn = Validate.resolveFromModel(model, this.attr.value);
							
						if (validatorFn) {
							this.validators = [new Validator(validatorFn)];
						}
					}
				},
				/**
				 * @param input - {control specific} - value to validate
				 * @param element - {HTMLElement} - (optional, @default this.element) -
				 *				Invalid message is schown(inserted into DOM) after this element
				 * @param oncancel - {Function} - Callback function for canceling
				 *				invalid notification
				 */
				validate: function(input, element, oncancel) {
					if (element == null){
						element = this.element;
					}
		
					if (this.attr) {
						
						if (input == null && this.attr.getter) {
							input = obj_getProperty({
								node: this,
								element: element
							}, this.attr.getter);
						}
						
						if (input == null && this.attr.value) {
							input = obj_getProperty(this.model, this.attr.value);
						}
					}
					
					
		
					if (this.validators == null) {
						this.initValidators();
					}
		
					for (var i = 0, x, imax = this.validators.length; i < imax; i++) {
						x = this.validators[i].validate(input)
						
						if (x && !this.attr.silent) {
							this.notifyInvalid(element, x, oncancel);
							return false;
						}
					}
		
					this.makeValid(element);
					return true;
				},
				notifyInvalid: function(element, message, oncancel){
					return notifyInvalid(element, message, oncancel);
				},
				makeValid: function(element){
					return makeValid(element);
				},
				initValidators: function() {
					this.validators = [];
					
					for (var key in this.attr) {
						
						
						switch (key) {
							case 'message':
							case 'value':
							case 'getter':
								continue;
						}
						
						if (key in Validators === false) {
							console.error('Unknown Validator:', key, this);
							continue;
						}
						
						var x = Validators[key];
						
						this.validators.push(new Validator(x(this.attr[key], this), this.attr.message));
					}
				}
			};
		
			
			Validate.resolveFromModel = function(model, property){
				return obj_getProperty(model.Validate, property);
			};
			
			Validate.createCustom = function(element, validator){
				var validate = new Validate();
				
				validate.renderStart(null, element);
				validate.validators = [new Validator(validator)];
				
				return validate;
			};
			
			
			function Validator(fn, defaultMessage) {
				this.fn = fn;
				this.message = defaultMessage;
			}
			Validator.prototype.validate = function(value){
				var result = this.fn(value);
				
				if (result === false) {
					return this.message || ('Invalid - ' + value);
				}
				return result;
			};
			
		
			function notifyInvalid(element, message, oncancel) {
				console.warn('Validate Notification:', element, message);
		
				var next = domLib(element).next('.' + class_INVALID);
				if (next.length === 0) {
					next = domLib('<div>')
						.addClass(class_INVALID)
						.html('<span></span><button>cancel</button>')
						.insertAfter(element);
				}
		
				return next
					.children('button')
					.off()
					.on('click', function() {
						next.hide();
						oncancel && oncancel();
			
					})
					.end()
					.children('span').text(message)
					.end()
					.show();
			}
		
			function makeValid(element) {
				return domLib(element).next('.' + class_INVALID).hide();
			}
		
			mask.registerHandler(':validate:message', Compo({
				template: 'div.' + class_INVALID + ' { span > "~[bind:message]" button > "~[cancel]" }',
				
				onRenderStart: function(model){
					if (typeof model === 'string') {
						model = {
							message: model
						};
					}
					
					if (!model.cancel) {
						model.cancel = 'cancel';
					}
					
					this.model = model;
				},
				compos: {
					button: '$: button',
				},
				show: function(message, oncancel){
					var that = this;
					
					this.model.message = message;
					this.compos.button.off().on(function(){
						that.hide();
						oncancel && oncancel();
						
					});
					
					this.$.show();
				},
				hide: function(){
					this.$.hide();
				}
			}));
			
			
			var Validators = {
				match: function(match) {
					
					return function(str){
						return new RegExp(match).test(str);
					};
				},
				unmatch:function(unmatch) {
					
					return function(str){
						return !(new RegExp(unmatch).test(str));
					};
				},
				minLength: function(min) {
					
					return function(str){
						return str.length >= parseInt(min, 10);
					};
				},
				maxLength: function(max) {
					
					return function(str){
						return str.length <= parseInt(max, 10);
					};
				},
				check: function(condition, node){
					
					return function(str){
						return expression_eval('x' + condition, node.model, {x: str}, node);
					};
				}
				
		
			};
		
		
		
		}());
		
		// source ../src/mask-handler/validate.group.js
		function ValidateGroup() {}
		
		mask.registerHandler(':validate:group', ValidateGroup);
		
		
		ValidateGroup.prototype = {
			constructor: ValidateGroup,
			validate: function() {
				var validations = getValidations(this);
		
		
				for (var i = 0, x, length = validations.length; i < length; i++) {
					x = validations[i];
					if (!x.validate()) {
						return false;
					}
				}
				return true;
			}
		};
		
		function getValidations(component, out){
			if (out == null){
				out = [];
			}
		
			if (component.components == null){
				return out;
			}
			var compos = component.components;
			for(var i = 0, x, length = compos.length; i < length; i++){
				x = compos[i];
		
				if (x.compoName === 'validate'){
					out.push(x);
					continue;
				}
		
				getValidations(x);
			}
			return out;
		}
		
	
		// source ../src/mask-util/bind.js
		
		/**
		 *	Mask Custom Utility - for use in textContent and attribute values
		 */
		
		(function(){
			
			function attr_strReplace(attrValue, currentValue, newValue) {
				if (!attrValue) {
					return newValue;
				}
				
				if (!currentValue) {
					return attrValue + ' ' + newValue;
				}
				
				return attrValue.replace(currentValue, newValue);
			}
		
			function create_refresher(type, expr, element, currentValue, attrName) {
		
				return function(value){
					switch (type) {
						case 'node':
							element.textContent = value;
							break;
						case 'attr':
							var _typeof = typeof element[attrName],
								currentAttr, attr;
		
		
							// handle properties first
							if ('boolean' === _typeof) {
								currentValue = element[attrName] = !!value;
								return;
							}
		
							if ('string' === _typeof) {
								currentValue = element[attrName] = attr_strReplace(element[attrName], currentValue, value);
								return;
							}
		
							currentAttr = element.getAttribute(attrName);
							attr = attr_strReplace(currentAttr, currentValue, value);
		
		
							element.setAttribute(attrName, attr);
							currentValue = value;
							break;
					}
				};
		
			}
		
		
			//mask.registerUtility('bind', function(expr, model, ctx, element, controller, attrName, type){
			//
			//	var current = expression_eval(expr, model, ctx, controller);
			//
			//	if ('node' === type) {
			//		element = document.createTextNode(current);
			//	}
			//
			//	var refresher =  create_refresher(type, expr, element, current, attrName),
			//		binder = expression_createBinder(expr, model, ctx, controller, refresher);
			//
			//	expression_bind(expr, model, ctx, controller, binder);
			//
			//
			//	compo_attachDisposer(controller, function(){
			//		expression_unbind(expr, model, controller, binder);
			//	});
			//
			//	return type === 'node' ? element : current;
			//});
		
			function bind (current, expr, model, ctx, element, controller, attrName, type){
				var	refresher =  create_refresher(type, expr, element, current, attrName),
					binder = expression_createBinder(expr, model, ctx, controller, refresher);
			
				expression_bind(expr, model, ctx, controller, binder);
			
			
				compo_attachDisposer(controller, function(){
					expression_unbind(expr, model, controller, binder);
				});
			}
		
			mask.registerUtil('bind', {
				current: null,
				element: null,
				nodeRenderStart: function(expr, model, ctx, element, controller){
					
					var current = expression_eval(expr, model, ctx, controller);
					
					this.current = current;
					this.element = document.createTextNode(current);
				},
				node: function(expr, model, ctx, element, controller){
					bind(
						this.current,
						expr,
						model,
						ctx,
						this.element,
						controller,
						null,
						'node');
					
					return this.element;
				},
				
				attrRenderStart: function(expr, model, ctx, element, controller){
					this.current = expression_eval(expr, model, ctx, controller);
				},
				attr: function(expr, model, ctx, element, controller, attrName){
					bind(
						this.current,
						expr,
						model,
						ctx,
						element,
						controller,
						attrName,
						'attr');
					
					return this.current;
				}
			});
		
		}());
		
		
		// source ../src/mask-attr/xxVisible.js
		
		
		mask.registerAttrHandler('xx-visible', function(node, attrValue, model, cntx, element, controller) {
			
			var binder = expression_createBinder(attrValue, model, cntx, controller, function(value){
				element.style.display = value ? '' : 'none';
			});
			
			expression_bind(attrValue, model, cntx, controller, binder);
			
			compo_attachDisposer(controller, function(){
				expression_unbind(attrValue, model,  controller, binder);
			});
			
			
			
			if (!expression_eval(attrValue, model, cntx, controller)) {
				
				element.style.display = 'none';
			}
		});
	
		// source ../src/sys/sys.js
		(function(mask) {
		
			function Sys() {
				this.attr = {
					'debugger': null,
					'use': null,
					'log': null,
					'if': null,
					'each': null,
					'visible': null
				};
			}
		
		
			mask.registerHandler('%%', Sys);
		
			// source attr.use.js
			var attr_use = (function() {
			
				var UseProto = {
					refresh: function(value) {
			
						this.model = value;
			
						if (this.elements) {
							dom_removeAll(this.elements);
			
							this.elements = [];
						}
			
						if (__Compo != null) {
							__Compo.dispose(this);
						}
			
						dom_insertBefore( //
						compo_render(this, this.nodes, this.model, this.cntx), this.placeholder);
			
					},
					dispose: function(){
						expression_unbind(this.expr, this.originalModel, this, this.binder);
					}
				};
			
				return function attr_use(self, model, cntx, container) {
			
					var expr = self.attr['use'];
			
					obj_extend(self, {
						expr: expr,
						placeholder: document.createComment(''),
						binder: expression_createBinder(expr, model, cntx, self, UseProto.refresh.bind(self)),
						
						originalModel: model,
						model: expression_eval(expr, model, cntx, self),
			
						dispose: UseProto.dispose
					});
			
			
					expression_bind(expr, model, cntx, self, self.binder);
			
					container.appendChild(self.placeholder);
				};
			
			}());
			
			// source attr.log.js
			var attr_log = (function() {
			
				return function attr_log(self, model, cntx) {
			
					function log(value) {
						console.log('Logger > Key: %s, Value: %s', expr, value);
					}
			
					var expr = self.attr['log'],
						binder = expression_createBinder(expr, model, cntx, self, log),
						value = expression_eval(expr, model, cntx, self);
			
					expression_bind(expr, model, cntx, self, binder);
			
			
					compo_attachDisposer(self, function(){
						expression_unbind(expr, model, self, binder);
					});
			
					log(value);
				};
			
			}());
			
			// source attr.if.js
			var attr_if = (function() {
			
				var IfProto = {
					refresh: function(value) {
			
						if (this.elements == null && !value) {
							// was not render and still falsy
							return;
						}
			
						if (this.elements == null) {
							// was not render - do it
			
							dom_insertBefore( //
							compo_render(this, this.template, this.model, this.cntx), this.placeholder);
			
							this.$ = domLib(this.elements);
						} else {
			
							if (this.$ == null) {
								this.$ = domLib(this.elements);
							}
							this.$[value ? 'show' : 'hide']();
						}
			
						if (this.onchange) {
							this.onchange(value);
						}
			
					},
					dispose: function(){
						expression_unbind(this.expr, this.model, this, this.binder);
						this.onchange = null;
						this.elements = null;
					}
				};
			
			
				function bind(fn, compo) {
					return function(){
						return fn.apply(compo, arguments);
					};
				}
			
				return function(self, model, cntx, container) {
			
					var expr = self.attr['if'];
			
			
					obj_extend(self, {
						expr: expr,
						template: self.nodes,
						placeholder: document.createComment(''),
						binder: expression_createBinder(expr, model, cntx, self, bind(IfProto.refresh, self)),
			
						state: !! expression_eval(expr, model, cntx, self)
					});
			
					if (!self.state) {
						self.nodes = null;
					}
			
					expression_bind(expr, model, cntx, self, self.binder);
			
					container.appendChild(self.placeholder);
				};
			
			}());
			
			// source attr.if.else.js
			var attr_else = (function() {
			
				var ElseProto = {
					refresh: function(value) {
						if (this.elements == null && value) {
							// was not render and still truthy
							return;
						}
			
						if (this.elements == null) {
							// was not render - do it
			
							dom_insertBefore(compo_render(this, this.template, this.model, this.cntx));
							this.$ = domLib(this.elements);
			
							return;
						}
			
						if (this.$ == null) {
							this.$ = domLib(this.elements);
						}
			
						this.$[value ? 'hide' : 'show']();
					}
				};
			
				return function(self, model, cntx, container) {
			
			
					var compos = self.parent.components,
						prev = compos && compos[compos.length - 1];
			
					self.template = self.nodes;
					self.placeholder = document.createComment('');
			
					// if DEBUG
					if (prev == null || prev.compoName !== '%%' || prev.attr['if'] == null) {
						console.error('Mask.Binding: Binded ELSE should be after binded IF - %% if="expression" { ...');
						return;
					}
					// endif
			
			
					// stick to previous IF controller
					prev.onchange = ElseProto.refresh.bind(self);
			
					if (prev.state) {
						self.nodes = null;
					}
			
			
			
					container.appendChild(self.placeholder);
				};
			
			}());
			
			// source attr.each.js
			var attr_each = (function() {
			
				// source attr.each.helper.js
				function list_prepairNodes(compo, arrayModel) {
					var nodes = [];
				
					if (arrayModel == null || typeof arrayModel !== 'object' || arrayModel.length == null) {
						return nodes;
					}
				
					var i = 0,
						length = arrayModel.length,
						model;
				
					for (; i < length; i++) {
				
						model = arrayModel[i];
				
						//create references from values to distinguish the models
						switch (typeof model) {
						case 'string':
						case 'number':
						case 'boolean':
							model = arrayModel[i] = Object(model);
							break;
						}
				
						nodes[i] = new ListItem(compo.template, model, compo);
					}
					return nodes;
				}
				
				
				function list_sort(self, array) {
				
					var compos = self.components,
						i = 0,
						imax = compos.length,
						j = 0,
						jmax = null,
						element = null,
						compo = null,
						fragment = document.createDocumentFragment(),
						sorted = [];
				
					for (; i < imax; i++) {
						compo = compos[i];
						if (compo.elements == null || compo.elements.length === 0) {
							continue;
						}
				
						for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
							element = compo.elements[j];
							element.parentNode.removeChild(element);
						}
					}
				
					outer: for (j = 0, jmax = array.length; j < jmax; j++) {
				
						for (i = 0; i < imax; i++) {
							if (array[j] === compos[i].model) {
								sorted[j] = compos[i];
								continue outer;
							}
						}
				
						console.warn('No Model Found for', array[j]);
					}
				
				
				
					for (i = 0, imax = sorted.length; i < imax; i++) {
						compo = sorted[i];
				
						if (compo.elements == null || compo.elements.length === 0) {
							continue;
						}
				
				
						for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
							element = compo.elements[j];
				
							fragment.appendChild(element);
						}
					}
				
					self.components = sorted;
				
					dom_insertBefore(fragment, self.placeholder);
				
				}
				
				function list_update(self, deleteIndex, deleteCount, insertIndex, rangeModel) {
					if (deleteIndex != null && deleteCount != null) {
						var i = deleteIndex,
							length = deleteIndex + deleteCount;
				
						if (length > self.components.length) {
							length = self.components.length;
						}
				
						for (; i < length; i++) {
							if (compo_dispose(self.components[i], self)){
								i--;
								length--;
							}
						}
					}
				
					if (insertIndex != null && rangeModel && rangeModel.length) {
				
						var component = new Component(),
							nodes = list_prepairNodes(self, rangeModel),
							fragment = compo_render(component, nodes),
							compos = component.components;
				
						compo_fragmentInsert(self, insertIndex, fragment);
						compo_inserted(component);
				
						if (self.components == null) {
							self.components = [];
						}
				
						self.components.splice.apply(self.components, [insertIndex, 0].concat(compos));
					}
				}
				
			
				var Component = mask.Dom.Component,
					ListItem = (function() {
						var Proto = Component.prototype;
			
						function ListItem(template, model, parent) {
							this.nodes = template;
							this.model = model;
							this.parent = parent;
						}
			
						ListItem.prototype = {
							constructor: ListProto,
							renderEnd: function(elements) {
								this.elements = elements;
							}
						};
			
						for (var key in Proto) {
							ListItem.prototype[key] = Proto[key];
						}
			
						return ListItem;
			
					}());
			
			
				var ListProto = {
					append: function(model) {
						var item = new ListItem(this.template, model, this);
			
						mask.render(item, model, null, this.container, this);
					}
				};
			
			
				var EachProto = {
					refresh: function(array, method, args) {
						var i = 0,
							x, imax;
			
						if (method == null) {
							// this was new array setter and not an immutable function call
			
							if (this.components != null) {
								for (i = 0, imax = this.components.length; i < imax; i++) {
									x = this.components[i];
									if (compo_dispose(x, this)) {
										i--;
										imax--;
									}
								}
							}
			
			
							this.components = [];
							this.nodes = list_prepairNodes(this, array);
			
							dom_insertBefore(compo_render(this, this.nodes), this.placeholder);
							
							arr_each(this.components, compo_inserted);
							return;
						}
			
			
						for (imax = array.length; i < imax; i++) {
							//create references from values to distinguish the models
							x = array[i];
							switch (typeof x) {
							case 'string':
							case 'number':
							case 'boolean':
								array[i] = Object(x);
								break;
							}
						}
			
						switch (method) {
						case 'push':
							list_update(this, null, null, array.length, array.slice(array.length - 1));
							break;
						case 'pop':
							list_update(this, array.length, 1);
							break;
						case 'unshift':
							list_update(this, null, null, 0, array.slice(0, 1));
							break;
						case 'shift':
							list_update(this, 0, 1);
							break;
						case 'splice':
							var sliceStart = args[0],
								sliceRemove = args.length === 1 ? this.components.length : args[1],
								sliceAdded = args.length > 2 ? array.slice(args[0], args.length - 2 + args[0]) : null;
			
							list_update(this, sliceStart, sliceRemove, sliceStart, sliceAdded);
							break;
						case 'sort':
						case 'reverse':
							list_sort(this, array);
							break;
						}
			
					},
					dispose: function() {
						expression_unbind(this.expr, this.model, this, this.refresh);
					}
				};
			
			
			
				return function attr_each(self, model, cntx, container) {
					if (self.nodes == null && typeof Compo !== 'undefined') {
						Compo.ensureTemplate(self);
					}
			
					var expr = self.attr.each || self.attr.foreach,
						current = expression_eval(expr, model, cntx, self);
			
					obj_extend(self, {
						expr: expr,
						binder: expression_createBinder(expr, model, cntx, self, EachProto.refresh.bind(self)),
						template: self.nodes,
						container: container,
						placeholder: document.createComment(''),
			
						dispose: EachProto.dispose
					});
			
					container.appendChild(self.placeholder);
			
					expression_bind(self.expr, model, cntx, self, self.binder);
			
					for (var method in ListProto) {
						self[method] = ListProto[method];
					}
			
			
					self.nodes = list_prepairNodes(self, current);
				};
			
			}());
			
			// source attr.visible.js
			var attr_visible = (function() {
			
				var VisibleProto = {
					refresh: function(){
			
						if (this.refreshing === true) {
							return;
						}
						this.refreshing = true;
			
						var visible = expression_eval(this.expr, this.model, this.cntx, this);
			
						for(var i = 0, imax = this.elements.length; i < imax; i++){
							this.elements[i].style.display = visible ? '' : 'none';
						}
			
						this.refreshing = false;
					},
			
					dispose: function(){
						expression_unbind(this.expr, this.model, this, this.binder);
					}
				};
			
				return function (self, model, cntx) {
			
					var expr = self.attr.visible;
			
					obj_extend(self, {
						expr: expr,
						binder: expression_createBinder(expr, model, cntx, self, VisibleProto.refresh.bind(self)),
			
						dispose: VisibleProto.dispose
					});
			
			
					expression_bind(expr, model, cntx, self, self.binder);
			
					VisibleProto.refresh.call(self);
				};
			
			}());
			
		
		
		
		
			Sys.prototype = {
				constructor: Sys,
				elements: null,
				renderStart: function(model, cntx, container) {
					var attr = this.attr;
		
					if (attr['debugger'] != null) {
						debugger;
						return;
					}
		
					if (attr['use'] != null) {
						attr_use(this, model, cntx, container);
						return;
					}
		
					if (attr['log'] != null) {
						attr_log(this, model, cntx, container);
						return;
					}
		
					this.model = model;
		
					if (attr['if'] != null) {
						attr_if(this, model, cntx, container);
						return;
					}
		
					if (attr['else'] != null) {
						attr_else(this, model, cntx, container);
						return;
					}
		
					// foreach is deprecated
					if (attr['each'] != null || attr['foreach'] != null) {
						attr_each(this, model, cntx, container);
					}
				},
				render: null,
				renderEnd: function(elements) {
					this.elements = elements;
		
		
					if (this.attr['visible'] != null) {
						attr_visible(this, this.model, this.cntx);
					}
				}
			};
		
		}(mask));
		
	
	}(Mask, Compo));
	


	return Mask;

}));

// source ../.reference/libjs/ruqq/lib/arr.js
(function(global) {

    'use strict';

	var r = global.ruqq || (global.ruqq = {});

    function getProperty(o, chain) {
        if (typeof o !== 'object' || chain == null) {
			return o;
		}

		var value = o,
			props = chain.split('.'),
			length = props.length,
			i = 0,
			key;

		for (; i < length; i++) {
			key = props[i];
			value = value[key];
			if (value == null) {
				return value;
			}
		}
		return value;
    }


    function extend(target, source) {
        for (var key in source) {
			if (source[key]) {
				target[key] = source[key];
			}
		}
        return target;
    }

    /**
     *  ~1: check(item, compareFunction);
     *  ~2: check(item, '>|<|>=|<=|==', compareToValue);
     *  ~3: check(item, propertyNameToCompare, '>|<|>=|<=|==', compareToValue);
     */

    function check(item, arg1, arg2, arg3) { /** get value */

        if (typeof arg1 === 'function') {
			return arg1(item) ? item : null;
		}
        if (typeof arg2 === 'undefined') {
			return item == arg1 ? item : null;
		}


        var value = arg1 != null ? getProperty(item, arg1) : item,
			comparer = arg2,
			compareToValue = arg3;

        switch (comparer) {
        case '>':
            return value > compareToValue ? item : null;
        case '<':
            return value < compareToValue ? item : null;
        case '>=':
            return value >= compareToValue ? item : null;
        case '<=':
            return value <= compareToValue ? item : null;
        case '!=':
            return value != compareToValue ? item : null;
        case '==':
            return value == compareToValue ? item : null;
        }
        console.error('InvalidArgumentException: arr.js:check', arguments);
        return null;
    }

    var arr = {
        /**
         * @see check
         */
        where: function(items, arg1, arg2, arg3) {
            var array = [];
            if (items == null) {
				return array;
			}

			var i = 0,
				length = items.length,
				item;

            for (; i < length; i++) {
				item = items[i];
                if (check(item, arg1, arg2, arg3) != null) {
					array.push(item);
				}
            }

            return array;
        },
        each: typeof Array.prototype.forEach !== 'undefined' ?
        function(items, fn) {
            if (items == null) {
				return items;
			}
            items.forEach(fn);
            return items;
        } : function(items, func) {
            if (items == null) {
				return items;
			}
            for (var i = 0, length = items.length; i < length; i++) {
				func(items[i]);
			}
            return items;
        },
        remove: function(items, arg1, arg2, arg3) {
            for (var i = 0, length = items.length; i < length; i++) {
				if (check(items[i], arg1, arg2, arg3) != null) {
                    items.splice(i, 1);
                    i--;
					length--;
                }
            }
            return items;
        },
        invoke: function() {
            var args = Array.prototype.slice.call(arguments);
            var items = args.shift(),
                method = args.shift(),
                results = [];
            for (var i = 0; i < items.length; i++) {
                if (typeof items[i][method] === 'function') {
                    results.push(items[i][method].apply(items[i], args));
                } else {
                    results.push(null);
                }
            }
            return results;
        },
        last: function(items, arg1, arg2, arg3) {
			if (items == null){
				return null;
			}
            if (arg1 == null) {
				return items[items.length - 1];
			}
            for (var i = items.length; i > -1; --i) {
				if (check(items[i], arg1, arg2, arg3) != null) {
					return items[i];
				}
			}
            return null;

        },
        /**
         * @see where()
         * Last Argument is default value
         */
        first: function(items, arg1, arg2, arg3) {
            if (arg1 == null) {
				return items[0];
			}
            for (var i = 0, length = items.length; i < length; i++) {
				if (check(items[i], arg1, arg2, arg3) != null) {
					return items[i];
				}
			}
            return null;
        },
        any: function(items, arg1, arg2, arg3) {
            for (var i = 0, length = items.length; i < length; i++) {
				if (check(items[i], arg1, arg2, arg3) != null) {
					return true;
				}
			}
            return false;
        },
        isIn: function(items, checkValue) {
            for (var i = 0; i < items.length; i++) {
				if (checkValue == items[i]) {
					return true;
				}
			}
            return false;
        },
        map: typeof Array.prototype.map !== 'undefined'
			? function(items, func) {
				if (items == null) {
					return [];
				}
				return items.map(func);
			}
			: function(items, func) {
				var agg = [];
				if (items == null) {
					return agg;
				}
				for (var i = 0, length = items.length; i < length; i++) {
					agg.push(func(items[i], i));
				}
				return agg;
			},
		aggr: function(items, aggr, fn){
			for(var i = 0, length = items.length; i < length; i++){
				var result = fn(items[i], aggr, i);
				if (result != null){
					aggr = result;
				}
			}
			return aggr;
		},
        /**
         * @arg arg -
         *          {Function} - return value to select)
         *          {String}  - property name to select
         *          {Array}[{String}] - property names
         */
        select: function(items, arg) {
            if (items == null) {
				return [];
			}
            var arr = [];
            for (var item, i = 0, length = items.length; i < length; i++) {
				item = items[i];

                if (typeof arg === 'string') {
                    arr.push(item[arg]);
                } else if (typeof arg === 'function') {
                    arr.push(arg(item));
                } else if (arg instanceof Array) {
                    var obj = {};
                    for (var j = 0; j < arg.length; j++) {
                        obj[arg[j]] = items[i][arg[j]];
                    }
                    arr.push(obj);
                }
            }
            return arr;
        },
        indexOf: function(items, arg1, arg2, arg3) {
            for (var i = 0, length = items.length; i < length; i++) {
                if (check(items[i], arg1, arg2, arg3) != null) {
					return i;
				}
            }
            return -1;
        },
        count: function(items, arg1, arg2, arg3) {
            var count = 0,
				i = 0,
				length = items.length;
            for (; i < length; i++) {
				if (check(items[i], arg1, arg2, arg3) != null) {
					count++;
				}
			}
            return count;
        },
        distinct: function(items, compareF) {
            var array = [];
            if (items == null) {
				return array;
			}

            var i  = 0,
				length = items.length;
            for (; i < length; i++) {
                var unique = true;
                for (var j = 0; j < array.length; j++) {
                    if ((compareF && compareF(items[i], array[j])) || (compareF == null && items[i] == array[j])) {
                        unique = false;
                        break;
                    }
                }
                if (unique) {
					array.push(items[i]);
				}
            }
            return array;
        }
    };

	arr.each(['min','max'], function(x){
		arr[x] = function(array, property){
			if (array == null){
				return null;
			}
			var number = null;
			for(var i = 0, length = array.length; i<length; i++){
				var prop = getProperty(array[i], property);

				if (number == null){
					number = prop;
					continue;
				}

				if (x === 'max' && prop > number){
					number = prop;
					continue;
				}
				if (x === 'min' && prop < number){
					number = prop;
					continue;
				}

			}
			return number;
		}
	});

    r.arr = function(items) {
        return new Expression(items);
    };

    extend(r.arr, arr);

    function Expression(items) {
        this.items = items;
    }

    function extendClass(method) {
        Expression.prototype[method] = function() {
            // @see http://jsperf.com/arguments-transform-vs-direct

            var l = arguments.length,
                result = arr[method](this.items, //
                l > 0 ? arguments[0] : null, //
                l > 1 ? arguments[1] : null, //
                l > 2 ? arguments[2] : null, //
                l > 3 ? arguments[3] : null);

            if (result instanceof Array) {
				this.items = result;
				return this;
			}

            return result;
        };
    }

	for (var method in arr) {
        extendClass(method);
    }

}(typeof window !== 'undefined' ? window : global));


// source ../src/UTest.js
(function(global){
	
	var _tests = [],
		_index = -1,
		_listeners = {},
		_options = {
			timeout: 1500
		},
		_testsDone;
		
	
	function nextUTest() {
		if (++_index > _tests.length - 1) {
			_testsDone();
			
			return;
		}
		
		var test = _tests[_index];
		
		test.run(nextUTest);
	}
	
	function teardownDelegate(teardown, done) {
		if (teardown == null) {
			return done;
		}
		return function(){
			runCase(teardown, done);
		};
	}
	
	function async(callback, name) {
		var isTimeouted = false,
			fn = function(){
				clearTimeout(timeout);
				!isTimeouted && callback();
			};
		
		var timeout = setTimeout(function(){
			console.error('Async Suite Timeout - ', name);
			
			isTimeouted = true;
			assert.timeouts.push(name);
			callback();
		}, _options.timeout);
		
		return fn;
	}
	
	
	function runCase(fn, done, teardown, key) {
		try {
				
			if (typeof fn === 'function') {
				if (case_isAsync(fn)) {
					fn( //
					async( //
					teardownDelegate(teardown, done), key));
					return;
				}
				
				fn();
			}
			teardownDelegate(teardown, done)();	
		
		} catch(error){
			console.error(error.stack || error);
			
			this.errors++;
			
			assert.errors++;
			done();
			
		}
	}
	
	function case_isAsync(fn) {
		return /^\s*function\s*([\w]+)?\s*\([\s]*[\w]+/.test(fn.toString());
	}
	
	var UTest = Class({
		Construct: function(suite){
			
			if (this instanceof UTest === false) {
				return new UTest(suite);
			}
			
			this.suite = suite;
			this.processed = [];
			
			Class.bind(this, 'nextCase');
			
			_tests.push(this);
			return this;
		},
		
		run: function(callback){
			
			this.processed = [];
			this.errors = 0;
			//this.snapshot = {
			//	total: assert.total,
			//	failed: assert.failed
			//};
			
			this.onComplete = callback;
			
			this.handleBangs();
			runCase(this.suite.before, this.nextCase);
		},
		
		handleBangs: function(){
			var has = ruqq.arr.any(Object.keys(this.suite), function(x){
				return x[0] === '!';
			});
			
			if (!has)
				return;
			
			for (var key in this.suite) {
				// reserved
				if (['before','after','teardown'].indexOf(key) !== -1) {
					continue;
				}
				
				if (key[0] !== '!') {
					delete this.suite[key];
				}
			}
		},
		
		nextCase: function(){
			for (var key in this.suite) {
				if (~this.processed.indexOf(key)) {
					continue;
				}
				
				// reserved
				if (['before','after','teardown'].indexOf(key) !== -1) {
					continue;
				}
				
				if (key.substring(0,2) === '//') {
					console.warn(key.substring(2), '(skipped)'.bold);
					this.processed.push(key);
					continue;
					
				}
				
				if (typeof this.suite[key] !== 'function') {
					continue;
				}
				
				this.processed.push(key);
				
				console.print((' ' + key + ': ').bold);
				runCase(this.suite[key], this.nextCase, this.suite.teardown, key);
				
				return;
			}
			
			var that = this;
			runCase(this.suite.after, function(){
				UTest.trigger('complete', that);
				that.onComplete();
			});
		},
		
		Static: {
			stats: function(){
				return {
					suites: _tests.length
				};
			},
			clear: function(){
				_tests = [];
				_listeners = {};
			},
			run: function(callback){
				_index = -1;
				_testsDone = callback;
				
				nextUTest();
			},
			on: function(event, callback){
				switch (event) {
					case 'complete':
						if (UTest.isBusy() === false) {
							callback();
							return;
						}
						break;
				}
				
				var fns = (_listeners[event] || (_listeners[event] = []));
				fns.push(callback);
			},
			trigger: function(event){
				var fns = _listeners[event];
				if (fns == null || !fns.length) {
					return;
				}
				
				var args = Array.prototype.slice.call(arguments, 1);
				for (var i = 0, x, imax = fns.length; i < imax; i++){
					x = fns[i];
					x.apply(null, args);
				}
			},
			isBusy: function(){
				return _index < _tests.length;
			},
			cfg: function(options){
				for (var key in options) {
					_options[key] = options[key];
				}
			}
		}
	});
	
	global.UTest = UTest;
	
	
}(this));




// source ../src/utils/array.js
function arr_isArray(array) {
	return !!(array != null && array.length != null && typeof array.splice === 'function');
}

function arr_isEmpty(array) {
	if (arr_isArray(array) === false)
		return true;
		
	return !array.length;
}

// source ../src/assert/assert.browser.js
(function(global){
	
	// source assert.js
	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Copyright (c) 2011 Jxck
	//
	// Originally from node.js (http://nodejs.org)
	// Copyright Joyent, Inc.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	(function(global) {
	
	// Object.create compatible in IE
	var create = Object.create || function(p) {
	  if (!p) throw Error('no type');
	  function f() {};
	  f.prototype = p;
	  return new f();
	};
	
	// UTILITY
	var util = {
	  inherits: function(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    ctor.prototype = create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  }
	};
	
	var pSlice = Array.prototype.slice;
	
	// from https://github.com/substack/node-deep-equal
	var Object_keys = typeof Object.keys === 'function'
	    ? Object.keys
	    : function (obj) {
	        var keys = [];
	        for (var key in obj) keys.push(key);
	        return keys;
	    }
	;
	
	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.
	
	var assert = ok;
	
	global['assert'] = assert;
	
	if (typeof module === 'object' && typeof module.exports === 'object') {
	  module.exports = assert;
	};
	
	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })
	
	assert.AssertionError = function AssertionError(options) {
	  this.name = 'AssertionError';
	  this.message = options.message;
	  this.actual = options.actual;
	  this.expected = options.expected;
	  this.operator = options.operator;
	  var stackStartFunction = options.stackStartFunction || fail;
	
	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, stackStartFunction);
	  }
	};
	
	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);
	
	function replacer(key, value) {
	  if (value === undefined) {
	    return '' + value;
	  }
	  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
	    return value.toString();
	  }
	  if (typeof value === 'function' || value instanceof RegExp) {
	    return value.toString();
	  }
	  return value;
	}
	
	function truncate(s, n) {
	  if (typeof s == 'string') {
	    return s.length < n ? s : s.slice(0, n);
	  } else {
	    return s;
	  }
	}
	
	assert.AssertionError.prototype.toString = function() {
	  if (this.message) {
	    return [this.name + ':', this.message].join(' ');
	  } else {
	    return [
	      this.name + ':',
	      truncate(JSON.stringify(this.actual, replacer), 128),
	      this.operator,
	      truncate(JSON.stringify(this.expected, replacer), 128)
	    ].join(' ');
	  }
	};
	
	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.
	
	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.
	
	function fail(actual, expected, message, operator, stackStartFunction) {
	  throw new assert.AssertionError({
	    message: message,
	    actual: actual,
	    expected: expected,
	    operator: operator,
	    stackStartFunction: stackStartFunction
	  });
	}
	
	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;
	
	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.
	
	function ok(value, message) {
	  if (!!!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;
	
	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);
	
	assert.equal = function equal(actual, expected, message) {
	  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};
	
	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);
	
	assert.notEqual = function notEqual(actual, expected, message) {
	  if (actual == expected) {
	    fail(actual, expected, message, '!=', assert.notEqual);
	  }
	};
	
	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);
	
	assert.deepEqual = function deepEqual(actual, expected, message) {
	  if (!_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
	  }
	};
	
	function _deepEqual(actual, expected) {
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;
	
	//  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
	//    if (actual.length != expected.length) return false;
	//
	//    for (var i = 0; i < actual.length; i++) {
	//      if (actual[i] !== expected[i]) return false;
	//    }
	//
	//    return true;
	//
	  // 7.2. If the expected value is a Date object, the actual value is
	  // equivalent if it is also a Date object that refers to the same time.
	  } else if (actual instanceof Date && expected instanceof Date) {
	    return actual.getTime() === expected.getTime();
	
	  // 7.3 If the expected value is a RegExp object, the actual value is
	  // equivalent if it is also a RegExp object with the same source and
	  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	  } else if (actual instanceof RegExp && expected instanceof RegExp) {
	    return actual.source === expected.source &&
	           actual.global === expected.global &&
	           actual.multiline === expected.multiline &&
	           actual.lastIndex === expected.lastIndex &&
	           actual.ignoreCase === expected.ignoreCase;
	
	  // 7.4. Other pairs that do not both pass typeof value == 'object',
	  // equivalence is determined by ==.
	  } else if (typeof actual != 'object' && typeof expected != 'object') {
	    return actual == expected;
	
	  // 7.5 For all other Object pairs, including Array objects, equivalence is
	  // determined by having the same number of owned properties (as verified
	  // with Object.prototype.hasOwnProperty.call), the same set of keys
	  // (although not necessarily the same order), equivalent values for every
	  // corresponding key, and an identical 'prototype' property. Note: this
	  // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected);
	  }
	}
	
	function isUndefinedOrNull(value) {
	  return value === null || value === undefined;
	}
	
	function isArguments(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	}
	
	function objEquiv(a, b) {
	  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
	    return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  //~~~I've managed to break Object.keys through screwy arguments passing.
	  //   Converting to array solves the problem.
	  if (isArguments(a)) {
	    if (!isArguments(b)) {
	      return false;
	    }
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return _deepEqual(a, b);
	  }
	  try {
	    var ka = Object_keys(a),
	        kb = Object_keys(b),
	        key, i;
	  } catch (e) {//happens when one is a string literal and the other isn't
	    return false;
	  }
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length)
	    return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i])
	      return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!_deepEqual(a[key], b[key])) return false;
	  }
	  return true;
	}
	
	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);
	
	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	  if (_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
	  }
	};
	
	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);
	
	assert.strictEqual = function strictEqual(actual, expected, message) {
	  if (actual !== expected) {
	    fail(actual, expected, message, '===', assert.strictEqual);
	  }
	};
	
	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);
	
	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	  if (actual === expected) {
	    fail(actual, expected, message, '!==', assert.notStrictEqual);
	  }
	};
	
	function expectedException(actual, expected) {
	  if (!actual || !expected) {
	    return false;
	  }
	
	  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
	    return expected.test(actual);
	  } else if (actual instanceof expected) {
	    return true;
	  } else if (expected.call({}, actual) === true) {
	    return true;
	  }
	
	  return false;
	}
	
	function _throws(shouldThrow, block, expected, message) {
	  var actual;
	
	  if (typeof expected === 'string') {
	    message = expected;
	    expected = null;
	  }
	
	  try {
	    block();
	  } catch (e) {
	    actual = e;
	  }
	
	  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
	            (message ? ' ' + message : '.');
	
	  if (shouldThrow && !actual) {
	    fail(actual, expected, 'Missing expected exception' + message);
	  }
	
	  if (!shouldThrow && expectedException(actual, expected)) {
	    fail(actual, expected, 'Got unwanted exception' + message);
	  }
	
	  if ((shouldThrow && actual && expected &&
	      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
	    throw actual;
	  }
	}
	
	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);
	
	assert.throws = function(block, /*optional*/error, /*optional*/message) {
	  _throws.apply(this, [true].concat(pSlice.call(arguments)));
	};
	
	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function(block, /*optional*/message) {
	  _throws.apply(this, [false].concat(pSlice.call(arguments)));
	};
	
	assert.ifError = function(err) { if (err) {throw err;}};
	
	if (typeof define === 'function' && define.amd) {
	  define('assert', function () {
	    return assert;
	  });
	}
	
	})(this);
	
	// source assert.wrapper.js
	
	
	global.assert = wrapAssertFns(wrapAssert(global.assert));
	
	obj_extend(assert, {
		total: 0,
		failed: 0,
		callbacks: 0,
		errors: 0,
		timeouts: [],
		
		reset: function(){
			
			this.callbacks = 0;
			this.failed = 0;
			this.total = 0;
			this.errors = 0;
			
			this.timeouts = [];
		},
		
		callback: function(callback){
			this.callbacks++;
			
			var that = this;
			return function(){
				that.callbacks--;
				
				return callback.apply(this, arguments);
			};
		}
	});
	
	/** GLOBALS */
	global.eq = assert.equal;
	global.notEq = assert.equal;
	global.deepEq = assert.deepEqual;
	global.notDeepEq = assert.notDeepEqual;
	global.strictEq = assert.strictEqual;
	global.notStrictEq = assert.notStrictEqual;
	
	// <!---
	
	function obj_extend(target, source) {
		for (var key in source) {
			target[key] = source[key];
		}
		return target;
	}
	
	function wrapAssert(original) {
		var fn;
		fn = wrapFn(original);
		fn.prototype = original.prototype;
		
		return obj_extend(fn, original);
	}
	
	function wrapAssertFns(assert) {
			
		for (var key in assert) {
			if (typeof assert[key] !== 'function') {
				continue;
			}
		
			if (key[0].toLowerCase() !== key[0]) {
				// Class Function Definition
				continue;
			}
		
			assert[key] = wrapFn(assert, key);
		}
		return assert;
	}
	
	function wrapFn(assertFn, key) {
		var original = key == null ? assertFn : assertFn[key];
		
		return function(){
			assert.total++;
			try {
				original.apply(this, arguments);
			} catch(e) {
				assert.failed++;
				
				assert.onfailure && assert.onfailure({
					actual: e.actual,
					expected: e.expected,
					stack: e.stack,
					message: e.message
				});
				return;
			}
			
			assert.onsuccess && assert.onsuccess();
		};
	}
	
	
}(this));
// source ../src/browser/detect.js
(function() {

	window.browserInfo = window.browserInfo || {};
	
	if (typeof navigator == 'undefined') {
		return;
	}

	var info = browserInfo,
		ua = navigator.userAgent,
		
		_object,
		_prop1,
		_prop2;

	function use(container, prop1, prop2) {
		_object = container;
		_prop1 = prop1;
		_prop2 = prop2;
	}

	function has(str, value, regexp) {
		if (ua.indexOf(str) == -1) {
			return false;
		}
		_object[_prop1] = value;

		if (regexp && _prop2) {
			var match = regexp.exec(ua);
			if (match && match.length > 1) {
				_object[_prop2] = match[1];
			}
		}
		return true;
	}


	use(info.platform = {}, 'name');
	if (!( //
	has('Windows', 'win') || //
	has('Mac', 'mac') || //
	has('Linux', 'linux') || //
	has('iPhone', 'iphone') || //
	has('Android', 'android'))) {
		info.platform.name = 'unknown'
	}

	use(info.browser = {}, 'name', 'version')
	if (!( //
	has('MSIE', 'msie', /MSIE (\d+(\.\d+)*)/) || //
	has('Firefox', 'firefox', /Firefox\/(\d+(\.\d+)*)/) || //
	has('Safari', 'safari', /Version\/(\d+(\.\d+)*)/) || //
	has('Opera', 'opera', /Version\/? ?(\d+(\.\d+)*)/))) {
		info.browser.name = 'unknown';
		info.browser.version = 0;
	}
	has('Chrome', 'chrome', /Chrome\/(\d+(\.\d+)*)/);


	use(info.engine = {}, 'name', 'version');
	if (!( //
	has('Trident', 'trident', /Trident\/(\d+(\.\d+)*)/) || //
	has('Gecko', 'gecko', /rv:(\d+(\.\d+)*)/) || //
	has('Presto', 'presto', /Presto\/(\d+(\.\d+)*)/) || //
	has('Opera', 'opera', /Version\/? ?(\d+(\.\d+)*)/))) {
		info.engine.name = 'unknown';
		info.engine.version = 0;
	}
	has('WebKit', 'webkit', /WebKit\/(\d+(\.\d+)*)/);

}());
// source ../src/browser/action.js
(function() {

	window.onerror = function(message, file, lineNumber) {
		var lines = [];
		lines.push('Message: ' + message);
		lines.push('File: ' + file + ':' + lineNumber);
		
		message = lines.join('\n');
		console.error(message);
		
		socket.emit('browser:utest:error', {
			error: message
		});
		
		//-state = state_ready;
	};
	
	// source notify.js
	function notify(state) {
		
		switch (state) {
			case 'connect':
				$('<div>').text('connected to server').appendTo('body');
				break;
		}
		
	}
	// source utils/logger.js
	(function() {
	
		var orig_log = console.log;
	
		console.print = function(){
			orig_log.apply(console, arguments);
		};
	
		for (var key in console) {
			if (typeof console[key] !== 'function') {
				continue;
			}
			console[key] = logger_create(key);
		}
	
		assert.onfailure = function() {
			socket.emit('browser:assert:failure', Array.prototype.slice.call(arguments));
		}
		assert.onsuccess = function() {
			socket.emit('browser:assert:success', Array.prototype.slice.call(arguments));
		}
	
		function logger_create(key) {
	
			var original = console[key];
			return function() {
				var args = [];
	
				for (var i = 0, x, imax = arguments.length; i < imax; i++) {
					args[i] = logger_dimissCircular(arguments[i]);
				}
	
				socket.emit('browser:log', key, args);
	
				return original.apply(console, args);
			};
		}
	
	
	
		var logger_dimissCircular = (function() {
			var cache;
	
			function clone(mix) {
				if (mix == null) {
					return null;
				}
	
	
				var cloned;
	
				if (mix instanceof Array) {
					cloned = [];
					for (var i = 0, imax = mix.length; i < imax; i++) {
						cloned[i] = clone(mix[i]);
					}
					return cloned;
				}
	
				if (typeof mix === 'object') {
	
					if (~cache.indexOf(mix)) {
						return '[object Circular]';
					}
					cache.push(mix);
	
					cloned = {};
					for (var key in mix) {
						cloned[key] = clone(mix[key]);
					}
					return cloned;
				}
	
				return mix;
			}
	
			return function(mix) {
				if (typeof mix === 'object' && mix != null) {
					cache = [];
					mix = clone(mix);
					cache = null;
				}
	
				return mix;
			};
		}());
	
	}());
	// source utils/script.js
	var script_insert = (function() {
	
		function scriptLoadedDelegate(callback) {
			return function scriptLoaded(event) {
				if (event && event.type === 'error') {
					console.error('Script cannt be loaded', event.target.src);
				}
	
				callback && callback();
			};
		}
	
	
		return function(data, callback) {
	
			var path = data.path,
				code = data.code,
				tag = document.createElement('script');
	
			callback = scriptLoadedDelegate(callback);
	
			tag.type = 'text/javascript';
	
			if (path) {
				//path += (~path.indexOf('?') ? '&' : '?') + Date.now();
	
				tag.src = path;
	
				if ('onreadystatechange' in tag) {
					tag.onreadystatechange = function() {
						switch (this.readyState) {
							case 'complete':
							case 'loaded':
								callback();
								break;
						}
					};
				} else {
					tag.onload = tag.onerror = callback;
				}
			} else {
				tag.innerHTML = code;
			}
	
			var head = document.querySelector('head');
	
			head.appendChild(tag);
		}
	}());
	
	var script_insertMany = function(bundle, callback){
		if (!(arr_isArray(bundle) && bundle.length)) {
			callback();
			return;
		}
		
		for (var i = 0, x, imax = bundle.length; i < imax; i++){
			x = bundle[i];
			
			script_insert({path: x}, i === imax - 1 ? callback : null);
		}
	}
	
	var script_getResources = (function() {
	
	
		return function() {
			var scripts = document.querySelectorAll('script'),
				resources = [];
	
			for (var i = 0, x, imax = scripts.length; i < imax; i++) {
				x = scripts[i].getAttribute('src');
	
				if (x) {
					resources.push(x);
				}
			}
			return resources;
		};
	}());
	// source utils/include.js
	var include_ready = (function() {
		var callback;
	
		function defer() {
			include.done(function() {
				setTimeout(check);
			});
		}
	
		function check() {
			if (typeof include === 'undefined') {
				callback();
				return;
			}
			if (include.state == null || include.state > 3) {
				callback();
				return;
			}
	
			defer();
		}
	
		return function(fn) {
			callback = fn;
	
			check();
		};
	}());
	
	var include_clearCache = function() {
		if (typeof include === 'undefined') {
			return;
		}
	
		var resources = include.getResources(),
			scripts = document.querySelectorAll('head > script');
		
		// @TODO - remove only scripts from resources
		for (var i = 0, x, imax = scripts.length; i < imax; i++){
			x = scripts[i];
			x.parentNode.removeChild(x);
		}
		
		
		
		for (var key in resources) {
			resources[key] = {};
		}
	
		include = include.instance();
	};
	
	var include_reset = function(){
		if (typeof include === 'undefined') {
			return;
		}
		
		include = include.instance();
	}
	// source RunnerDom.js
	var RunnerDom = (function() {
		
		var _configs,
			_configIndex,
			_socket,
			_stats,
			_onComplete,
			_runners;
		
		
		function cfg_runNext() {
			if (++_configIndex > _configs.length - 1) {
				_onComplete(_stats);
				return;
			}
			
			var runner = new RunnerDom(_configs[_configIndex]).run(cfg_runNext);
			_runners.push(runner);
		}
		
		return Class({
			Static: {
				run: function(configs, socket, callback){
					state = state_busy;
				
					_runners = [];
					_socket = socket;
					_configs = arr_isArray(configs) ? configs : [configs];
					_onComplete = callback;
					_stats = {};
					_configIndex = _scriptIndex = -1;
				
					_socket.emit('browser:utest:start', {
						userAgent: window.browserInfo
					});
				
					assert.reset();		
					cfg_runNext();
				},
				getResources: function(){
					var resources = [];
					
					for (var i = 0, x, imax = _runners.length; i < imax; i++){
						x = _runners[i];
						
						if (x.resources) {
							resources = resources.concat(x.resources);
						}
					}
					
					return resources;
				},
				getCurrentConfigs: function(){
					return _configs;
				}
			},
			
			// Class
			Construct: function(config){
				this.config = config;
				this.scripts = config.scripts;
				Class.bind(this, 'process', 'processSingle', 'singleComplete');
			},
			run: function(callback) {
				this.onComplete = callback;
				this.index = -1;
				this.stats = [];
				
				TestSuite.clear();
				include_clearCache();
	
				_socket.emit('browser:utest:suite:start', {
					url: this.config.name
				});
				
				if (!(this.scripts && this.scripts.length)) {
					console.warn('Suite has not test scripts');
					callback();
					return this;
				}
				
				this.loadEnv(this.process);
				return this;
			},
			
			loadEnv: function(callback){
				if (arr_isArray(this.config.env) === false) {
					callback();
					return;
				}
				
				if (typeof include === 'undefined') {
					script_insertMany(this.config.env, callback);
					return;
				}
				
				var resource = include.instance('/utest/');
				
				ruqq.arr.each(this.config.env, function(x){
					resource.js(x);
				});
				
				resource.done(function(resp){
					setTimeout(function(){
						for (var lib in resp) {
							var exports = resp[lib];
							
							if (exports != null) {
								window[lib] = exports;
							}
						}
						
						callback(resp);
					});
				});
			},
	
			process: function() {
	
				if (++this.index > this.scripts.length - 1) {
					this.resources = script_getResources();
					this.onComplete(this);
					return;
				}
				
				var path = this.scripts[this.index];
				
				_socket.emit('browser:utest:script',{
					script: path
				});
				
				include_reset();
				TestSuite.clear();
				
				script_insert({path: path}, this.processSingle);
				
			},
			
			processSingle: function(force){
				
				var that = this;
				
				include_ready(function(){
					TestSuite.run(that.singleComplete);
				});
			},
	
			singleComplete: function() {
				this.stats.push({
					url: this.scripts[this.index],
					total: assert.total,
					failed: assert.failed,
					timeouts: assert.timeouts,
					errors: assert.errors,
					callbacks: assert.callbacks,
				});
	
				this.process();
			},
		});
	
	}());

	var TestSuite = window.UTest,
		state_ready = 1,
		state_busy = 2,
		state = state_ready,
		socket = io.connect('/utest-browser')
			.on('connect', function(){
				notify('connect');
			})
			.on('server:utest:handshake', function(done) {
				done({
					userAgent: window.browserInfo,
					ready: state
				});
			})
			.on('server:utest', utest_start);

	



	function utest_start(config) {
		
		if (!config) {
			socket.emit('browser:utest:end', {
				error: 'No scripts to be tested'
			});
			return;
		}
		
		RunnerDom.run(config, socket, function(){
				
				state = state_ready;
			
				var resources = RunnerDom.getResources();
				
				socket.emit('browser:utest:end', {
					total: assert.total,
					failed: assert.failed,
					timeouts: assert.timeouts,
					callbacks: assert.callbacks,
					errors: assert.errors,
					
					userAgent: window.browserInfo,
					resources: resources
				});
				
				
			
		});
		
	}


	
}());


// source ../vendor/sinon.js
// source sinon.js
/*jslint eqeqeq: false, onevar: false, forin: true, nomen: false, regexp: false, plusplus: false*/
/*global module, require, __dirname, document*/
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

var sinon = (function (buster) {
    var div = typeof document != "undefined" && document.createElement("div");
    var hasOwn = Object.prototype.hasOwnProperty;

    function isDOMNode(obj) {
        var success = false;

        try {
            obj.appendChild(div);
            success = div.parentNode == obj;
        } catch (e) {
            return false;
        } finally {
            try {
                obj.removeChild(div);
            } catch (e) {
                // Remove failed, not much we can do about that
            }
        }

        return success;
    }

    function isElement(obj) {
        return div && obj && obj.nodeType === 1 && isDOMNode(obj);
    }

    function isFunction(obj) {
        return typeof obj === "function" || !!(obj && obj.constructor && obj.call && obj.apply);
    }

    function mirrorProperties(target, source) {
        for (var prop in source) {
            if (!hasOwn.call(target, prop)) {
                target[prop] = source[prop];
            }
        }
    }

    function isRestorable (obj) {
        return typeof obj === "function" && typeof obj.restore === "function" && obj.restore.sinon;
    }

    var sinon = {
        wrapMethod: function wrapMethod(object, property, method) {
            if (!object) {
                throw new TypeError("Should wrap property of object");
            }

            if (typeof method != "function") {
                throw new TypeError("Method wrapper should be function");
            }

            var wrappedMethod = object[property];

            if (!isFunction(wrappedMethod)) {
                throw new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
                                    property + " as function");
            }

            if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
                throw new TypeError("Attempted to wrap " + property + " which is already wrapped");
            }

            if (wrappedMethod.calledBefore) {
                var verb = !!wrappedMethod.returns ? "stubbed" : "spied on";
                throw new TypeError("Attempted to wrap " + property + " which is already " + verb);
            }

            // IE 8 does not support hasOwnProperty on the window object.
            var owned = hasOwn.call(object, property);
            object[property] = method;
            method.displayName = property;

            method.restore = function () {
                // For prototype properties try to reset by delete first.
                // If this fails (ex: localStorage on mobile safari) then force a reset
                // via direct assignment.
                if (!owned) {
                    delete object[property];
                }
                if (object[property] === method) {
                    object[property] = wrappedMethod;
                }
            };

            method.restore.sinon = true;
            mirrorProperties(method, wrappedMethod);

            return method;
        },

        extend: function extend(target) {
            for (var i = 1, l = arguments.length; i < l; i += 1) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        target[prop] = arguments[i][prop];
                    }

                    // DONT ENUM bug, only care about toString
                    if (arguments[i].hasOwnProperty("toString") &&
                        arguments[i].toString != target.toString) {
                        target.toString = arguments[i].toString;
                    }
                }
            }

            return target;
        },

        create: function create(proto) {
            var F = function () {};
            F.prototype = proto;
            return new F();
        },

        deepEqual: function deepEqual(a, b) {
            if (sinon.match && sinon.match.isMatcher(a)) {
                return a.test(b);
            }
            if (typeof a != "object" || typeof b != "object") {
                return a === b;
            }

            if (isElement(a) || isElement(b)) {
                return a === b;
            }

            if (a === b) {
                return true;
            }

            if ((a === null && b !== null) || (a !== null && b === null)) {
                return false;
            }

            var aString = Object.prototype.toString.call(a);
            if (aString != Object.prototype.toString.call(b)) {
                return false;
            }

            if (aString == "[object Array]") {
                if (a.length !== b.length) {
                    return false;
                }

                for (var i = 0, l = a.length; i < l; i += 1) {
                    if (!deepEqual(a[i], b[i])) {
                        return false;
                    }
                }

                return true;
            }

            if (aString == "[object Date]") {
                return a.valueOf() === b.valueOf();
            }

            var prop, aLength = 0, bLength = 0;

            for (prop in a) {
                aLength += 1;

                if (!deepEqual(a[prop], b[prop])) {
                    return false;
                }
            }

            for (prop in b) {
                bLength += 1;
            }

            return aLength == bLength;
        },

        functionName: function functionName(func) {
            var name = func.displayName || func.name;

            // Use function decomposition as a last resort to get function
            // name. Does not rely on function decomposition to work - if it
            // doesn't debugging will be slightly less informative
            // (i.e. toString will say 'spy' rather than 'myFunc').
            if (!name) {
                var matches = func.toString().match(/function ([^\s\(]+)/);
                name = matches && matches[1];
            }

            return name;
        },

        functionToString: function toString() {
            if (this.getCall && this.callCount) {
                var thisValue, prop, i = this.callCount;

                while (i--) {
                    thisValue = this.getCall(i).thisValue;

                    for (prop in thisValue) {
                        if (thisValue[prop] === this) {
                            return prop;
                        }
                    }
                }
            }

            return this.displayName || "sinon fake";
        },

        getConfig: function (custom) {
            var config = {};
            custom = custom || {};
            var defaults = sinon.defaultConfig;

            for (var prop in defaults) {
                if (defaults.hasOwnProperty(prop)) {
                    config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];
                }
            }

            return config;
        },

        format: function (val) {
            return "" + val;
        },

        defaultConfig: {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
        },

        timesInWords: function timesInWords(count) {
            return count == 1 && "once" ||
                count == 2 && "twice" ||
                count == 3 && "thrice" ||
                (count || 0) + " times";
        },

        calledInOrder: function (spies) {
            for (var i = 1, l = spies.length; i < l; i++) {
                if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {
                    return false;
                }
            }

            return true;
        },

        orderByFirstCall: function (spies) {
            return spies.sort(function (a, b) {
                // uuid, won't ever be equal
                var aCall = a.getCall(0);
                var bCall = b.getCall(0);
                var aId = aCall && aCall.callId || -1;
                var bId = bCall && bCall.callId || -1;

                return aId < bId ? -1 : 1;
            });
        },

        log: function () {},

        logError: function (label, err) {
            var msg = label + " threw exception: "
            sinon.log(msg + "[" + err.name + "] " + err.message);
            if (err.stack) { sinon.log(err.stack); }

            setTimeout(function () {
                err.message = msg + err.message;
                throw err;
            }, 0);
        },

        typeOf: function (value) {
            if (value === null) {
                return "null";
            }
            else if (value === undefined) {
                return "undefined";
            }
            var string = Object.prototype.toString.call(value);
            return string.substring(8, string.length - 1).toLowerCase();
        },

        createStubInstance: function (constructor) {
            if (typeof constructor !== "function") {
                throw new TypeError("The constructor should be a function.");
            }
            return sinon.stub(sinon.create(constructor.prototype));
        },

        restore: function (object) {
            if (object !== null && typeof object === "object") {
                for (var prop in object) {
                    if (isRestorable(object[prop])) {
                        object[prop].restore();
                    }
                }
            }
            else if (isRestorable(object)) {
                object.restore();
            }
        }
    };

    
    return sinon;
}());

// source spy.js
/**
  * @depend ../sinon.js
  * @depend call.js
  */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
  * Spy functions
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  */
"use strict";

(function (sinon) {
    var push = Array.prototype.push;
    var slice = Array.prototype.slice;
    var callId = 0;

    
    function spy(object, property) {
        if (!property && typeof object == "function") {
            return spy.create(object);
        }

        if (!object && !property) {
            return spy.create(function () { });
        }

        var method = object[property];
        return sinon.wrapMethod(object, property, spy.create(method));
    }

    function matchingFake(fakes, args, strict) {
        if (!fakes) {
            return;
        }

        var alen = args.length;

        for (var i = 0, l = fakes.length; i < l; i++) {
            if (fakes[i].matches(args, strict)) {
                return fakes[i];
            }
        }
    }

    function incrementCallCount() {
        this.called = true;
        this.callCount += 1;
        this.notCalled = false;
        this.calledOnce = this.callCount == 1;
        this.calledTwice = this.callCount == 2;
        this.calledThrice = this.callCount == 3;
    }

    function createCallProperties() {
        this.firstCall = this.getCall(0);
        this.secondCall = this.getCall(1);
        this.thirdCall = this.getCall(2);
        this.lastCall = this.getCall(this.callCount - 1);
    }

    var vars = "a,b,c,d,e,f,g,h,i,j,k,l";
    function createProxy(func) {
        // Retain the function length:
        var p;
        if (func.length) {
            eval("p = (function proxy(" + vars.substring(0, func.length * 2 - 1) +
                ") { return p.invoke(func, this, slice.call(arguments)); });");
        }
        else {
            p = function proxy() {
                return p.invoke(func, this, slice.call(arguments));
            };
        }
        return p;
    }

    var uuid = 0;

    // Public API
    var spyApi = {
        reset: function () {
            this.called = false;
            this.notCalled = true;
            this.calledOnce = false;
            this.calledTwice = false;
            this.calledThrice = false;
            this.callCount = 0;
            this.firstCall = null;
            this.secondCall = null;
            this.thirdCall = null;
            this.lastCall = null;
            this.args = [];
            this.returnValues = [];
            this.thisValues = [];
            this.exceptions = [];
            this.callIds = [];
            if (this.fakes) {
                for (var i = 0; i < this.fakes.length; i++) {
                    this.fakes[i].reset();
                }
            }
        },

        create: function create(func) {
            var name;

            if (typeof func != "function") {
                func = function () { };
            } else {
                name = sinon.functionName(func);
            }

            var proxy = createProxy(func);

            sinon.extend(proxy, spy);
            delete proxy.create;
            sinon.extend(proxy, func);

            proxy.reset();
            proxy.prototype = func.prototype;
            proxy.displayName = name || "spy";
            proxy.toString = sinon.functionToString;
            proxy._create = sinon.spy.create;
            proxy.id = "spy#" + uuid++;

            return proxy;
        },

        invoke: function invoke(func, thisValue, args) {
            var matching = matchingFake(this.fakes, args);
            var exception, returnValue;

            incrementCallCount.call(this);
            push.call(this.thisValues, thisValue);
            push.call(this.args, args);
            push.call(this.callIds, callId++);

            try {
                if (matching) {
                    returnValue = matching.invoke(func, thisValue, args);
                } else {
                    returnValue = (this.func || func).apply(thisValue, args);
                }
            } catch (e) {
                push.call(this.returnValues, undefined);
                exception = e;
                throw e;
            } finally {
                push.call(this.exceptions, exception);
            }

            push.call(this.returnValues, returnValue);

            createCallProperties.call(this);

            return returnValue;
        },

        getCall: function getCall(i) {
            if (i < 0 || i >= this.callCount) {
                return null;
            }

            return sinon.spyCall(this, this.thisValues[i], this.args[i],
                                    this.returnValues[i], this.exceptions[i],
                                    this.callIds[i]);
        },

        calledBefore: function calledBefore(spyFn) {
            if (!this.called) {
                return false;
            }

            if (!spyFn.called) {
                return true;
            }

            return this.callIds[0] < spyFn.callIds[spyFn.callIds.length - 1];
        },

        calledAfter: function calledAfter(spyFn) {
            if (!this.called || !spyFn.called) {
                return false;
            }

            return this.callIds[this.callCount - 1] > spyFn.callIds[spyFn.callCount - 1];
        },

        withArgs: function () {
            var args = slice.call(arguments);

            if (this.fakes) {
                var match = matchingFake(this.fakes, args, true);

                if (match) {
                    return match;
                }
            } else {
                this.fakes = [];
            }

            var original = this;
            var fake = this._create();
            fake.matchingAguments = args;
            push.call(this.fakes, fake);

            fake.withArgs = function () {
                return original.withArgs.apply(original, arguments);
            };

            for (var i = 0; i < this.args.length; i++) {
                if (fake.matches(this.args[i])) {
                    incrementCallCount.call(fake);
                    push.call(fake.thisValues, this.thisValues[i]);
                    push.call(fake.args, this.args[i]);
                    push.call(fake.returnValues, this.returnValues[i]);
                    push.call(fake.exceptions, this.exceptions[i]);
                    push.call(fake.callIds, this.callIds[i]);
                }
            }
            createCallProperties.call(fake);

            return fake;
        },

        matches: function (args, strict) {
            var margs = this.matchingAguments;

            if (margs.length <= args.length &&
                sinon.deepEqual(margs, args.slice(0, margs.length))) {
                return !strict || margs.length == args.length;
            }
        },

        printf: function (format) {
            var spy = this;
            var args = slice.call(arguments, 1);
            var formatter;

            return (format || "").replace(/%(.)/g, function (match, specifyer) {
                formatter = spyApi.formatters[specifyer];

                if (typeof formatter == "function") {
                    return formatter.call(null, spy, args);
                } else if (!isNaN(parseInt(specifyer), 10)) {
                    return sinon.format(args[specifyer - 1]);
                }

                return "%" + specifyer;
            });
        }
    };

    function delegateToCalls(method, matchAny, actual, notCalled) {
        spyApi[method] = function () {
            if (!this.called) {
                if (notCalled) {
                    return notCalled.apply(this, arguments);
                }
                return false;
            }

            var currentCall;
            var matches = 0;

            for (var i = 0, l = this.callCount; i < l; i += 1) {
                currentCall = this.getCall(i);

                if (currentCall[actual || method].apply(currentCall, arguments)) {
                    matches += 1;

                    if (matchAny) {
                        return true;
                    }
                }
            }

            return matches === this.callCount;
        };
    }

    delegateToCalls("calledOn", true);
    delegateToCalls("alwaysCalledOn", false, "calledOn");
    delegateToCalls("calledWith", true);
    delegateToCalls("calledWithMatch", true);
    delegateToCalls("alwaysCalledWith", false, "calledWith");
    delegateToCalls("alwaysCalledWithMatch", false, "calledWithMatch");
    delegateToCalls("calledWithExactly", true);
    delegateToCalls("alwaysCalledWithExactly", false, "calledWithExactly");
    delegateToCalls("neverCalledWith", false, "notCalledWith",
        function () { return true; });
    delegateToCalls("neverCalledWithMatch", false, "notCalledWithMatch",
        function () { return true; });
    delegateToCalls("threw", true);
    delegateToCalls("alwaysThrew", false, "threw");
    delegateToCalls("returned", true);
    delegateToCalls("alwaysReturned", false, "returned");
    delegateToCalls("calledWithNew", true);
    delegateToCalls("alwaysCalledWithNew", false, "calledWithNew");
    delegateToCalls("callArg", false, "callArgWith", function () {
        throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
    });
    spyApi.callArgWith = spyApi.callArg;
    delegateToCalls("callArgOn", false, "callArgOnWith", function () {
        throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
    });
    spyApi.callArgOnWith = spyApi.callArgOn;
    delegateToCalls("yield", false, "yield", function () {
        throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
    });
    // "invokeCallback" is an alias for "yield" since "yield" is invalid in strict mode.
    spyApi.invokeCallback = spyApi.yield;
    delegateToCalls("yieldOn", false, "yieldOn", function () {
        throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
    });
    delegateToCalls("yieldTo", false, "yieldTo", function (property) {
        throw new Error(this.toString() + " cannot yield to '" + property +
            "' since it was not yet invoked.");
    });
    delegateToCalls("yieldToOn", false, "yieldToOn", function (property) {
        throw new Error(this.toString() + " cannot yield to '" + property +
            "' since it was not yet invoked.");
    });

    spyApi.formatters = {
        "c": function (spy) {
            return sinon.timesInWords(spy.callCount);
        },

        "n": function (spy) {
            return spy.toString();
        },

        "C": function (spy) {
            var calls = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
                var stringifiedCall = "    " + spy.getCall(i).toString();
                if (/\n/.test(calls[i - 1])) {
                    stringifiedCall = "\n" + stringifiedCall;
                }
                push.call(calls, stringifiedCall);
            }

            return calls.length > 0 ? "\n" + calls.join("\n") : "";
        },

        "t": function (spy) {
            var objects = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
                push.call(objects, sinon.format(spy.thisValues[i]));
            }

            return objects.join(", ");
        },

        "*": function (spy, args) {
            var formatted = [];

            for (var i = 0, l = args.length; i < l; ++i) {
                push.call(formatted, sinon.format(args[i]));
            }

            return formatted.join(", ");
        }
    };

    sinon.extend(spy, spyApi);

    spy.spyCall = sinon.spyCall;

    

    sinon.spy = spy;
    
}(sinon));

// source call.js
/**
  * @depend ../sinon.js
  * @depend match.js
  */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
  * Spy calls
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @author Maximilian Antoni (mail@maxantoni.de)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  * Copyright (c) 2013 Maximilian Antoni
  */
"use strict";

(function (sinon) {
    
    function throwYieldError(proxy, text, args) {
        var msg = sinon.functionName(proxy) + text;
        if (args.length) {
            msg += " Received [" + slice.call(args).join(", ") + "]";
        }
        throw new Error(msg);
    }

    var slice = Array.prototype.slice;

    var callProto = {
        calledOn: function calledOn(thisValue) {
            if (sinon.match && sinon.match.isMatcher(thisValue)) {
                return thisValue.test(this.thisValue);
            }
            return this.thisValue === thisValue;
        },

        calledWith: function calledWith() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
                if (!sinon.deepEqual(arguments[i], this.args[i])) {
                    return false;
                }
            }

            return true;
        },

        calledWithMatch: function calledWithMatch() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
                var actual = this.args[i];
                var expectation = arguments[i];
                if (!sinon.match || !sinon.match(expectation).test(actual)) {
                    return false;
                }
            }
            return true;
        },

        calledWithExactly: function calledWithExactly() {
            return arguments.length == this.args.length &&
                this.calledWith.apply(this, arguments);
        },

        notCalledWith: function notCalledWith() {
            return !this.calledWith.apply(this, arguments);
        },

        notCalledWithMatch: function notCalledWithMatch() {
            return !this.calledWithMatch.apply(this, arguments);
        },

        returned: function returned(value) {
            return sinon.deepEqual(value, this.returnValue);
        },

        threw: function threw(error) {
            if (typeof error === "undefined" || !this.exception) {
                return !!this.exception;
            }

            return this.exception === error || this.exception.name === error;
        },

        calledWithNew: function calledWithNew(thisValue) {
            return this.thisValue instanceof this.proxy;
        },

        calledBefore: function (other) {
            return this.callId < other.callId;
        },

        calledAfter: function (other) {
            return this.callId > other.callId;
        },

        callArg: function (pos) {
            this.args[pos]();
        },

        callArgOn: function (pos, thisValue) {
            this.args[pos].apply(thisValue);
        },

        callArgWith: function (pos) {
            this.callArgOnWith.apply(this, [pos, null].concat(slice.call(arguments, 1)));
        },

        callArgOnWith: function (pos, thisValue) {
            var args = slice.call(arguments, 2);
            this.args[pos].apply(thisValue, args);
        },

        "yield": function () {
            this.yieldOn.apply(this, [null].concat(slice.call(arguments, 0)));
        },

        yieldOn: function (thisValue) {
            var args = this.args;
            for (var i = 0, l = args.length; i < l; ++i) {
                if (typeof args[i] === "function") {
                    args[i].apply(thisValue, slice.call(arguments, 1));
                    return;
                }
            }
            throwYieldError(this.proxy, " cannot yield since no callback was passed.", args);
        },

        yieldTo: function (prop) {
            this.yieldToOn.apply(this, [prop, null].concat(slice.call(arguments, 1)));
        },

        yieldToOn: function (prop, thisValue) {
            var args = this.args;
            for (var i = 0, l = args.length; i < l; ++i) {
                if (args[i] && typeof args[i][prop] === "function") {
                    args[i][prop].apply(thisValue, slice.call(arguments, 2));
                    return;
                }
            }
            throwYieldError(this.proxy, " cannot yield to '" + prop +
                "' since no callback was passed.", args);
        },

        toString: function () {
            var callStr = this.proxy.toString() + "(";
            var args = [];

            for (var i = 0, l = this.args.length; i < l; ++i) {
                args.push(sinon.format(this.args[i]));
            }

            callStr = callStr + args.join(", ") + ")";

            if (typeof this.returnValue != "undefined") {
                callStr += " => " + sinon.format(this.returnValue);
            }

            if (this.exception) {
                callStr += " !" + this.exception.name;

                if (this.exception.message) {
                    callStr += "(" + this.exception.message + ")";
                }
            }

            return callStr;
        }
    };

    callProto.invokeCallback = callProto.yield;

    function createSpyCall(spy, thisValue, args, returnValue, exception, id) {
        if (typeof id !== "number") {
            throw new TypeError("Call id is not a number");
        }
        var proxyCall = sinon.create(callProto);
        proxyCall.proxy = spy;
        proxyCall.thisValue = thisValue;
        proxyCall.args = args;
        proxyCall.returnValue = returnValue;
        proxyCall.exception = exception;
        proxyCall.callId = id;

        return proxyCall;
    };
    createSpyCall.toString = callProto.toString; // used by mocks

    sinon.spyCall = createSpyCall;
    
}(sinon));


// source stub.js
/**
 * @depend ../sinon.js
 * @depend spy.js
 */
/*jslint eqeqeq: false, onevar: false*/
/*global module, require, sinon*/
/**
 * Stub functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    
    function stub(object, property, func) {
        if (!!func && typeof func != "function") {
            throw new TypeError("Custom stub should be function");
        }

        var wrapper;

        if (func) {
            wrapper = sinon.spy && sinon.spy.create ? sinon.spy.create(func) : func;
        } else {
            wrapper = stub.create();
        }

        if (!object && !property) {
            return sinon.stub.create();
        }

        if (!property && !!object && typeof object == "object") {
            for (var prop in object) {
                if (typeof object[prop] === "function") {
                    stub(object, prop);
                }
            }

            return object;
        }

        return sinon.wrapMethod(object, property, wrapper);
    }

    function getChangingValue(stub, property) {
        var index = stub.callCount - 1;
        var values = stub[property];
        var prop = index in values ? values[index] : values[values.length - 1];
        stub[property + "Last"] = prop;

        return prop;
    }

    function getCallback(stub, args) {
        var callArgAt = getChangingValue(stub, "callArgAts");

        if (callArgAt < 0) {
            var callArgProp = getChangingValue(stub, "callArgProps");

            for (var i = 0, l = args.length; i < l; ++i) {
                if (!callArgProp && typeof args[i] == "function") {
                    return args[i];
                }

                if (callArgProp && args[i] &&
                    typeof args[i][callArgProp] == "function") {
                    return args[i][callArgProp];
                }
            }

            return null;
        }

        return args[callArgAt];
    }

    var join = Array.prototype.join;

    function getCallbackError(stub, func, args) {
        if (stub.callArgAtsLast < 0) {
            var msg;

            if (stub.callArgPropsLast) {
                msg = sinon.functionName(stub) +
                    " expected to yield to '" + stub.callArgPropsLast +
                    "', but no object with such a property was passed."
            } else {
                msg = sinon.functionName(stub) +
                            " expected to yield, but no callback was passed."
            }

            if (args.length > 0) {
                msg += " Received [" + join.call(args, ", ") + "]";
            }

            return msg;
        }

        return "argument at index " + stub.callArgAtsLast + " is not a function: " + func;
    }

    var nextTick = (function () {
        if (typeof process === "object" && typeof process.nextTick === "function") {
            return process.nextTick;
        } else if (typeof setImmediate === "function") {
            return setImmediate;
        } else {
            return function (callback) {
                setTimeout(callback, 0);
            };
        }
    })();

    function callCallback(stub, args) {
        if (stub.callArgAts.length > 0) {
            var func = getCallback(stub, args);

            if (typeof func != "function") {
                throw new TypeError(getCallbackError(stub, func, args));
            }

            var callbackArguments = getChangingValue(stub, "callbackArguments");
            var callbackContext = getChangingValue(stub, "callbackContexts");

            if (stub.callbackAsync) {
                nextTick(function() {
                    func.apply(callbackContext, callbackArguments);
                });
            } else {
                func.apply(callbackContext, callbackArguments);
            }
        }
    }

    var uuid = 0;

    sinon.extend(stub, (function () {
        var slice = Array.prototype.slice, proto;

        function throwsException(error, message) {
            if (typeof error == "string") {
                this.exception = new Error(message || "");
                this.exception.name = error;
            } else if (!error) {
                this.exception = new Error("Error");
            } else {
                this.exception = error;
            }

            return this;
        }

        proto = {
            create: function create() {
                var functionStub = function () {

                    callCallback(functionStub, arguments);

                    if (functionStub.exception) {
                        throw functionStub.exception;
                    } else if (typeof functionStub.returnArgAt == 'number') {
                        return arguments[functionStub.returnArgAt];
                    } else if (functionStub.returnThis) {
                        return this;
                    }
                    return functionStub.returnValue;
                };

                functionStub.id = "stub#" + uuid++;
                var orig = functionStub;
                functionStub = sinon.spy.create(functionStub);
                functionStub.func = orig;

                functionStub.callArgAts = [];
                functionStub.callbackArguments = [];
                functionStub.callbackContexts = [];
                functionStub.callArgProps = [];

                sinon.extend(functionStub, stub);
                functionStub._create = sinon.stub.create;
                functionStub.displayName = "stub";
                functionStub.toString = sinon.functionToString;

                return functionStub;
            },

            resetBehavior: function () {
                var i;

                this.callArgAts = [];
                this.callbackArguments = [];
                this.callbackContexts = [];
                this.callArgProps = [];

                delete this.returnValue;
                delete this.returnArgAt;
                this.returnThis = false;

                if (this.fakes) {
                    for (i = 0; i < this.fakes.length; i++) {
                        this.fakes[i].resetBehavior();
                    }
                }
            },

            returns: function returns(value) {
                this.returnValue = value;

                return this;
            },

            returnsArg: function returnsArg(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.returnArgAt = pos;

                return this;
            },

            returnsThis: function returnsThis() {
                this.returnThis = true;

                return this;
            },

            "throws": throwsException,
            throwsException: throwsException,

            callsArg: function callsArg(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push([]);
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgOn: function callsArgOn(pos, context) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push([]);
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgWith: function callsArgWith(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgOnWith: function callsArgWith(pos, context) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push(slice.call(arguments, 2));
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            yields: function () {
                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 0));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            yieldsOn: function (context) {
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            yieldsTo: function (prop) {
                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(prop);

                return this;
            },

            yieldsToOn: function (prop, context) {
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 2));
                this.callbackContexts.push(context);
                this.callArgProps.push(prop);

                return this;
            }
        };

        // create asynchronous versions of callsArg* and yields* methods
        for (var method in proto) {
            // need to avoid creating anotherasync versions of the newly added async methods
            if (proto.hasOwnProperty(method) &&
                method.match(/^(callsArg|yields|thenYields$)/) &&
                !method.match(/Async/)) {
                proto[method + 'Async'] = (function (syncFnName) {
                    return function () {
                        this.callbackAsync = true;
                        return this[syncFnName].apply(this, arguments);
                    };
                })(method);
            }
        }

        return proto;

    }()));

    sinon.stub = stub;
    
}(sinon));

// source mock.js
/**
 * @depend ../sinon.js
 * @depend stub.js
 */
/*jslint eqeqeq: false, onevar: false, nomen: false*/
/*global module, require, sinon*/
/**
 * Mock functions.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var push = [].push;

    
    function mock(object) {
        if (!object) {
            return sinon.expectation.create("Anonymous mock");
        }

        return mock.create(object);
    }

    sinon.mock = mock;

    sinon.extend(mock, (function () {
        function each(collection, callback) {
            if (!collection) {
                return;
            }

            for (var i = 0, l = collection.length; i < l; i += 1) {
                callback(collection[i]);
            }
        }

        return {
            create: function create(object) {
                if (!object) {
                    throw new TypeError("object is null");
                }

                var mockObject = sinon.extend({}, mock);
                mockObject.object = object;
                delete mockObject.create;

                return mockObject;
            },

            expects: function expects(method) {
                if (!method) {
                    throw new TypeError("method is falsy");
                }

                if (!this.expectations) {
                    this.expectations = {};
                    this.proxies = [];
                }

                if (!this.expectations[method]) {
                    this.expectations[method] = [];
                    var mockObject = this;

                    sinon.wrapMethod(this.object, method, function () {
                        return mockObject.invokeMethod(method, this, arguments);
                    });

                    push.call(this.proxies, method);
                }

                var expectation = sinon.expectation.create(method);
                push.call(this.expectations[method], expectation);

                return expectation;
            },

            restore: function restore() {
                var object = this.object;

                each(this.proxies, function (proxy) {
                    if (typeof object[proxy].restore == "function") {
                        object[proxy].restore();
                    }
                });
            },

            verify: function verify() {
                var expectations = this.expectations || {};
                var messages = [], met = [];

                each(this.proxies, function (proxy) {
                    each(expectations[proxy], function (expectation) {
                        if (!expectation.met()) {
                            push.call(messages, expectation.toString());
                        } else {
                            push.call(met, expectation.toString());
                        }
                    });
                });

                this.restore();

                if (messages.length > 0) {
                    sinon.expectation.fail(messages.concat(met).join("\n"));
                } else {
                    sinon.expectation.pass(messages.concat(met).join("\n"));
                }

                return true;
            },

            invokeMethod: function invokeMethod(method, thisValue, args) {
                var expectations = this.expectations && this.expectations[method];
                var length = expectations && expectations.length || 0, i;

                for (i = 0; i < length; i += 1) {
                    if (!expectations[i].met() &&
                        expectations[i].allowsCall(thisValue, args)) {
                        return expectations[i].apply(thisValue, args);
                    }
                }

                var messages = [], available, exhausted = 0;

                for (i = 0; i < length; i += 1) {
                    if (expectations[i].allowsCall(thisValue, args)) {
                        available = available || expectations[i];
                    } else {
                        exhausted += 1;
                    }
                    push.call(messages, "    " + expectations[i].toString());
                }

                if (exhausted === 0) {
                    return available.apply(thisValue, args);
                }

                messages.unshift("Unexpected call: " + sinon.spyCall.toString.call({
                    proxy: method,
                    args: args
                }));

                sinon.expectation.fail(messages.join("\n"));
            }
        };
    }()));

    var times = sinon.timesInWords;

    sinon.expectation = (function () {
        var slice = Array.prototype.slice;
        var _invoke = sinon.spy.invoke;

        function callCountInWords(callCount) {
            if (callCount == 0) {
                return "never called";
            } else {
                return "called " + times(callCount);
            }
        }

        function expectedCallCountInWords(expectation) {
            var min = expectation.minCalls;
            var max = expectation.maxCalls;

            if (typeof min == "number" && typeof max == "number") {
                var str = times(min);

                if (min != max) {
                    str = "at least " + str + " and at most " + times(max);
                }

                return str;
            }

            if (typeof min == "number") {
                return "at least " + times(min);
            }

            return "at most " + times(max);
        }

        function receivedMinCalls(expectation) {
            var hasMinLimit = typeof expectation.minCalls == "number";
            return !hasMinLimit || expectation.callCount >= expectation.minCalls;
        }

        function receivedMaxCalls(expectation) {
            if (typeof expectation.maxCalls != "number") {
                return false;
            }

            return expectation.callCount == expectation.maxCalls;
        }

        return {
            minCalls: 1,
            maxCalls: 1,

            create: function create(methodName) {
                var expectation = sinon.extend(sinon.stub.create(), sinon.expectation);
                delete expectation.create;
                expectation.method = methodName;

                return expectation;
            },

            invoke: function invoke(func, thisValue, args) {
                this.verifyCallAllowed(thisValue, args);

                return _invoke.apply(this, arguments);
            },

            atLeast: function atLeast(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.maxCalls = null;
                    this.limitsSet = true;
                }

                this.minCalls = num;

                return this;
            },

            atMost: function atMost(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.minCalls = null;
                    this.limitsSet = true;
                }

                this.maxCalls = num;

                return this;
            },

            never: function never() {
                return this.exactly(0);
            },

            once: function once() {
                return this.exactly(1);
            },

            twice: function twice() {
                return this.exactly(2);
            },

            thrice: function thrice() {
                return this.exactly(3);
            },

            exactly: function exactly(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not a number");
                }

                this.atLeast(num);
                return this.atMost(num);
            },

            met: function met() {
                return !this.failed && receivedMinCalls(this);
            },

            verifyCallAllowed: function verifyCallAllowed(thisValue, args) {
                if (receivedMaxCalls(this)) {
                    this.failed = true;
                    sinon.expectation.fail(this.method + " already called " + times(this.maxCalls));
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    sinon.expectation.fail(this.method + " called with " + thisValue + " as thisValue, expected " +
                        this.expectedThis);
                }

                if (!("expectedArguments" in this)) {
                    return;
                }

                if (!args) {
                    sinon.expectation.fail(this.method + " received no arguments, expected " +
                        sinon.format(this.expectedArguments));
                }

                if (args.length < this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too few arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                if (this.expectsExactArgCount &&
                    args.length != this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too many arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", expected " + sinon.format(this.expectedArguments));
                    }
                }
            },

            allowsCall: function allowsCall(thisValue, args) {
                if (this.met() && receivedMaxCalls(this)) {
                    return false;
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    return false;
                }

                if (!("expectedArguments" in this)) {
                    return true;
                }

                args = args || [];

                if (args.length < this.expectedArguments.length) {
                    return false;
                }

                if (this.expectsExactArgCount &&
                    args.length != this.expectedArguments.length) {
                    return false;
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        return false;
                    }
                }

                return true;
            },

            withArgs: function withArgs() {
                this.expectedArguments = slice.call(arguments);
                return this;
            },

            withExactArgs: function withExactArgs() {
                this.withArgs.apply(this, arguments);
                this.expectsExactArgCount = true;
                return this;
            },

            on: function on(thisValue) {
                this.expectedThis = thisValue;
                return this;
            },

            toString: function () {
                var args = (this.expectedArguments || []).slice();

                if (!this.expectsExactArgCount) {
                    push.call(args, "[...]");
                }

                var callStr = sinon.spyCall.toString.call({
                    proxy: this.method || "anonymous mock expectation",
                    args: args
                });

                var message = callStr.replace(", [...", "[, ...") + " " +
                    expectedCallCountInWords(this);

                if (this.met()) {
                    return "Expectation met: " + message;
                }

                return "Expected " + message + " (" +
                    callCountInWords(this.callCount) + ")";
            },

            verify: function verify() {
                if (!this.met()) {
                    sinon.expectation.fail(this.toString());
                } else {
                    sinon.expectation.pass(this.toString());
                }

                return true;
            },

            pass: function(message) {
              sinon.assert.pass(message);
            },
            fail: function (message) {
                var exception = new Error(message);
                exception.name = "ExpectationError";

                throw exception;
            }
        };
    }());

    
    sinon.mock = mock;
    
}(sinon));


