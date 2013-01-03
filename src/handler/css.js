include.js({
	parser: 'css::CssParser'
}).done(function(resp) {

	var CssParser = resp.CssParser,
		getRewritenPath = function(uri, original, cssDirectory) {
			return uri.toRelativeString(cssDirectory);
		};



	include.exports = Class({
		Construct: function(solutionUri, outputDirectoryUri, resource) {
			
            var file = new io.File(resource.uri);
            
            if (file.copyImagesTo == null){
                console.error('Error: No copyImagesTo', resource.uri.toLocalFile());
            }
            
            resource.content = file.copyImagesTo(outputDirectoryUri).content;
		}
	});

});