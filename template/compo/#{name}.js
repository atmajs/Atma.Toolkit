include 
	.load('#{name}.mask::Template') 
	.css('#{name}.less') //
	.done(function(resp){

		mask.registerHandler(':#{name}', Compo({
			template: resp.load.Template,

			//compos: {
			//
			//},
			//events: {
			//
			//},
			//slots: {
			//
			//},
			//pipes: {
			//
			//},
			//constructor: function(){
			//
			//},

			onRenderStart: function(model, ctx, container){
				// ..
			},
			onRenderEnd: function(elements, model, ctx, container){
				// ..
			},
	
			//dispose: function(){
			//
			//}
		}));


	});
