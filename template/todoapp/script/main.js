
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
	lib: ['mask'],
	script: 'model',
	appcompo: 'todoApp',
}).ready(function() {

    var App = Compo({
        attr: {
            template: '#layout'
        }
    });


    Compo.initialize(App, tasksDB, {}, document.body);
});
