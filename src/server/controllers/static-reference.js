include

.js({
	helper: 'globalProjects::Projects'
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
			_projects = resp.Projects().projects;
			
		
		if (_projects == null){
			return path;
		}
		
		
		var projectPath = _projects[project] && _projects[project].path,
			str = '.reference/' + project;
			
		if (projectPath == null) {
			console.error('globals.txt - project 404 - ', project);
			return path;
		}
		
		return net.URI.combine(projectPath + path.substring(ref_index + str.length));
	}
});
