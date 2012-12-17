include.js({
	parser: 'css::CssParser'
}).done(function(resp) {


	var CssParser = resp.CssParser,
		getRewritenPath = function(uri, original, cssDirectory) {
			return uri.toRelativeString(cssDirectory);
		};


	
	global.io.fileFactory.registerHandler([/\.css$/], Class({
		Base: io.File,
		read: function() {
			this.source = io.File.prototype.read.call(this);
			this.images = CssParser.extractImages(global.solution.uri, this.uri, this.source);
			return this.source;
		},
		copyTo: function(uri) {
            
            this.copyImagesTo(uri);
            
			
			new io.File(uri).write(this.source);
            
			return this;
		},
        copyImagesTo: function(uri){
            if (this.source == null){
                this.read();
            }
            copyImages(this, uri);
            return this;
        },
		write: function(content) {

			if (global.solution.config.minify) {
                var cleanCSS = require('clean-css');
				content = cleanCSS.process(content);
			}
            
			io.File.prototype.write.call(this, content);
		}
	}));




	function copyImages(cssFile, targetUri) {

		var solutionUri = global.solution.uri,
			isSubDir = global.urlhelper.isSubDir(solutionUri.toString(), cssFile.uri.toString()),
			images = cssFile.images,
			dir = net.URI.combine(targetUri.toLocalDir(), 'images/');


		for (var i = 0, x, length = images.length; x = images[i], i < length; i++) {

			if (isSubDir == false) {
				var uri = new net.URI(net.URI.combine(dir, x.uri.file));

				new io.File(x.uri).copyTo(uri);
				x.replaceWith = getRewritenPath(uri, x.href, targetUri.toLocalDir());

			} else {
				x.replaceWith = getRewritenPath(x.uri, x.href, targetUri.toLocalDir());
			}

			if (x.replaceWith) {
				cssFile.source = CssParser.replace(cssFile.source, x.href, x.replaceWith);
			}
		}
	}
});