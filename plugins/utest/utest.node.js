
include.js({
	script: 'base/EventEmitter'
})

.done(function(resp){
	
	var __EventEmitter = resp.EventEmitter;

	// source ../src/utils/array.js
	function arr_isArray(array) {
		return !!(array != null && array.length != null && typeof array.splice === 'function');
	}
	
	function arr_isEmpty(array) {
		if (arr_isArray(array) === false)
			return true;
			
		return !array.length;
	}
	
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
		
		// source assert.wrapper.js
		
		
		global.assert = wrapAssertFns(wrapAssert(global.assert));
		
		obj_extend(assert, {
			total: 0,
			failed: 0,
			callbacks: 0,
			timeouts: [],
			
			reset: function(){
				
				this.callbacks = 0;
				this.failed = 0;
				this.total = 0;
				
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
	// source ../src/node/action.js
	(function() {
		
		var TestSuite = global.UTest;
			
		include.exports = {
			process: function(setts, done) {
	
				cfg_prepair(setts);
				
				if (arr_isEmpty(setts.nodeScripts) && arr_isEmpty(setts.domScripts)) {
					cfg_loadConfig(setts);
				}
				
				
				
				var configs = cfg_split(setts);
				
				if (configs.length === 0) {
					done('No scripts to test');
					return;
				}
				
				new RunnerSuite(configs, setts).run(done);
				
			}
		};
		
		
	
		
		// source utils.js
		function cfg_prepair(config) {
				
			var base = config.base;
			if (base) {
				base = new net.URI(net.URI.combine(base, '/'));
				if (base.isRelative()){
					base = io.env.currentDir.combine(base);
				}
			}else{
				base = io.env.currentDir;
			}
			
			config.base = net.URI.combine(base.toDir(), '/');
			config.nodeScripts = [];
			config.domScripts = [];
			
			
			var script = config.script || (config.args && config.args[0]);
			if (script) {
				if (/\.[\w]+$/.test(script) === false) {
					script += '.test';
				}
				
				var uri = new net.URI(base).combine(script),
					file = new io.File(uri);
				if (file.exists() === false) {
					
					if (/\/?test.?\//.test(script) === false) {
						script = net.URI.combine('test/', script);
						file.uri = new net.URI(base).combine(script);
						
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
						if (new io.File(new net.URI(base).combine(script)).exists()) {
							(config.env || (config.env = [])).push(script);
						}	
					}
					
					
				}else{
					console.warn('Defined script not exists - ', config.script || config.args[0]);
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
				path = net.URI.combine(config.base, /test.?[\\\/]?$/.test(config.base) ? 'config.js' : 'test/config.js');
			}
			
			var file = new io.File(path);
			
			if (file.exists() === false) {
				return;
			}
			
			cfg = require(file.uri.toLocalFile());
				
			if (Array.isArray(cfg.env)) {
				var array = (baseConfig.env || []).concat(cfg.env);
				
				baseConfig.env = ruqq.arr.distinct(array);
			}
		
			if (arr_isEmpty(baseConfig.scripts) && cfg.tests) {
				
				var tests = cfg.tests,
					base = baseConfig.base,
					nodeScripts = baseConfig.nodeScripts,
					domScripts = baseConfig.domScripts,
					executor = baseConfig.exec;
					
				cfg_addScript(tests, base, nodeScripts, domScripts, executor);
			}
			
			baseConfig.suites = cfg_parseSuites(cfg.suites, baseConfig.base);
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
			
			
			base = new net.URI(base);
			ruqq.arr.each(resources, function(url){
				
				var uri = new net.URI(url);
				if (uri.isRelative()) {
					uri = base.combine(uri);
				}
				var file = new io.File(uri);
				
				if (file.exists()) {
					io.File.watcher.watch(file, function(){
						console.log(' - file changed - ', file.uri.file);
						callback();
					});
				}
			});
		}
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
				
				base = new net.URI(base);
				
				for (var i = 0, x, imax = scripts.length; i < imax; i++){
					x = new net.URI(scripts[i]);
					
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
				Base: __EventEmitter,
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
					console.log('\nTest: ', (url.length > 23 ? '...' + url.substr(-20) : url).bold);
				},
				onComplete: function(stats) {
					this.status = status_ready;
		
					function count(key) {
						return ruqq.arr.aggr(stats, 0, function(x, aggr) {
							if (x.error) {
								console.log(x.error);
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
						browsers = stats.length;
		
					if (total === 0) {
						console.error('No assertions');
						failed++;
					}
					
					if (callbacks !== 0 || timeouts !== 0) {
						!failed && failed++;
					}
		
					console.log('\nDone. ' [failed ? 'red' : 'green'].bold);
					
					
					console.log('bold{Assertions}: bold{green{%1}}(bold{red{%2}})'
									.format(total - failed, failed)
									.colorize());
					
					console.log('bold{Timeouts}: bold{%1{%2}}'
									.format(timeouts ? 'red' : 'green', timeouts)
									.colorize());
					
					console.log('bold{Failed Callbacks}: bold{green{%1}}'.format(callbacks).colorize());
		
					this.failed = failed;
					this.stats = stats;
					
					this.trigger('complete', this)
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
						console.error('Unknown exception - ', data);
						return;
					}
					
					data = assert.resolveData(data, this.config.base);
					
					console.log('\n');
					
					if (data.file && data.line != null) {
						
						var path = data.file.replace(/(\/)?utest\//i, '$1'),
							uri = new net.URI(this.config.base).combine(path),
							source = new io.File(uri).read().split(/\r\n|\r|\n/g),
							line = source[data.line - 1],
							code = line && line.trim();
						
						if ('actual' in data || 'expected' in data) {
							var msg = 'bold{yellow{%1}} bold{red{<=>}} bold{yellow{%2}}',
								actual = typeof data.actual === 'object'
											? JSON.stringify(data.actual)
											: data.actual,
											
								expected = typeof data.expected === 'object'
											? JSON.stringify(data.expected)
											: data.expected;
											
							console.log(msg
											.colorize()
											.format(actual, expected));
						}
						
						console.log('bold{%1}:%2'.colorize().format(data.file, data.line + 1));
						console.log('  bold{cyan{ >> }} bold{red{ %1 }}'.colorize().format(code));
						return;
					}
						
					
					console.error(data.message);
					console.error(data.stack);
					
				},
				
				onSuccess: function(){
					util.print(' |'.green.bold);
				}
			});
		
			
		}());
		// source RunnerClient.js
		var RunnerClient = Class({
			Base: Runner,
			Construct: function(){
				
			},
			run: function(done) {
				
				this.run = this.runTests;
				
				var that = this,
					confit = this.config,
					port = config.port || 5777,
					util = require('util'),
					io_client = require('socket.io-client'),
					io_url = 'http://localhost:%1/node'.format(port),
					socket = io_client.connect(io_url, {
						'connect timeout': 2000
					});
		
				this.socket = socket;
				this.status = status_connecting;
		
				socket
					.on('connect', function() {
					Log('utest - connected to server - ', 90);
		
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
					var fn = console[type] || console.log;
		
					fn.apply(console, args);
				})
		
				.on('slave:start', function(stats) {
					var message = '\n#{browser.name} #{browser.version}'.bold;
					console.log(message.format(stats.userAgent));
					console.log('');
				})
				.on('slave:end', function(stats) {
					console.log('\nSlave completed'[stats.failed ? 'red' : 'green']);
				})
		
				.on('slave:error', function(error) {
					console.error(error);
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
				console.log(' -  running tests  -  ', Date.format(new Date(), 'HH:mm:ss'));
				
				switch (this.status) {
					case status_blank:
					case status_connected:
					case status_ready:
						this.status = status_testing;
						this.socket.emit('client:utest', this.suites);
						return;
				}
				console.warn('Server is not ready');
			}
		});
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
			
			function suite_loadEnv(suite, callback) {
				var base = suite.base,
					env = suite.env;
					
				if (env == null) {
					callback();
					return;
				}
				if (Array.isArray(env) === false) {
					console.warn('"env" property should be an array of strings', env);
					callback();
					return;
				}
				
				var resource = include.instance();
				
				base = new net.URI(base);
				ruqq.arr.each(env, function(x){
					var	parts = x.split('::'),
						src = parts[0],
						alias = parts[1],
						file = new io.File(base.combine(src));
					if (file.exists() === false) {
						console.log('Resource from Env - 404 -', x);
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
				
				suite_loadEnv(_suite, callback);
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
						console.warn('Node is busy ... ', this.status);
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
					this.resources = [];
				},
		
				getResources: function() {
					return ruqq.arr.aggr(this.resources, [], resource_aggrIncludes);
				}
			});
		
		}());
		
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
				
				Log('RunnerSuite:', JSON.stringify(configs), settings, 90);
				
				Class.bind(this, 'onComplete', 'process', 'runTests');
			},
			
			onComplete: function(){
				
				if (this.watch !== true) {
					
					this.closeSockets();
					process.exit(this.getFailed());
					
				}
				
				watch(this.base, this.getResources(), this.runTests);
				console.log(' - watcher active'.yellow);
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
					console.log('WWWWAAATCH')
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
		
			
			
	}());

});
