include.js('SocketConnection.js').done(function(resp) {

    
	var SocketListeners = {
		'/browser' : resp.SocketConnection
	};
    
	include.exports = {
		register: function(namespace, Handler){
			SocketListeners[namespace] = Handler;
		},
		listen: function(httpServer) {
			
			logger.log('WebSocket server started');
            
			// socket.io bug workaround
            var _io = global.io;
			delete global.io;
            
            var io = require('socket.io').listen(httpServer,{
				'log level': 2
			});
			
			global.io = _io;
        
			function listen(namespace, Handler) {
				return function(socket){
					new Handler(socket, io);
				};
			}
		
			for (var key in SocketListeners) {
				io
					.of(key)
					.on('connection', listen(key, SocketListeners[key]));
			}
		},
		
		getConnectionHandler: function(namespace){
			return SocketListeners[namespace];
		}
	}
    
});