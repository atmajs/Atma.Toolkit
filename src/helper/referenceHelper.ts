import { Directory } from 'atma-io';

declare let global, logger;

export namespace referenceHelper {
	export function create (solutionDir, name, referenceSource) {
		var dir = new Directory(referenceSource);
		if (dir.exists() == false) {
			logger.error('Directory do not exist.');
			return;
		}

		if (name == null) {
			name = dir.getName();
		}

		var targetDir = new Directory(solutionDir.combine('.reference/' + name + '/'))


		if (targetDir.exists()) {
			logger.error('Reference with the name "%s" already exists', name);
			return;
		}


		new Directory(solutionDir.combine('.reference/')).ensure();


		Directory.symlink(dir.uri.toLocalDir(), targetDir.uri.toLocalDir());
	}
};
