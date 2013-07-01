(function() {

	/**
	 Import any file into processed file

	 //import filepath

	 */

	include.exports = function(file) {
		var code = file.content,
			defines;

		if (typeof code !== 'string') {
			code = code.toString();
		}

		file.content = process(file.uri, code);

	};

	var importStatement = /^[\t ]*\/\/[ ]*import[ ]+(([^\n\r'" ]+)|('|"([^'"]+)))/gm;

	function process(currentUri, code) {

		return code.replace(importStatement, function(full, full1, match1, full2, match2) {

			var uri,
				file, files,
				path = match1 || match2;
	
			if (!path) {
				console.error('Path can not be extracted', full);
				return full;
			}
	
			if (path[0] === '/') {
				uri = io.env.currentDir.combine(path.substring(1));
			} else {
				uri = currentUri.combine(path);
			}
			
			if (path.indexOf('*') !== -1) {
				var _uriStr = uri.toLocalFile();
				
				files = new io
					.Directory(glob_getStrictPath(_uriStr))
					.readFiles(glob_getRelativePath(_uriStr))
					.files;
			}
	
			if (files == null) {
				
				var file = new io.File(uri);
				if (file.exists() === false) {
					console.error('File Importer: File does not exists', file.uri.toLocalFile());
					
					console.error('--', path, currentUri.toString(), io.env.currentDir.toLocalFile());
					return full;
				}
				
				files = [file];
			}
	
			var indent = full.substring(0, full.indexOf('//')),
				content = files.map(function(file, index){
					var msg = 'File Import %1 into %2'
						.green
						.format(uri.file, currentUri.file)
						
					console.log(msg);
					
					return get_fileContent(file, indent, files.length > 1);
				}).join(io.env.newLine);
	
			return full.replace('import', 'source') + io.env.newLine + content;
		});
	}
	
	
	function get_fileContent(file, indent, insertFileName) {
		var content = file.read().toString();
		
		if (indent) {
			var newLineMatch = /(\r\n)|(\r)|(\n)/.exec(content),
				newLine = newLineMatch && newLineMatch[0];

			content = content.split(newLine).map(function(line) {
				return indent + line;
			}).join(newLine);
		}
		
		if (insertFileName) {
			content = indent
				+ '// source '
				+ file.uri.file
				+ io.env.newLine
				+ content;
		}
		
		return content;
	}

}());
