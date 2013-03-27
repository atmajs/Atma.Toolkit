include.js({
	ruqq: ['dom/jquery', 'arr', 'routes'],
	lib: ['mask', 'compo']
}).ready(function(){

    var App = Compo({
        attr: {
            template: '#layout'
        }
    });

    var model = {},
        cntx = {};

    Compo.initialize(App, model, cntx, document.body);



});
