
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



// source ../src/assert/assert.node.js
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
		failed = 0,
		util = require('util');
	
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
		var original = assert[key];
		
		return function(){
			total++;
			
			try {
				original.apply(this, arguments);
			} catch(e) {
				failed++;
				console.error('Actual: %1 \nExpected: %2 \nStack: %3'.format(e.actual, e.expected, e.stack));
				return;
			}
			
			util.print(' |'.green.bold);
		};
	}
}());
// source ../src/node/action.js
(function() {
	
	var TestSuite = global.UTest;
		
	include.exports = {
		process: function(config, done) {

			config = prepairConfig(config);
			
			if (!(config.scripts && config.scripts.length)) {
				done('No scripts to test');
				return;
			}
			
			
			var Runner = config.browser ? RunnerClient : RunnerNode;
			
			new Runner(config).run(done);
		}
	};
	
	

	
	// source utils.js
	function prepairConfig(config) {
			
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
		
			
		if (config.args && !config.script) {
			config.script = config.args[0];
		}
		
		if (config.scripts == null && config.script) {
			config.scripts = [config.script];
		}
		
		
		return config;
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
				io.File.watcher.watch(file, callback);
			}
		});
	}
	// source Runner.js
	var status_blank = 1,
		status_connecting = 2,
		status_connected = 3,
		status_testing = 4,
		status_ready = 5;
	
	var Runner = (function() {
	
		
		function utest_resolveFiles(base, scripts) {
			var files = [];
			
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
			Construct: function(config) {
				this.config = config;
				this.status = status_blank;
				this.files = utest_resolveFiles(config.base, config.scripts);
			},
			onComplete: function(stats) {
				this.status = status_ready;
	
				function count(key) {
					return ruqq.arr.aggr(stats, 0, function(x, aggr) {
						if (x.error) {
							console.log(x.error);
							return 0;
						}
						
						return x[key] + aggr;
					});
				}
	
				var total = count('total'),
					failed = count('failed'),
					browsers = stats.length;
	
				if (total === 0) {
					console.error('No assertions');
					failed++;
				}
	
				console.log('\nDone. ' [failed ? 'red' : 'green'].bold);
				console.log('%1/%2'.format(total, failed)
					.green);
	
				if (config.watch == null) {
					process.exit(failed);
					return;
				}
	
				var resources = stats.resources || (stats[0] && stats[0].resources);
	
				if (resources == null && this.getResources) {
					resources = this.getResources();
				}
	
				watch(this.config.base, resources, this.runTests.bind(this));
				console.log(' - watcher active'.red);
			}
		});
	
		
	}());
	// source RunnerClient.js
	var RunnerClient = Class({
		Base: Runner,
		run: function(done) {
	
			var that = this,
				config = this.config,
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
				done(
					'Test server connection error - http://localhost:%1/test'
					.format(port));
			})
	
			.on('server:utest:end', this.onComplete.bind(this))
	
			.on('server:error', function(message) {
				done(message);
			})
	
			.on('server:log', function(type, args) {
				var fn = console[type] || console.log;
	
				fn.apply(console, args);
			})
	
			.on('slave:start', function(stats) {
				var message = 'Testing #{browser.name} #{browser.version}'
				console.log(message.format(stats.userAgent));
				console.log('');
			})
				.on('slave:end', function(stats) {
				console.log('\nAsserts: %d Failed: %d', stats.total, stats.failed);
			})
	
			.on('slave:error', function(error) {
				console.error(error);
			})
	
			.on('slave:assert:failure', function(args) {
				args.unshift('\n');
				console.error.apply(console, args);
	
			})
	
			.on('slave:assert:success', function() {
				util.print(' |'.green.bold);
			});
	
		},
	
		runTests: function() {
			console.log('.. running tests');
			switch (this.status) {
				case status_blank:
				case status_connected:
				case status_ready:
					this.status = status_testing;
					this.socket.emit('client:utest', this.config);
					return;
			}
			console.warn('Server is not ready');
		}
	});
	// source RunnerNode.js
	var RunnerNode = (function() {
	
		function resource_clear(resource) {
			
			var bin = include.getResources(),
				type = resource.type;
			if (type) {
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
		
	
	
		return Class({
			Base: Runner,
			Construct: function() {
				Class.bind(this, 'singleComplete');
			},
			run: function(done) {
				this.runTests();
			},
			runTests: function() {
				if (status_ready !== this.status && status_blank !== this.status) {
					console.warn('Node is busy ... ', this.status);
					return;
				}
	
				this.index = -1;
				this.status = status_testing;
				this.stats = [];
				this.clearResources();
				this.process();
			},
	
			singleComplete: function() {
				this.stats.push({
					url: this.files[this.index].uri.toString(),
					total: assert.total,
					failed: assert.failed
				});
	
				var message = '\nTotal: %1. Failed: %2'.format(assert.total, assert.failed);
				console.log(message[assert.failed ? 'red' : 'green'].bold);
	
				this.process();
			},
			process: function() {
				if (++this.index > this.files.length - 1) {
					this.onComplete(this.stats);
					return;
				}
				assert.total = 0;
				assert.failed = 0;
				TestSuite.clear();
	
				var that = this,
					url = this.files[this.index].uri.toString();
	
				console.log('Test:', url.length > 23 ? '...' + url.substr(-20) : url);
	
				var incl = include
					.cfg('path', config.base)
					.instance(url)
					.js(url)
					.done(function(resp) {
	
					setTimeout(function() {
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
	
		
		
}());
