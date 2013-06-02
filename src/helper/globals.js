/**
 * we use *.txt to allow open it in
 * environments editor via "> ijs globals"
 * */

include
.js('/globals/actions.js', '/globals/environments.js')
.load('/globals/projects.txt')

.done(function(resp){

	var __globals = {},
		__path = include.cfg('path');
	
	Object.extend(__globals, resp.actions);
	Object.extend(__globals, resp.environments);
	Object.extend(__globals, JSON.parse(resp.load.projects));
	
	prepairProjects(__globals);
	prepairPlugins(__globals);
	
	include.exports = __globals;
	
	
	/**
	 * extend is used by plugins to extend some global
	 * behaviour, like actions, server others.
	 */
	__globals.extend = function extend(object) {
		/*
		 *	Actions = {action: String (path to handler)}
		 */
		if ('actions' in object) {
		
			Object.extend(__globals.actions, object.actions);
			
		}
		
		/**
		 *	Server = {
		 *		controllers: Array[String (path to handler or Handler Constructor)]
		 *		websockets: {
		 *			namespace: String (path to Constructor(socket, io))
		 *		}
		 *	}
		 */
		if ('server' in object) {
			var server = __globals.server || (__globals.server = {}),
				serverEx = object.server,
				
				controllers = serverEx['controllers'],
				websockets = serverEx['websockets'];
				
			
			if (controllers) {
				if (Array.isArray(controllers) === false) {
					console.error('Controllers should be defined in array', controllers)
				}
				
				ruqq.arr.each(controllers, function(x){
					(server.controllers || (server.controllers = [])).push(x);
				});
					
				
			}
			
			if (websockets) {
				
				server.websockets = Object.extend(server.websockets, websockets);
				
			}
		}
		
	};
	
	
	__globals.resolvePathFromProject = function(path){
		if (!(path && path[0] === '{')) {
			return path;
		}
		
		var match = /\{([\w]+)\}\//.exec(path),
			projectName = match && match[1],
			project = __globals.projects[projectName],
			projectPath = project && project.path;
			
		if (!projectPath) {
			console.error('Project could be not resolved - ', path);
			return path;
		}
		
		path = path.substring(match[0].length);
		
		return net.URI.combinePathes(projectPath, path);
	};
	
	
	
	
	
	
	function prepairPlugins(globals) {
		if (globals.plugins == null) {
			return;
		}
			
		
		ruqq.arr.each(globals.plugins, function(plugin){
			var url = String.format('%1plugins/%2/%2-plugin.js',__path, plugin);
			include.js(url + '::Plugin').done(function(resp){
				resp.Plugin.register(globals);
			});
		});
		
	}
	

	function prepairProjects(globals) {
		var key, path, projectName;
	
		var globals_routes = globals.defaultRoutes,
			globals_projects = globals.projects;
	
		for (key in globals_routes) {
			path = globals_routes[key];
			projectName = /^\{([\w]+)\}/.exec(path);
	
			if (!projectName || !(projectName = projectName[1])) {
				continue;
			}
	
			globals_routes[key] = path.replace('{' + projectName + '}', '/.reference/' + projectName);
	
			if (globals_projects[projectName] == null) {
				console.error('projects.txt - unknown project in default routes - ', projectName);
			}
	
		}
		
		
		if (globals_projects.ijs == null) {
			globals_projects.ijs = {
				path: __path
			};
		}
	
	}

});
