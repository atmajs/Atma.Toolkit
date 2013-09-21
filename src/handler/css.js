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
            
            if (file.copyResourcesTo == null){
                console.error('Error: Not implemented copyResourcesTo', resource.uri.toLocalFile());
            }
            
            resource.content = file.copyResourcesTo(outputDirectoryUri).content;
		}
	});

});