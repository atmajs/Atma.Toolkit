function glob_getCalculatedPath(path, glob) {
	var star = glob.indexOf('*'),
		slash = glob.lastIndexOf('/', star),
		strict = slash === -1 ? null : glob.substring(0, slash);
		
	if (!slash)
		return path;
	
	var index = path.toLowerCase().indexOf(strict.toLowerCase());
	
	if (index === -1) {
		console.warn('[substring not found]', path, strict);
		return path;
	}
	
	return path.substring(index + strict.length);
}

/**
 *	[as dir] '/dev/*.js' -> '/dev/'
 */
function glob_getStrictPath(path) {
	var index = path.indexOf('*');
	if (index === -1) {
		console.error('glob.js [path is not a glob pattern]', path);
		return null;
	}
	
	return path.substring(0, path.lastIndexOf('/', index) + 1);
}

/**
 *	'c:/dev/*.js' -> '*.js'
 */
function glob_getRelativePath(path) {
	var index = path.indexOf('*');
	if (index === -1) {
		console.error('glob.js [path is not a glob pattern]', path);
		return null;
	}
	
	return path.substring(path.lastIndexOf('/', index) + 1);
}