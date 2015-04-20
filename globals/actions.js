
module.exports = {
	actions: defaultActions()
};

function defaultActions() {
	var actions = [
		'concat', 
		'copy',   
		
		'custom',
		'template',
		
		'config',
		'import',
		
		'jshint',
		'uglify',
		'watch',
		
		'release',
		'bump',
		'npm',
		'plugin',
		
		'reference',
		'server',
		'shell',
		
		'transpile',
		
		// build includejs project
		'build',
		'project-import',
		'project-reference',
		
		'atma-clone'
	];
	
	var paths = {};
	
	ruqq.arr.each(actions, function(x){
		paths[x] = String.format('/src/action/%1.js', x);
	});
	
	// overrides
	var solution = '/src/action/solution.js';
	paths['project-import'] =
		paths['project-reference'] =
			paths['build'] = solution;
	
	
	// aliases
	paths['gen'] = paths['template'];
	return paths;
}