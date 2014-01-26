
var uri = new net.Uri(include.url);

include.exports = {
	register: function(rootConfig){
		
		rootConfig.$extend({
			actions: {
				test: getPath('/utest.node.js')
			},
			server: {
				//handlers: {
				//	'^/utest' : getPath('env/HttpTestHandler.js')
				//},
				subapps: {
					'utest': getPath('env/HttpTestApplication.js')
				},
				websockets: {
					'/node' : getPath('/utest.server.js'),
					'/utest-browser' : function(){}
				}
			}
		});

	}
};

function getPath(path) {
	return uri.combine(path).toString();
}