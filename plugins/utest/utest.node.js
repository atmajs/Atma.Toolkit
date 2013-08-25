
(function(){
	
	// source ../src/utils/array.js
	function arr_isArray(array) {
		return !!(array != null && array.length != null && typeof array.splice === 'function');
	}
	
	function arr_isEmpty(array) {
		if (arr_isArray(array) === false)
			return true;
			
		return !array.length;
	}
	// end:source ../src/utils/array.js
	
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
	
	
	
	// end:source ../src/UTest.js
	// source ../src/assert/assert.node.js
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
		
		// end:source assert.js
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
		
		// end:source assert.wrapper.js
		
		var util = require('util');
		
		
		assert.resolveData = function(stackData, base){
			
			var data = Object.extend({}, stackData),
				stack = stackData.stack.split('\n').splice(2, 6),
				rgx_http = /http:\/\/([^\/]+)\//,
				rgx_local = RegExp.fromString(base.replace('file:///','')),
				rgx_file = /([^\(]+\:\d+\:\d+)\)?$/;
			
			
			stack = ruqq.arr.map(stack, function(x){
				return x
						.replace(rgx_http, '')
						.replace(rgx_local, '')
						.replace('at ', '');
			});
			
			var file = rgx_file.exec(stack[0].trim());
			if (file) {
				var parts = file[1].split(':');
				
				data.file = parts[0];
				data.line = parts[1] << 0;
				data.col = parts[2] << 0;
			}else{
				console.warn('Filepath could not be parsed from', stack[0].trim());
			}
			
			
			
			
			data.stack = stack.join('\n');
			
			return data;
		};
		
	}(this));
	// end:source ../src/assert/assert.node.js
	// source ../src/node/action.js
	(function() {
		
		var TestSuite = global.UTest;
			
		include.exports = {
			process: function(setts, done) {
	
				var arg = setts.script || app.config.cli.args[1],
					config;
			
				cfg_prepair(setts, arg);
				
				config = cfg_loadConfig(setts);
				
				cfg_getEnv(setts, config);
				
				if (cfg_hasScripts(setts) === false) {
					cfg_getScripts(setts, config);
					
					
					if (arg && !(config.suites && config.suites[arg])) 
						return done('Argument is not resolved as script, nor as suite name: ' + arg);
					
					
					if (arg) {
						var suites = config.suites;
						for (var key in suites) {
							if (key !== arg)
								delete suites[key];
						}
						
						setts.suites = cfg_parseSuites(suites, setts.base);
					}
				}
				
				
				var configs = cfg_split(setts);
				
				if (configs.length === 0) 
					return done('No scripts to test');
				
				
				return new RunnerSuite(configs, setts).run(function(){
					logger.log('>> done', arguments);
					done.apply(this, arguments);
				});
			}
		};
		
		
	
		
		// source utils/cfg.js
		function cfg_prepair(config, arg) {
				
			var base = config.base;
			if (base) {
				base = new net.Uri(net.Uri.combine(base, '/'));
				if (base.isRelative()){
					base = io.env.currentDir.combine(base);
				}
			}else{
				base = io.env.currentDir;
			}
			
			config.base = net.Uri.combine(base.toDir(), '/');
			config.nodeScripts = [];
			config.domScripts = [];
			
			
			var script = arg;
			if (script) {
				if (/\.[\w]+$/.test(script) === false) {
					script += '.test';
				}
				
				var uri = new net.Uri(base).combine(script),
					file = new io.File(uri);
				if (file.exists() === false) {
					
					if (/\/?test.?\//.test(script) === false) {
						script = net.Uri.combine('test/', script);
						file.uri = new net.Uri(base).combine(script);
						
						if (file.exists() === false) 
							script = null;
						
					}else{
						script = null;
					}
					
				}
				
				if (script) {
					
					var nodeScripts = config.nodeScripts,
						domScripts = config.domScripts,
						executor = null;
						
					if (config.browser)
						executor = 'dom';
					
					if (config.node)
						executor = 'node';
						
					
					cfg_addScript(script, config.base, nodeScripts, domScripts, executor);
					
					var ext = /\.\w{1,5}$/.exec(script)
					if (ext && ext[0] === '.test') {
						script = script.replace(/\.\w{1,5}$/, '.js');
						if (new io.File(new net.Uri(base).combine(script)).exists()) {
							(config.env || (config.env = [])).push(script);
						}	
					}
					
					
				}
			}
			
		}
		
		
		/**
		 * base: [String]
		 * env: [String]
		 * tests: String | [String]
		 */
		function cfg_loadConfig(baseConfig) {
			
			var path = baseConfig.config;
				
			if (path == null) {
				path = /test.?[\\\/]?$/.test(baseConfig.base)
					? 'config.js'
					: 'test/config.js';
					
				path = net.Uri.combine(baseConfig.base, path);
			}
			
			var file = new io.File(path);
			
			if (file.exists() === false) 
				return {};
			
			
			return require(file.uri.toLocalFile());
		}
		
		function cfg_getEnv(baseConfig, config) {
			
			if (typeof config.env === 'string')
				config.env = [config.env];
			
			if (baseConfig.env == null)
				baseConfig.env = [];
			
			if (Array.isArray(config.env)) 
				baseConfig.env = ruqq.arr.distinct(baseConfig.env.concat(config.env));
		}
		
		function cfg_getScripts(baseConfig, config) {
			
			if (config.tests) {
				
				var tests = config.tests,
					base = baseConfig.base,
					nodeScripts = baseConfig.nodeScripts,
					domScripts = baseConfig.domScripts,
					executor = baseConfig.exec;
					
				cfg_addScript(tests, base, nodeScripts, domScripts, executor);
			}
			
			baseConfig.suites = cfg_parseSuites(config.suites, baseConfig.base);
		}
		
		function cfg_hasScripts(config) {
			if (!config)
				return false;
			
			if (arr_isEmpty(config.nodeScripts) === false)
				return true;
			
			if (arr_isEmpty(config.domScripts) === false)
				return true;
			
			
			return false;
		}
		
		function cfg_parseSuites(suites, base) {
			var array = [],
				key, x, config;
			
			for (key in suites) {
				x = suites[key];
				
				config = {
					base: x.base || base,
					exec: x.exec,
					env: x.env,
					nodeScripts: [],
					domScripts: []
				};
				
				
				cfg_addScript(x.tests, config.base, config.nodeScripts, config.domScripts, config.exec);
				
				
				array.push(config);
			}
			return array;
		}
		
		function cfg_addScript(path, base, nodeScripts, domScripts, executor, forceAsPath) {
			
			if (Array.isArray(path)) {
				ruqq.arr.each(path, function(x){
					cfg_addScript(x, base, nodeScripts, domScripts, executor, forceAsPath);
				});
				return;
			}
			
			if (forceAsPath !== true && ~path.indexOf('*')) {
				// asPath here is actually to prevent recursion in case if
				// file, which is resolved by globbing, contains '*'
				new io.Directory(base).readFiles(path).files.forEach(function(file){
					path = file.uri.toRelativeString(base);
					
					cfg_addScript(path, base, nodeScripts, domScripts, executor, true);
				});
				return;
			}
			
			if (executor == null)
				executor = path_isForBrowser(path) ? 'dom' : 'node';
			
			
			if ('dom' === executor)
				domScripts.push(path);
				
			if ('node' === executor)
				nodeScripts.push(path);
		}
		
		function path_isForNode(path) {
			return /\-node\.[\w]+$/.test(path) || /\/node\//.test(path);
		}
		function path_isForBrowser(path) {
			return /\-dom\.[\w]+$/.test(path) || /\/dom\//.test(path);
		}
		
		
		function cfg_split(config) {
			// split config per executor
			var configs = [];
			if (!arr_isEmpty(config.domScripts) && !config.node) {
				configs.push({
					exec: 'browser',
					env: config.env,
					scripts: config.domScripts,
					base: config.base,
				});
			}
			
			if (!arr_isEmpty(config.nodeScripts) && !config.browser) {
				configs.push({
					exec: 'node',
					env: config.env,
					scripts: config.nodeScripts,
					base: config.base,
				});
			}
			
			if (config.suites) {
				
				ruqq.arr.each(config.suites, function(suite){
					configs = configs.concat(cfg_split(suite));
				});
				
			}
			
			
			
			return configs;
		}
		
		
			
		function watch(base, resources, callback) {
			watch = function(){};
			
			
			base = new net.Uri(base);
			ruqq.arr.each(resources, function(url){
				
				var uri = new net.Uri(url);
				if (uri.isRelative()) {
					uri = base.combine(uri);
				}
				var file = new io.File(uri);
				
				if (file.exists()) {
					io.File.watcher.watch(file, function(){
						console.log(' - file changed - ', file.uri.file);
						io.File.clearCache(file.uri.toLocalFile());
						callback();
					});
				}
			});
		}
		// end:source utils/cfg.js
		// source utils/logger.js
		(function(){
			
			var util = require('util');
			
			console.print = function(){
				var message = Array.prototype.slice.call(arguments).join(' ');
				
				util.print(message);
			};
			
		}());
		// end:source utils/logger.js
		
		// source Runner.js
		var status_blank = 1,
			status_connecting = 2,
			status_connected = 3,
			status_prepair = 4;
			status_testing = 5,
			status_ready = 6,
			util = require('util');
			
		
		var Runner = (function() {
		
			
			function utest_resolveFiles(config) {
				var files = [];
				
				if (arr_isArray(config)) {
					for (var i = 0, x, imax = config.length; i < imax; i++){
						x = config[i];
						
						files = files.concat(utest_resolveFiles(x));
					}
					return files;
				}
				
				var scripts = config.scripts,
					base = config.base;
				
				base = new net.Uri(base);
				
				for (var i = 0, x, imax = scripts.length; i < imax; i++){
					x = new net.Uri(scripts[i]);
					
					if (x.isRelative()) {
						x = base.combine(x);
					}
					
					x = new io.File(x);
					
					if (x.exists() === false) {
						console.error('File - 404 - ', x.uri.toLocalFile());
						continue;
					}
					files.push(x);
				}
				return files;
			}
			
		
			return Class({
				Base: Class.EventEmitter,
				Construct: function(config) {
					this.config = config;
					this.status = status_blank;
					this.files = utest_resolveFiles(config);
					
					this.suites = arr_isArray(config) ? config : [config];
					
					ruqq.arr.each(this.suites, function(x){
						x.files = utest_resolveFiles(x);
					});
				},
				notifyTest: function(url){
					logger.log('Test: ', (url.length > 23 ? '...' + url.substr(-20) : url).bold);
				},
				onComplete: function(stats) {
					this.status = status_ready;
		
					function count(key) {
						return ruqq.arr.aggr(stats, 0, function(x, aggr) {
							if (x.error) {
								logger.error(x.error);
								return 0;
							}
							
							if (x[key] == null) {
								return aggr;
							}
							
							if (typeof x[key] === 'object' && 'length' in x[key]) {
								return x[key].length + aggr;
							}
							
							return x[key] + aggr;
						});
					}
		
					var total = count('total'),
						failed = count('failed'),
						timeouts = count('timeouts'),
						callbacks = count('callbacks'),
						errors = count('errors'),
						browsers = stats.length;
		
					if (total === 0) {
						console.error('No assertions');
						failed++;
					}
					
					if (errors > 0) {
						failed++;
					}
					
					if (callbacks !== 0 || timeouts !== 0) {
						!failed && failed++;
					}
					
		
					logger.log('\nDone. '[failed ? 'red' : 'green'].bold);
					
					
					logger.log(
						'bold<Assertions>: bold<green<%1>>(bold<red<%2>>)'
							.format(total - failed, failed)
							.color);
					
					logger.log(
						'bold<Timeouts>: bold<%1<%2>>'
							.format(timeouts ? 'red' : 'green', timeouts)
							.color);
					
					logger.log(
						'bold<Failed Callbacks>: bold<green<%1>>'
							.format(callbacks)
							.color);
		
					this.failed = failed;
					this.stats = stats;
					
					this.trigger('complete', this);
					
				},
				
				getResources: function(){
					if (this.stats == null) 
						return [];
					
					
					var resources = this.stats.resources || (this.stats[0] && this.stats[0].resources);
		
					if (resources == null && this.getResources) 
						resources = this.getResources();
						
					return resources || [];
				},
				
				// assertion events
				
				onFailure: function(data){
					if (!data.stack) {
						logger.error('Unknown exception - ', data);
						return;
					}
					
					data = assert.resolveData(data, this.config.base);
					
					logger.log('');
					
					if (data.file && data.line != null) {
						
						var path = data.file.replace(/(\/)?utest\//i, '$1'),
							uri = new net.Uri(this.config.base).combine(path),
							source = new io.File(uri).read().split(/\r\n|\r|\n/g),
							line = source[data.line - 1],
							code = line && line.trim();
						
						if ('actual' in data || 'expected' in data) {
							var msg = '%s bold<red<↔>> %s';
								//actual = typeof data.actual === 'object'
								//			? JSON.stringify(data.actual)
								//			: data.actual,
								//			
								//expected = typeof data.expected === 'object'
								//			? JSON.stringify(data.expected)
								//			: data.expected;
											
							logger.log(msg.color, data.actual, data.expected);
						}
						
						logger
							.log('  bold<%1>:%2'.color.format(data.file, data.line + 1))
							.log('  bold<cyan< → >> bold<red< %1 >>'.color.format(code));
						return;
					}
						
					
					logger
						.error(data.message)
						.error(data.stack);
					
				},
				
				onSuccess: function(){
					util.print(' |'.green.bold);
				}
			});
		
			
		}());
		// end:source Runner.js
		// source RunnerClient.js
		var RunnerClient = Class({
			Base: Runner,
			Construct: function(){
				
			},
			run: function(done) {
				
				this.run = this.runTests;
				
				//@ HACKY - io client workaround
				var _io = global.io;
				delete global.io;
				
				var that = this,
					config = this.config,
					port = config.port || 5777,
					util = require('util'),
					io_client = require('socket.io-client'),
					io_url = 'http://localhost:%1/node'.format(port),
					socket = io_client.connect(io_url, {
						'connect timeout': 2000
					});
		
				global.io = _io;
					
				this.socket = socket;
				this.status = status_connecting;
		
				socket
					.on('connect', function() {
					logger(90).log('utest - connected to server - ');
		
					that.status = status_connected;
					that.runTests();
				})
		
				.on('error', function() {
					var msg = 'Test server connection error - http://localhost:%1/utest';
					done(msg.format(port));
				})
		
				.on('server:utest:end', function(){
					that.onComplete.apply(that, arguments);
				})
		
				.on('server:error', function(message) {
					that.socket.socket.disconnectSync();
					done(message);
				})
		
				.on('server:log', function(type, args) {
					var fn = logger[type] || logger.log;
					fn.apply(logger, args);
				})
		
				.on('slave:start', function(stats) {
					var message = '#{browser.name} #{browser.version}'.bold;
					logger
						.log(message.format(stats.userAgent))
						.log('');
				})
				.on('slave:end', function(stats) {
					logger.log('Slave completed'[stats.failed ? 'red' : 'green']);
				})
		
				.on('slave:error', function(error) {
					logger.error(error);
				})
				
				.on('slave:utest:script', function(info){
					that.notifyTest(info.script);
				})
		
				.on('slave:assert:failure', function(args) {
					var data = args[0];
					
					that.onFailure(data);
					
				})
		
				.on('slave:assert:success', that.onSuccess.bind(that));
			},
		
			runTests: function() {
				logger.log(' -  running tests  -  ', Date.format(new Date(), 'HH:mm:ss'));
				
				switch (this.status) {
					case status_blank:
					case status_connected:
					case status_ready:
						this.status = status_testing;
						this.socket.emit('client:utest', this.suites);
						return;
				}
				logger.warn('Server is not ready');
			}
		});
		// end:source RunnerClient.js
		// source RunnerNode.js
		var RunnerNode = (function() {
		
			function resource_clear(resource) {
				
				var bin = include.getResources();
				
				
				for (var type in bin) {
					for(var key in bin[type]){
						if (bin[type][key] === resource){
							delete bin[type][key];
							break;
						}
					}
				}
				
				if (resource.includes) {
					ruqq.arr.each(resource.includes, function(data){
						resource_clear(data.resource);
					});
				}
			}
			
			function resource_aggrIncludes(resource, aggr) {
				if (resource.url && aggr.indexOf(resource.url) === -1) {
					aggr.push(resource.url);
				}
				if (resource.includes) {
					ruqq.arr.each(resource.includes, function(data){
						resource_aggrIncludes(data.resource, aggr);
					});
				}
			}
			
			function suite_loadEnv(runner, suite, callback) {
				var base = suite.base,
					env = suite.env;
				
				if (env == null) {
					callback();
					return;
				}
				if (Array.isArray(env) === false) {
					logger.warn('"env" property should be an array of strings', env);
					callback();
					return;
				}
				
				var resource = include.instance();
				
				base = new net.Uri(base);
				ruqq.arr.each(env, function(x){
					var	parts = x.split('::'),
						src = parts[0],
						alias = parts[1],
						file = new io.File(base.combine(src));
					if (file.exists() === false) {
						logger.warn('Resource from Env - 404 -', x);
						return;
					}
					
					var path = file.uri.toString();
					if (alias) {
						path += '::' + alias;
					}
					
					resource.inject(path);
				});
				
				resource.done(function(resp){
					setTimeout(function(){
						for (var lib in resp) {
							global[lib] = resp[lib];
						}
						
						callback(resp);
					});
				});
				
				_runner.envResource = resource;
			}
			
			var _suites = null,
				_suite = null,
				_suiteIndex = -1,
				
				_runner = null;
				
				
			function suite_next(callback) {
				_suite = _suites[++_suiteIndex];
				
				if (_suite == null){
					
					_runner.onComplete(_runner.stats);
					return;
				}
				
				_runner.files = _suite.files;
				_runner.config = _suite;
				
				suite_loadEnv(_runner, _suite, callback);
			}
		
			return Class({
				Base: Runner,
				Construct: function() {
					assert.onsuccess = this.onSuccess.bind(this);
					assert.onfailure = this.onFailure.bind(this);
					
					Class.bind(this, 'singleComplete', 'runTests', 'process');
					
					_runner = this;
				},
				run: function() {
					if (status_ready !== this.status && status_blank !== this.status) {
						logger.warn('Node is busy ... ', this.status);
						return;
					}
					this.status = status_prepair;
					this.runTests();
				},
				
				
				runTests: function() {
					
					this.index = -1;
					this.status = status_testing;
					this.stats = [];
					this.clearResources();
					
					_suites = this.suites;
					_suiteIndex = -1;
					
					suite_next(this.process);
				},
		
				singleComplete: function() {
					this.stats.push({
						url: this.files[this.index].uri.toString(),
						total: assert.total,
						failed: assert.failed,
						timeouts: assert.timeouts,
						errors: assert.errors,
						callbacks: assert.callbacks,
					});
		
					this.process();
				},
				process: function() {
					if (++this.index > this.files.length - 1) {
						this.index = -1;
						suite_next(this.process);
						return;
					}
					
					assert.reset();
					TestSuite.clear();
		
					var that = this,
						url = this.files[this.index].uri.toString();
		
					
					this.notifyTest(url);
		
					var incl = include
						.cfg('path', _suite.base)
						.instance(url)
						.js(url)
						.done(function(resp) {
						
						process.nextTick(function() {
							TestSuite.run(that.singleComplete);
						});
					});
		
					this.resources.push(incl);
				},
		
				clearResources: function() {
					this.resources && ruqq.arr.each(this.resources, resource_clear);
					this.envResource && resource_clear(this.envResource);
					
					this.resources = [];
					this.envResource = null;
				},
		
				getResources: function() {
					this.envResource && this.resources.push(this.envResource);
					
					return ruqq.arr.aggr(this.resources, [], resource_aggrIncludes);
				}
			});
		
		}());
		// end:source RunnerNode.js
		
		// source Suite.js
		var RunnerSuite = Class({
			Construct: function(configs, settings) {
				
				/**
				 *	this.watch
				 *	this.base
				 */
				this.handleConfig(configs);
		
				this.base = settings.base;
				this.watch = settings.watch;
				
				logger(90).log('RunnerSuite:', configs, settings);
				
				Class.bind(this, 'onComplete', 'process', 'runTests');
			},
			
			onComplete: function(){
				
				if (this.watch !== true) {
					
					this.closeSockets();
					
					var failed = this.getFailed();
					
					logger
						.log('')
						.log(failed === 0 ? 'Success'.green.bold : 'Failed'.red.bold);
					
					process.exit(failed);
					
				}
				
				watch(this.base, this.getResources(), this.runTests);
				logger.log(' - watcher active'.yellow);
			},
			
			closeSockets: function(){
				ruqq.arr.each(this.runners, function(x){
					x.socket && x.socket.socket && x.socket.socket.disconnectSync();
				});
			},
			
			getFailed: function(){
				return ruqq.arr.aggr(this.runners, 0, function(x, aggr) {
					return aggr + x.failed;
				});
			},
			
			getResources: function(){
				return ruqq.arr.aggr(this.runners, [], function(x, aggr) {
					return aggr.concat(x.getResources());
				});
			},
			
			process: function(){
				var runner = this.runners[++this.index];
				
				if (runner == null) {
					this.onComplete();
					return;
				}
				runner.run(this.callback);
			},
			
			run: function(done){
				this.callback = done;
				this.runners = [];
				
				
				if (this.cfgBrowser) 
					this.runners.push(new RunnerClient(this.cfgBrowser));
				
				if (this.cfgNode)
					this.runners.push(new RunnerNode(this.cfgNode));
					
				this.runners.forEach(function(runner){
					runner.on('complete', this.process);
				}, this);
				
				this.runTests();
			},
			
			runTests: function(){
				this.index = -1;
				this.process();
			},
			
			handleConfig: function(mix) {
				if (Array.isArray(mix)) {
					for (var i = 0, imax = mix.length; i < imax; i++) {
						this.handleSingle(mix[i]);
					}
					return;
				}
				this.handleSingle(mix);
			},
			handleSingle: function(config) {
				
				if (this.base == null && config.base) {
					this.base = config;
				}
				
				if (this.watch == null && config.watch) {
					this.watch = config.watch;
				}
		
				if (config.exec === 'browser') {
					cfg_add(this, 'cfgBrowser', config);
					return;
				}
		
				cfg_add(this, 'cfgNode', config);
			}
		});
		
		function cfg_add(that, prop, value) {
			if (that[prop] == null) {
				that[prop] = value;
				return;
			}
			if (Array.isArray(that[prop])) {
				that[prop].push(value);
				return;
			}
		
			that[prop] = [that[prop], value];
		}
		// end:source Suite.js
		
			
			
	}());
	// end:source ../src/node/action.js

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

// end:source ../vendor/sinon.js