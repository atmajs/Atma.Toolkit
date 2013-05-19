/**
 * we use *.txt to allow open it in
 * environments editor via "> ijs globals"
 * */

include.js('/globals.txt').done(function(resp){

	var __globals = process(resp.globals);
	
	include.exports = function(){
		return __globals;
	};
	

	function process(globals) {
		var key, path, projectName;
	
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

});
