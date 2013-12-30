var dir = '/public/build/';


include
	.load(
		'build.mask'
	)
	
	.done(function(resp){
		
		
		include.exports = Compo({
			mode: 'server:all',
			template: resp.load.build,
			cache: {
				byProperty: 'ctx.page.id'
			},
			onRenderStart: function(model, ctx){
				
				var pageData = ctx.page.data,
					id = pageData.id,
					data = app.config.build[id],
					that = this;
				
				this.model = {};
				
				if (data == null) {
					logger.warn('No info about the page', id, 'Build could be faily');
					return;
				}
				
				if (data && data.scripts) {
					this.model.page = id;
				}
				
				Compo.pause(this, ctx);
				
				
				var loadings = [net.Uri.combine(dir, 'load.html::app')];
				
				
				if (id){
					loadings
						.push(net.Uri.combine(dir, id, 'load.html::page'))
				}
				
				include
					.instance()
					.load(loadings)
					.done(function(resp){
						
						var loadedData = resp.load.app;
						if (resp.load.page) 
							loadedData += resp.load.page;
						
						
						
						that.model.load = loadedData;
						Compo.resume(that, ctx);
					});
				
			}
		});	
	})
