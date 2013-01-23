include.load('template.mask').done(function(resp){

	
	mask.registerHandler('reloaded', Class({
		Base: Compo,
		events: {
			'click: button' : function(){
				alert('Change this alert in source and click the button');  
			}
		},
		attr: {
			template: resp.load.template
		},
		render: function(model, container, cntx){

			Compo.render(this, model, container, cntx)
		}
	}));
 
	include.reload = mask.delegateReload('reloaded');

});