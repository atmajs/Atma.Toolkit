include.js('controllers/static.js::Statics').done(function(resp) {

	var staticHandler = resp.Statics,
	
		SocketConnection = Class({
			Construct: function(socket) {                
                Class.bind(this, 'fileChanged', 'disconnected');
				
				
				this.socket = socket;

				socket.on('disconnect', this.disconnected);

				staticHandler.on('filechange', this.fileChanged);
				
				
			},
			fileChanged: function(path, root) {
                path = path.replace(root, '');
				
                console.log('changed path', path);
				this.socket.emit('filechange', path);
			},
			disconnected: function(){
				staticHandler.off('filechange', this.fileChanged);				
			}
		});
	
	include.exports = SocketConnection;

});