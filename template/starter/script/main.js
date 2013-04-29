include.js({
	ruqq: ['dom/jquery', 'arr', 'routes'],
	lib: ['mask']
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
