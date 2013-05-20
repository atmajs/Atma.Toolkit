
module.exports = {
	actions: defaultActions()
};

function defaultActions() {
	var actions = [
		'concat', 
		'copy',   
		'custom',
		'git-clone',
		'globals',
		'import',
		
		'jshint',
		'uglify',
		'watch',
		
		'npm',
		'reference',
		'server',
		'shell',
		
		// build includejs project
		'build',
		'project-import',
		'project-reference',
		
		'libjs-clone',
		'git-clone'
	];
	
	var paths = {};
	
	ruqq.arr.each(actions, function(x){
		paths[x] = String.format('/src/action/%1.js', x);
	});
	
	// overrides
	var solution = '/src/action/solution.js';
	paths['project-import'] = paths['project-reference'] = paths['build'] = solution;
	
	paths['libjs-clone'] = paths['git-clone'];
	
	return paths;
}