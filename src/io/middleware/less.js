(function() {

	include.exports = function(file, done) {
		
		var filename = file.uri.toLocalFile(),
			less = require('less'),
			parser = new less.Parser({
				syncImport: true,
				filename: filename,
				paths: [file.uri.toLocalDir()]
			}),
			css;

        if (typeof file.content !== 'string'){
            file.content = file.content.toString();
        }

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
