include.js('controllers/static.js::Statics').done(function(resp) {

	var staticHandler = resp.Statics,
	
		SocketConnection = Class({
			Construct: function(socket) {
				
				this.fileChanged = this.fileChanged.bind(this);
				this.disconnected = this.disconnected.bind(this);
				this.socket = socket;

				socket.on('disconnect', this.disconnected);

				staticHandler.on('filechange', this.fileChanged);
				
				
			},
			fileChanged: function(path) {
				console.log('changed path', path);
				this.socket.emit('filechange', path);
			},
			disconnected: function(){
				console.log('disconnected');
				staticHandler.off('filechange', this.fileChanged);
				console.log('disconnected.off');
			}
		});
	
	include.exports = SocketConnection;

});