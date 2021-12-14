
function path_getDir(url) {
	if (!url)
		return '/';

	var index = url.lastIndexOf('/');
	return index == -1 ? '' : url.substring(index + 1, -index);
}


function path_isSubDir(basepath, path){
	var basedir = path_getDir(basepath),
		dir = path_getDir(path);

	return dir.toLowerCase().indexOf(basedir.toLowerCase()) === 0;
}


function path_resolveUri(url, parentLocation, base) {

	if (url[0] == '/'){
		parentLocation = base;
		url = url.substring(1);
	}



	var uri = new class_Uri(url);

	return uri.isRelative() ? (new class_Uri(parentLocation)).combine(uri) : uri;
}

function path_resolveAppUri(url, parentPath) {
	if (url[0] === '/')
		return url;

	if (url.substring(0,2) === './')
		url = url.substring(2);


	if (!parentPath || url.substring(0, 4) == 'file')
		return '/';


	var index = parentPath.lastIndexOf('/');

	url = (index == -1 ? '/' : (parentPath.substring(index + 1, -index))) + url;

	var reg_subFolder = /([^\/]+\/)?\.\.\//;
	while (url.indexOf('../') !== -1) {
		url = url.replace(reg_subFolder, '');
	}

	return url;
}

function path_ensureTrailingSlash(path) {
	if (path[path.length - 1] === '/')
		return path;

	return path + '/';
}
