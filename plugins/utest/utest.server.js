
include.js({
	script: 'base/EventEmitter'
})

.done(function(resp){
	
	var __EventEmitter = resp.EventEmitter;

	// source ../src/server/BrowserTunnel.js
	
	var BrowserTunnel = Class({
		Base: __EventEmitter,
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
	
			.on('browser:utest:script', this.pipe('browser:utest:script'))
			.on('browser:assert:success', this.pipe('browser:assert:success'))
			.on('browser:assert:failure', this.pipe('browser:assert:failure'));
			
		},
	
		run: function(config) {
	
			var socket = this.socket,
				that = this;
	
			socket.emit('server:utest:handshake', function(stats) {
				Log('UTest.tunnel - handshake - ', stats, 90);
	
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
	
	// source ../src/server/ServerUTest.js
	
	
	var ServerUTest = Class({
		Base: __EventEmitter,
		Construct: function(sockets, logger) {
			this.index = 0;
			this.tunnels = ruqq.arr.map(sockets, function(x) {
				
				return new BrowserTunnel(x, logger)
					.on('start', this.pipe('slave:start'))
					.on('end', this.onEnd.bind(this))
					.on('error', this.onError.bind(this))
					.on('browser:assert:success', this.pipe('browser:assert:success'))
					.on('browser:assert:failure', this.pipe('browser:assert:failure'))
					.on('browser:utest:start', this.pipe('browser:utest:start'))
					.on('browser:utest:script', this.pipe('browser:utest:script'))
					;
					
			}.bind(this));
		},
		onEnd: function(tunnel, result) {
			this.trigger('slave:end', result);
			this.process();
		},
		onError: function(that, error){
			this.trigger('slave:error', { message: 'Slave error', slave: error });
			this.process();
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
	
	// source ../src/server/SocketListener.js
	var SocketListener = (function(){
		
		
		var Pipe = function(socket, event) {
			var slice = Array.prototype.slice,
				args;
			return function() {
				Log('Socket.Pipe', event, 95);
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
				
				
				this.socket = socket
		
				.on('disconnect', this.disconnected)
				.on('client:utest', function(config, done) {
		
					var clients = io.of('/utest-browser')
						.clients();
		
					if (clients.length === 0) {
						var message = 'No Slaves Captured - navigate to http://localhost:%1'.format(port || 5777)
						socket.emit('server:error', message);
						return;
					}
		
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
		
				});
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
	
		
	}());
	


	include.exports = SocketListener;
});
