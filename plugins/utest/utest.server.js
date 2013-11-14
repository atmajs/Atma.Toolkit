

(function(){
	
	

	// source ../src/node/utils/logger.js
	(function(){
		
		var util = require('util');
		
		console.print = function(){
			var message = Array.prototype.slice.call(arguments).join(' ');
			
			util.print(message);
		};
		
	}());
	// end:source ../src/node/utils/logger.js
	
	// source ../src/server/actions.js
	
	var Actions = (function(){
		
		
		var _actions = {
		
			registerService: function(route, handlersPath){
				
				logger(90)
					.log('<utest> register service')
					.log(route, handlersPath)
					;
				
				atma
					.server
					.app
					.handlers
					.registerService(route, handlersPath)
					;
			}
		};
	
		
		return {
			run: function(action){
				var fn = _actions[action];
				if (typeof fn !== 'function') {
					logger.error('<utest:server> unknown action', action);
					return;
				}
				
				fn.apply(null, Array.prototype.slice.call(arguments, 1));
			},
			
			register: function(action, worker){
				_actions[action] = worker;
			}
		}
	}());
	
	// end:source ../src/server/actions.js
	// source ../src/server/BrowserTunnel.js
	
	var BrowserTunnel = Class({
		Base: Class.EventEmitter,
		Construct: function(socket, logger) {
			var that = this;
	
			this.socket = socket
				.on('browser:log', function(type, args) {
	
					(logger[type] || logger.log).apply(logger, args);
		
				})
		
				.on('browser:utest:start', function(stats) {
					that.trigger('start', stats);
				})
		
				.on('browser:utest:end', function(result) {
					that.result = result;
					that.trigger('end', this, result);
				})
				.on('>server:utest:action', function(){
					var args = Array
						.prototype
						.slice
						.call(arguments)
						;
					args
						.unshift('action')
						;
					
					that.trigger.apply(that, args);
				})
				.on('browser:utest:script', this.pipe('browser:utest:script'))
				.on('browser:assert:success', this.pipe('browser:assert:success'))
				.on('browser:assert:failure', this.pipe('browser:assert:failure'))
				;
			
		},
	
		run: function(config) {
	
			var socket = this.socket,
				that = this;
	
			socket.emit('server:utest:handshake', function(stats) {
				logger(90).log('UTest.tunnel - handshake - '.cyan.bold, stats);
	
				if (stats.ready === 1) {
					socket.emit('server:utest', config);
					return;
				}
				that.result = {
					error: 'Slave is busy'
				};
	
				that.trigger('error', that, {
					message: 'Slave is busy'
				});
			});
	
	
		},
	
		dispose: function() {
			this.socket.removeAllListeners();
			this.socket = null;
		}
	});
	
	// end:source ../src/server/BrowserTunnel.js
	// source ../src/server/ServerUTest.js
	
	
	var ServerUTest = Class({
		Base: Class.EventEmitter,
		Construct: function(sockets, logger) {
			this.index = 0;
			this.tunnels = ruqq.arr.map(sockets, function(socket) {
				
				return new BrowserTunnel(socket, logger)
					.on('start', this.pipe('slave:start'))
					.on('end', this.onEnd)
					.on('error', this.onError)
					.on('action', this.onAction)
					.on('browser:assert:success', this.pipe('browser:assert:success'))
					.on('browser:assert:failure', this.pipe('browser:assert:failure'))
					.on('browser:utest:start', this.pipe('browser:utest:start'))
					.on('browser:utest:script', this.pipe('browser:utest:script'))
					;
					
			}.bind(this));
		},
		
		Self: {
			onEnd: function(tunnel, result) {
				
				this.trigger('slave:end', result);
				this.process();
			},
			onError: function(that, error){
				this.trigger('slave:error', { message: 'Slave error', slave: error });
				this.process();
			},
			onAction: Actions.run
		},
		stats: function(){
			return ruqq.arr.map(this.tunnels, function(x, index){
				index !== 0 && (delete x.result.resources);
				return x.result;
			});
		},
		
		run: function(config){
			this.index = -1;
			this.config = config;
			this.process();
			
		},
		process: function(){
			if (++this.index > this.tunnels.length - 1) {
				this.trigger('server:utest:end', this.stats());
				this.dispose();
				
				return;
			}
			
			this.tunnels[this.index].run(this.config);
		},
		
		dispose: function(){
			ruqq.arr.invoke(this.tunnels, 'dispose');
			this.tunnels = null;
		}
	});
	
	// end:source ../src/server/ServerUTest.js
	// source ../src/server/SocketListener.js
	var SocketListener = (function(){
		
		var wait_COUNT = 10,
			wait_DURATION = 1000;
		
		var Pipe = function(socket, event) {
			var slice = Array.prototype.slice,
				args;
			return function() {
				logger(90).log('Socket.Pipe'.green.bold, event);
				args = slice.call(arguments);
				args.unshift(event);
				socket.emit.apply(socket, args);
			};
		}
		
		var Logger = Class({
			Construct: function(socket) {
		
				for (var key in console) {
					this[key] = create(key);
				}
		
				function create(key) {
					var original = console[key],
						args;
					return function() {
						args = Array.prototype.slice.call(arguments);
		
						socket.emit('server:log', key, args);
						original.apply(console, args);
					};
				}
		
			}
		});
		
		var __socket, __config;
		
		return Class({
			Construct: function(socket, io, port) {
				
				logger.log('\tNode Client Connected'.green);
				
				this.socket = socket
					.on('disconnect', this.disconnected)
					.on('client:utest', function(config, done) {
						
						client_tryTest(io, socket, config, done, port, 0);
					})
					.on('>server:utest:action', Actions.run)
					;
			},
			
			disconnected: function() {
				__config = null;
			},
			
			Static: {
				getCurrentConfig: function(){
					return __config;
				}
			}
		});
	
		function client_tryTest(io, socket, config, done, port, retryCount){
			var clients = io.of('/utest-browser').clients(),
				message;
			
			if (clients.length === 0) {
				
				if (++retryCount <= wait_COUNT) {
					
					message = 'Waiting for some slaves: %1/%2'
						.format(retryCount, wait_COUNT);
					
					socket.emit('server:log', 'warn', [message]);
					
					setTimeout(function(){
						
						client_tryTest(io, socket, config, done, port, retryCount);
					}, wait_DURATION);
					
					return;
				}
				
				message = 'No Slaves Captured - navigate to http://localhost:%1/utest/'
					.format(port || 5777);
					
				socket.emit('server:error', message);
				return;
			}
	
			client_doTest(clients, socket, config, done);
		}
		
		function client_doTest(clients, socket, config, done){
			
			var utest = new ServerUTest(clients, new Logger(socket));
	
			utest
				.on('slave:start', Pipe(socket, 'slave:start'))
				.on('slave:end', Pipe(socket, 'slave:end'))
				.on('slave:error', Pipe(socket, 'slave:error'))
				.on('server:utest:end', Pipe(socket, 'server:utest:end'))
				.on('browser:utest:script', Pipe(socket, 'slave:utest:script'))
	
				.on('browser:assert:failure', Pipe(socket, 'slave:assert:failure'))
				.on('browser:assert:success', Pipe(socket, 'slave:assert:success'))
				
			;
	
			__config = config;
			
			utest.run(config, done);
		}
		
	}());
	
	// end:source ../src/server/SocketListener.js


	include.exports = SocketListener;
}());
