import { File } from 'atma-io';
import { class_Uri } from 'atma-utils';

declare let logger, app;

export const staticRef = function (file){
	var path = typeof file === 'string'
			? file
			: file.uri.toLocalFile()
			,
		ref_index = path.lastIndexOf('.reference/');

	if (ref_index === -1)
		return null;

	var regexp = /\.reference\/([^\/]+)/,
		match = regexp.exec(path),
		project = match && match[1],
		projects = app.config.projects;

	if (projects == null)
		return null;



	var projectPath = projects[project] && projects[project].path,
		str = '.reference/' + project;

	if (projectPath == null) {
		logger
			.error('Reference not found', project)
			.log(path, file.exists());

		return null;
	}

	path = class_Uri.combine(projectPath + path.substring(ref_index + str.length));
	file = new File(path);

	if (file.exists() === false) {
		logger
			.warn('<Referenced Project: %s> 404 - ', project, file.uri.toLocalFile())
			;
	}

	return file;
};

