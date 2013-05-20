/**
 * we use *.txt to allow open it in
 * environments editor via "> ijs globals"
 * */

include
.js('/globals/actions.js', '/globals/environments.js')
.load('/globals/projects.txt')

.done(function(resp){

	var __globals = {};
	
	Object.extend(__globals, resp.actions);
	Object.extend(__globals, resp.environments);
	Object.extend(__globals, JSON.parse(resp.load.projects));
	
	include.exports = __globals;
	

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
				console.error('projects.txt - unknown project in default routes - ', projectName);
			}
	
		}
	
		return globals;
	}

});
