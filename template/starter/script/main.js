include.js({
	atma_ruqq: ['dom/jquery', 'arr', 'routes'],
	atma: ['mask']
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
