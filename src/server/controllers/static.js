include
.js(
	'static-reference.js::RefPath',
	'../proxy.js'
)
.done(function(resp) {

	var File = io.File;

	var path = app.current.file || net.Uri.combine(process.cwd(), 'temp.del'),	
		uri = new net.Uri(path),
		folder = uri.toLocalDir();

	console.log('Server at: ', folder);

	include.exports = new new Class({
		Base: Class.EventEmitter,
		request: function(request, response, base) {
			
			if (typeof base !== 'string') {
				base = folder;
			}
			
            var uri = new net.Uri(request.url);
            
            if (!uri.file){
                uri = uri.combine('index.html');
            }
			
            var fullPath = net.Uri.combine(base, uri.toLocalFile()),
                file = new File(fullPath);
            
			if (file.exists() === false) {
				file = new File(resp.RefPath(request.url));
			}
			
			if (file.exists() === true) {
				
				var mimeType = MimeTypes[file.uri.extension] || 'text/plain',
					content = file.read('binary');

					
				response.writeHeader(200, {
					'Content-Type': mimeType
				});

				response.end(content);


				io.File.watcher.watch(file, this.fileChanged.bind(this));

				return;
			}
				
			if (resp.proxy.pipe(request, response)) 
				return;
			
			
			response.writeHeader(404, {
				"Content-Type": "text/plain"
			});
			response.end("404 Not Found - " + file.uri.toLocalFile());
		
		},

		fileChanged: function(path) {
			io.File.clearCache(path);
			this.trigger('filechange', path, folder);
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