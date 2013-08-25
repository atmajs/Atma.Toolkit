(function(){

	include.exports = function(path){
		var ref_index = path.lastIndexOf('.reference/');
		if (ref_index == -1) {
			return path;
		}
		
		
		var regexp = /\.reference\/([^\/]+)/,
			match = regexp.exec(path),
			project = match && match[1],
			projects = app.config.globals.projects;
			
		
		if (projects == null){
			return path;
		}
		
		
		var projectPath = projects[project] && projects[project].path,
			str = '.reference/' + project;
			
		if (projectPath == null) {
			logger
				.error('No project in {atma}/globals/projects.txt - ', project)
				.log('Run bold<$ atma globals> and add path to projects object'.color)
			
			return path;
		}
		
		return net.Uri.combine(projectPath + path.substring(ref_index + str.length));
	}
}());
