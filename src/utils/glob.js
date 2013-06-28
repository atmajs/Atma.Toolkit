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