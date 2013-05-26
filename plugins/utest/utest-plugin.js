
var uri = new net.URI(include.url);

include.exports = {
	register: function(globals){
		
		globals.extend({
			actions: {
				test: uri.combine('/utest.node.js').toString()
			},
			server: {
				controllers: [uri.combine('env/controller.js').toString()],
				websockets: {
					'/node' : uri.combine('/utest.server.js').toString()
				}
			}
		});

	}
};