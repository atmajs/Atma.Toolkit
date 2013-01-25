include //
.load('#{name}.mask::Template') //
.css('#{name}.css') //
.done(function(resp){

	mask.registerHandler('#{name}', Class({
		Base: Compo,
		Construct: function(){
			this.attr = {
				template: resp.load.Template;
			};
		},
		render: function(model, container, cntx){
			
			Compo.render(this, model, container, cntx);

		}
	}));


});
