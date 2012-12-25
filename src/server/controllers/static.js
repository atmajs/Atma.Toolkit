include.js({
	base: 'EventEmitter::Emitter'
}).done(function(resp) {

	var sys = require("sys"),
		my_http = require("http"),
		pathUtil = require("path"),
		url = require("url"),
		fs = require("fs"),
		File = io.File;

	var path = global.config.file || net.URI.combine(process.cwd(), 'temp.del'),	
		uri = new net.URI(path),
		folder = uri.toLocalDir();

	console.log('Server at: ', folder);

	include.exports = new new Class({
		Base: resp.Emitter,
		request: function(request, response) {
			//var path = url.parse(request.url).pathname,
			//	fullPath = pathUtil.join(folder, path);
			//             
            
            var uri = new net.URI(request.url);
            
            if (!uri.file){
                uri = uri.combine('index.html');
            }
            
            var fullPath = net.URI.combine(folder, uri.toLocalFile()),
                file = new File(fullPath);
            
			if (file.exists()) {
				var mimeType = MimeTypes[file.uri.extension] || 'text/plain',
					content = file.read('binary');

				response.writeHeader(200, {
					'Content-Type': mimeType
				});

				response.write(content);


				io.File.watcher.watch(file, this.fileChanged.bind(this));

			} else {
				response.writeHeader(404, {
					"Content-Type": "text/plain"
				});
				response.write("404 Not Found");
			}
			response.end();
		},

		fileChanged: function(path) {
			console.log('Changed', path);
			io.File.clearCache(path);


			this.trigger('filechange', path);
		}
	});


	var MimeTypes = {};

	set('text/html', 'html', 'htm');
	set('text/css', 'css', 'less');
	set('text/plain', 'txt', 'mask');

	set('application/x-javascript', 'js', 'coffee');

	set('image/jpeg', 'jpeg', 'jpg');
	set('image/gif', 'gif');
	set('image/png', 'png');



	function set() {
		var mimeType = arguments[0];
		for (var i = 1, x, length = arguments.length; i < length; i++) {
			MimeTypes[arguments[i]] = mimeType;
		}
	}

});