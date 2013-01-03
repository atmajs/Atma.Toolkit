(function() {

	include.exports = function(file) {
		var filename = file.uri.toLocalFile(),
			less = require('less'),
			parser = new less.Parser({
				filename: filename,
				paths: [file.uri.toLocalDir()]
			}),
			css;

		parser.parse(file.content, function(error, tree) {
			if (error) {
				console.error(filename, error);
				return;
			}
			try {
				file.content = tree.toCSS();
			} catch (error) {
				console.error(filename, error);
			}
		});
        
	}
}());