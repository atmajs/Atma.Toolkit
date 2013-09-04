include.js('controllers/static.js::Statics').done(function(resp) {

	var staticHandler = resp.Statics,
	
		SocketConnection = Class({
			Construct: function(socket) {                
             	
				this.socket = socket;

				socket.on('disconnect', this.disconnected);

				staticHandler.on('filechange', this.fileChanged);
			},
			
			Self: {
				fileChanged: function(path, root) {
					path = path.replace(root, '');
					
					if (this.socket == null) {
						console.error('File changed %s, but socket is undefined', path);
						return;
					}
					
					console.log('<file:change>'.green, path);
					this.socket.emit('filechange', path);
				},
				disconnected: function(){
					staticHandler.off('filechange', this.fileChanged);				
				}
			}
		});
	
	include.exports = SocketConnection;

});