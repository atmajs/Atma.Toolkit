

include.exports = Class({
	Construct: function(solutionUri, outputDirectoryUri, resource) {
		
		var file = new io.File(resource.uri);
		
		if (file.copyResourcesTo == null){
			logger.error('<file:style> Not implemented `copyResourcesTo`', resource.uri.toLocalFile());
			// will throw the error
		}
		
		resource.content = file.copyResourcesTo(outputDirectoryUri, solutionUri).content;
	}
});
