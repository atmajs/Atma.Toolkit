include.js('socketConnection.js::SocketConnection').done(function(resp) {

    
	//-var connections = [];
    
	include.exports = {
		listen: function(httpServer) {
			
			console.log('WebSocket server started');
            
            
            
            var io = require('socket.io').listen(httpServer,{
				'log level': 2
			});
        
			
            
            io.sockets.on('connection', function(socket) {
				
				new resp.SocketConnection(socket);
				
			});            
		}
	}
    
});