
include

.routes({
	appcompo: '/script/compos/{0}.js',
	script: '/script/{0}.js'
})

.js({
	lib: 'class'
})

.js({
	ruqq: ['arr', 'utils', 'routes', 'dom/jquery'],	
	lib: 'compo',
	compo: ['binding',	'list'],
	script: 'model',	
	appcompo: 'todoApp',
}).ready(function() {

	new Compo('#layout').render(tasksDB).insert(document.body);

});