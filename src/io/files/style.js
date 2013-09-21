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
            
            this.copyResourcesTo(uri);
            
			
			new io.File(uri).write(this.content);
            
			return this;
		},
        copyResourcesTo: function(uri){
            if (this.content == null){
                this.read();
            }
            copyResources(this, uri);
            return this;
        }
	}));

	
	var path_REF = '.reference/';


	function copyResources(cssFile, targetUri) {

		var solutionUri = global.solution.uri,
			cssFilePath = cssFile.uri.toString(),
			solutionPath = solutionUri.toString(),
			resources = cssFile.resources,
			dir = net.Uri.combine(targetUri.toLocalDir(), 'resources/');

		
		resources.forEach(function(x){
			
			if (isSubDir(solutionPath, x.uri.toString()) === false) {
				var uri = getTargetUri(dir, x.uri);
				
				new io.File(x.uri).copyTo(uri);
				
				x.replaceWith = getRewritenPath(uri, x.href, targetUri.toLocalDir());
			} else {
				
				x.replaceWith = getRewritenPath(x.uri, x.href, targetUri.toLocalDir());
			}

			if (x.replaceWith) 
				cssFile.content = CssParser.replace(cssFile.content, x.href, x.replaceWith);
			
		});
	}
	
	function isSubDir(solutionPath, resourcePath) {
		if (resourcePath.indexOf(path_REF) !== -1)
			return false;
		
		return path_isSubDir(solutionPath, resourcePath);
	}
	
	function getTargetUri(outputDir, fileUri) {
		var path = fileUri.toString();
		if (path.indexOf(path_REF) === -1) {
			
			return new net.Ur(net.Uri.combine(outputDir, fileUri.uri.file));
		}
		
		
		var relPath = path.substring(path.lastIndexOf(path_REF) + path_REF.length);
		
		return new net.Uri(net.Uri.combine(outputDir, relPath));
	}
});