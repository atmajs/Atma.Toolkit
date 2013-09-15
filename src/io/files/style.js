include.js({
	parser: 'css::CssParser'
}).done(function(resp) {


	var CssParser = resp.CssParser,
		getRewritenPath = function(uri, original, cssDirectory) {
			return uri.toRelativeString(cssDirectory);
		};


	
	global.io.File.getFactory().registerHandler([/\.css$/, /\.less$/], Class({
		Base: io.File,
		read: function() {
            if (this.resources && this.content){
                return this.content;
            }
			this.content = io.File.prototype.read.call(this);
            this.resources = CssParser.extractResources(global.solution.uri, this.uri, this.content);
            
			return this.content;
		},
		copyTo: function(uri) {
            
            this.copyImagesTo(uri);
            
			
			new io.File(uri).write(this.content);
            
			return this;
		},
        copyImagesTo: function(uri){
            if (this.content == null){
                this.read();
            }
            copyImages(this, uri);
            return this;
        }
	}));




	function copyImages(cssFile, targetUri) {

		var solutionUri = global.solution.uri,
			cssFilePath = cssFile.uri.toString(),
			isSubDir = cssFilePath.indexOf('.reference/') === -1
				? path_isSubDir(solutionUri.toString(), cssFilePath)
				: true,
			resources = cssFile.resources,
			dir = net.Uri.combine(targetUri.toLocalDir(), 'resources/');

		
		resources.forEach(function(x){
			
			if (isSubDir == false) {
				var uri = new net.Uri(net.Uri.combine(dir, x.uri.file));

				new io.File(x.uri).copyTo(uri);
				x.replaceWith = getRewritenPath(uri, x.href, targetUri.toLocalDir());

			} else {
				
				x.replaceWith = getRewritenPath(x.uri, x.href, targetUri.toLocalDir());
			}

			if (x.replaceWith) {
				cssFile.content = CssParser.replace(cssFile.content, x.href, x.replaceWith);
			}
		});
	}
});