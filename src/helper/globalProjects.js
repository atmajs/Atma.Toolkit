include.exports = (function(){
	
	var _globals;
	
	function resolve() {
		var file = new io.File(io.env.applicationDir.combine('globals.txt')),
			globals, key, path, projectName;
	
		try {
			globals = JSON.parse(file.read());
		} catch (e) {
			console.error('globals.txt - parse error -', file.uri.toLocalFile(), e);
			return null;
		}
	
		var globals_routes = globals.defaultRoutes,
			globals_projects = globals.projects;
	
		for (key in globals_routes) {
			path = globals_routes[key];
			projectName = /^\{[\w]+\}/.exec(path);
	
			if (!projectName || !(projectName = projectName[0])) {
				continue;
			}
	
			projectName = projectName.replace(/[\{\}]/g, '');
	
			globals_routes[key] = path.replace('{' + projectName + '}', '/.reference/' + projectName);
	
			if (globals_projects[projectName] == null) {
				console.error('globals.txt - unknown project in default routes - ', projectName);
			}
	
		}
	
		return globals;
	}
	
	
	return function(){
		return _globals || (_globals = resolve()) || {};
	};
	
}());