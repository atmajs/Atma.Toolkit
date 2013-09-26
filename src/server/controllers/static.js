include
.js(
	'static-reference.js::RefPath',
	'videostreamer.js',
	'../proxy.js'
)
.done(function(resp) {

	var File = io.File,
		Videostreamer = resp.videostreamer;

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
				
				var mimeType = MimeTypes[file.uri.extension] || 'text/plain';
				
				
				if (mimeType.indexOf('video/') === 0) {
					
					Videostreamer(file.uri.toLocalFile(), request, response);
					return;
				}
				
				var content = file.read('binary');

				if (content == null)
					content = '<undefined>';

				if (typeof content === 'object' && content instanceof Buffer === false){
					try {
						content = JSON.stringify(content);
					}catch(error){
						content = '<json:stringify>' + error.toString();
					}
				}
					
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
				'Content-Type': 'text/plain'
			});
			response.end('404 Not Found - ' + file.uri.toLocalFile());
		
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
	set('application/json', 'json', 'yml');

	set('image/jpeg', 'jpeg', 'jpg');
	set('image/gif', 'gif');
	set('image/png', 'png');
	set('image/svg+xml', 'svg');
	
	set('video/mp4', 'mp4', 'f4v', 'f4p');
	set('video/ogg', 'ogv');
	set('video/webm', 'webm');
	set('video/x-flv', 'flv');
	set('video/mov', '/quicktime')
	set('video/x-flv', 'flv')
	
	set('application/x-shockwave-flash', 'swf');



	function set() {
		var mimeType = arguments[0];
		for (var i = 1, x, length = arguments.length; i < length; i++) {
			MimeTypes[arguments[i]] = mimeType;
		}
	}

});