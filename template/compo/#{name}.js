include //
.load('#{name}.mask::Template') //
.css('#{name}.css') //
.done(function(resp){

	mask.registerHandler('#{name}', Compo({
		constructor: function(){
			this.attr = {
				'template': resp.load.Template,
				'class': '#{name}'
			};
		},
        onRenderStart: function(model, cntx, container){
            // ..
        },
        onRenderEnd: function(elements, cntx, container){
            // ..
        }
	}));


});
