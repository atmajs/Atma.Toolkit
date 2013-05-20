include

.js({
	helper: 'globals'
})

.done(function(resp){

	include.exports = function(path){
		var ref_index = path.indexOf('.reference');
		if (ref_index == -1) {
			return path;
		}
		
		
		var regexp = /\.reference\/([^\/]+)/,
			match = regexp.exec(path),
			project = match && match[1],
			projects = resp.globals.projects;
			
		
		if (projects == null){
			return path;
		}
		
		
		var projectPath = projects[project] && projects[project].path,
			str = '.reference/' + project;
			
		if (projectPath == null) {
			console.error('No project in {ijs}/globals/projects.txt - ', project);
			return path;
		}
		
		return net.URI.combine(projectPath + path.substring(ref_index + str.length));
	}
});
