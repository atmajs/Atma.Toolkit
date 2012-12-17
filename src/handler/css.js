include.js({
	parser: 'css::CssParser'
}).done(function(resp) {

	var CssParser = resp.CssParser,
		getRewritenPath = function(uri, original, cssDirectory) {
			return uri.toRelativeString(cssDirectory);
		};



	include.exports = Class({
		Construct: function(solutionUri, outputDirectoryUri, resource) {
			
            resource.source = new io.File(resource.uri).copyImagesTo(outputDirectoryUri).source;
		}
	})

});