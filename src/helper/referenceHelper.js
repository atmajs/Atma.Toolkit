include.exports = {
	create: function(solutionDir, name, referenceSource) {
		var dir = new io.Directory(referenceSource);
		if (dir.exists() == false) {
			return console.error('Directory do not exist.');
		}

		if (name == null) {
			name = dir.getName();
		}

		var targetDir = new io.Directory(solutionDir.combine('.reference/' + name + '/'))
		
		
		if (targetDir.exists()) {
			return console.error('Reference with the name "%1" already exists'.format(name));
		}


		new io.Directory(solutionDir.combine('.reference/')).ensure();

				
		io.utils.dir.symlinkSync(dir.uri.toLocalDir(), targetDir.uri.toLocalDir());
		return null;
	}
}