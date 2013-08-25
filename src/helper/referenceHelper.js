include.exports = {
	create: function(solutionDir, name, referenceSource) {
		var dir = new io.Directory(referenceSource);
		if (dir.exists() == false) {
			logger.error('Directory do not exist.');
			return;
		}

		if (name == null) {
			name = dir.getName();
		}

		var targetDir = new io.Directory(solutionDir.combine('.reference/' + name + '/'))
		
		
		if (targetDir.exists()) {
			logger.error('Reference with the name "%s" already exists', name);
			return;
		}


		new io.Directory(solutionDir.combine('.reference/')).ensure();

		
		io.Directory.symlink(dir.uri.toLocalDir(), targetDir.uri.toLocalDir());
	}
};