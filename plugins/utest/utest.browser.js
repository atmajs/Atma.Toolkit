
// source ../.reference/libjs/class/lib/class.js
(function(global) {

	var helper = {
		each: function(arr, fn) {
			if (arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					fn(arr[i]);
				}
				return;
			}
			fn(arr);
		},
		extendProto: function(proto, x) {
			var prototype;
			if (x == null) {
				return;
			}
			switch (typeof x) {
			case 'function':
				prototype = x.prototype;
				break;
			case 'object':
				prototype = x;
				break;
			default:
				return;
			}
			for (var key in prototype) {
				proto[key] = prototype[key];
			}
		},

		extendClass: function(_class, _base, _extends, original) {

			if (typeof original !== 'object') {
				return;
			}

			this.extendPrototype = original['__proto__'] == null ? this.protoLess : this.proto;
			this.extendPrototype(_class, _base, _extends, original);
		},
		proto: function(_class, _base, _extends, original) {
			var prototype = original,
				proto = original;

			prototype.constructor = _class.prototype.constructor;

			if (_extends != null) {
				proto['__proto__'] = {};

				helper.each(_extends, function(x) {
					helper.extendProto(proto['__proto__'], x);
				});
				proto = proto['__proto__'];
			}

			if (_base != null) {
				proto['__proto__'] = _base.prototype;
			}

			_class.prototype = prototype;
		},
		/** browser that doesnt support __proto__ */
		protoLess: function(_class, _base, _extends, original) {

			if (_base != null) {
				var proto = {},
					tmp = function() {};

				tmp.prototype = _base.prototype;

				_class.prototype = new tmp();
				_class.prototype.constructor = _class;
			}

			helper.extendProto(_class.prototype, original);


			if (_extends != null) {
				helper.each(_extends, function(x) {
					var a = {};
					helper.extendProto(a, x);
					delete a.constructor;
					for (var key in a) {
						_class.prototype[key] = a[key];
					}
				});
			}
		}
	};

	var Class = function(data) {
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null,
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
		if (_construct != null) {
			delete data.Construct;
		}


		if (_base == null && _extends == null) {
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


		helper.extendClass(_class, _base, _extends, data);


		data = null;
		_static = null;

		return _class;
	};

	/**
	 * Can be used in Constructor for binding class's functions to class's context
	 * for using, for example, as callbacks
	 */
	Class.bind = function(cntx) {
		var arr = arguments,
			i = 1,
			length = arguments.length,
			key;

		for (;i < length; i++) {
			key = arr[i];
			cntx[key] = cntx[key].bind(cntx);
		}
		return cntx;
	}


	global.Class = Class;


}(typeof window === 'undefined' ? global : window));
// source ../src/UTest.js
(function(global){
	
	var _tests = [],
		_index = -1,
		_listeners = {},
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
	
	function runCase(fn, done, teardown) {
		try {
				
			if (typeof fn === 'function') {
				if (case_isAsync(fn)) {
					fn(teardownDelegate(teardown, done));
					return;
				}
				
				fn();
			}
			teardownDelegate(teardown, done)();	
		
		} catch(error){
			
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
			this.onComplete = callback;
			
			runCase(this.suite.before, this.nextCase);
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
				
				if (typeof this.suite[key] !== 'function') {
					continue;
				}
				
				this.processed.push(key);
				runCase(this.suite[key], this.nextCase, this.suite.teardown);
				
				return;
			}
			
			var that = this;
			runCase(this.suite.after, function(){
				UTest.trigger('complete', that);
				
				that.onComplete();
			});
		},
		
		Static: {
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
			}
		}
	});
	
	global.UTest = UTest;
	
	
}(typeof window === 'undefined' ? global : window));



// source ../src/assert/assert.browser.js
(function(){
	
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
	
	
	var total = 0,
		failed = 0;
	
	Object.defineProperty(assert, 'total', {
		get: function(){
			return total;
		},
		set: function(x){
			total = x;
		}
	});
	Object.defineProperty(assert, 'failed', {
		get: function(){
			return failed;
		},
		set: function(x){
			failed = x;
		}
	});


	for (var key in assert) {
		if (typeof assert[key] !== 'function') {
			continue;
		}
		
		if (key[0].toLowerCase() !== key[0]){
			// Class Function Definition
			continue;
		}
		
		assert[key] = wrapp(assert, key);
	}
	
	
	function wrapp(assert, key) {
		var original = assert[key],
			message;
		
		return function(){
			total++;
			
			try {
				original.apply(this, arguments);
			} catch(e) {
				failed++;
				
				message = [];
				if (e.actual) {
					// assert.js exception
					message.push('Actual: ' + e.actual);
					message.push('Expected: ' + e.expected);
					message.push('Stack: ' + e.stack);
				}else{
					message.push('Message: ' + e.toString());
					message.push('Stack: ' + e.stack);
				}
				
				assert.onfailure && assert.onfailure(message.join('\n'));
				return;
			}
			
			assert.onsuccess && assert.onsuccess();
		};
	}
	
}());
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
		lines.push('File: ' + message + ':' + lineNumber);
		console.error(lines.join('\n'));
	};
	

	var TestSuite = window.UTest,
		state_ready = 1,
		state_busy = 2,
		state = state_ready,
		socket = io.connect('/browser')
			.on('server:utest:handshake', function(done) {
				done({
					userAgent: window.browserInfo,
					ready:state
				});
			})
			.on('server:utest', utest_start);


	// source utils/logger.js
	(function() {
	
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
	
				Array.prototype.slice.call(arguments);
				socket.emit('browser:log', key, args);
	
				return original.apply(console, arguments);
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
	
		var resources = include.getResources();
		for (var key in resources) {
			resources[key] = {};
		}
	
		include = include.instance();
	};


	function utest_start(config) {
		
		if (!config || !config.scripts) {
			socket.emit('browser:utest:end', {
				error: 'No scripts to be tested'
			});
			return;
		}
		state = state_busy;
		assert.total = 0;
		assert.failed = 0;
		TestSuite.clear();

		include_clearCache();
		
		socket.emit('browser:utest:start', {
			userAgent: window.browserInfo
		});


		for (var i = 0, imax = config.scripts.length; i < imax; i++) {
			script_insert({
				path: config.scripts[i]
			}, i == imax - 1 ? utest_end : null);
		}
	}

	function utest_end(force) {
		if (force !== true && typeof include !== 'undefined') {
			
			include_ready(function(){
				utest_end(true);
			});
			return;
		}
		
		// findout resources for watcher
		// do this here, as TestSuites could also add/remove scripts
		var resources = script_getResources();
		
		TestSuite.run(function(){
			socket.emit('browser:utest:end', {
				total: assert.total,
				failed: assert.failed,
				userAgent: window.browserInfo,
				resources: resources
			});
			
			state = state_ready;
		});
	}

	
}());

