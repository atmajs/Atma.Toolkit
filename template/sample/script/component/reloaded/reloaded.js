include.load('template.mask').done(function(resp){


	mask.registerHandler('reloaded', Compo({
		events: {
			'click: button' : function(){
				alert('Change this alert in source and click the button');
			}
		},
		attr: {
			template: resp.load.template
		}
	}));

});
