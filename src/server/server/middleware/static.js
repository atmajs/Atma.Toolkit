
include
	.js(
		'utils/staticRef.js',
		'utils/Videostreamer.js',
		'utils/MimeTypes.js'
	)
	.done(function(resp){
		
		
		var _base = process.cwd(),
		
			Uri = net.Uri,
			File = io.File;

		include.exports = function(){
				
			return function(req, res, next, config){
				var url = req.url,
					base = (config && (config.static || config.base)) || _base
					;
				
				if (url === '/') 
					url = 'index.html';
					
				var uri = new Uri(Uri.combine(base, url)),
					file = new File(uri);
				
				if (file.exists()) {
					file_send(file, req, res);
					return;
				}
				
				file = resp.staticRef(file);
				
				if (file && file.exists()) {
					file_send(file, req, res);
					return;
				}
				
				req.filePath = uri.toLocalFile();
				next();
			};
		};
		
		
		function file_send(file, req, res){
			var mimeType = resp.MimeTypes[file.uri.extension] || 'text/plain';
			
			
			if (mimeType.indexOf('video/') === 0) {
				
				resp.Videostreamer(file.uri.toLocalFile(), req, res);
				return;
			}
			
			var content = file.read('buffer');

			if (content == null)
				content = '<undefined>';



			if (typeof content === 'object' && content instanceof Buffer === false){
				try {
					content = JSON.stringify(content);
				}catch(error){
					content = '<json:stringify>' + error.toString();
				}
			}
			
			res.writeHeader(200, {
				'Content-Type': mimeType
			});
			

			res.end(content);
		}
	});
	
