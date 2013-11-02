
include
	.load('dev.html')
	.done(function(resp){
	
	include.exports = Compo({
		mode: 'server:all',
		
		scripts: null,
		renderStart: function(model, ctx){
			
			this.include = app
				.config
				.page
				.getInclude();
			
			this.scripts = app
				.config
				.page
				.getScripts(ctx.page.data.id)
				.map(function(x, index){
					return "'" + x + "'";
				})
				.join(',\n');
				
		},
		toHtml: function(){
			return resp
				.load
				.dev
				.replace('%CFG%', JSON.stringify(this.include.cfg, null, 4))
				.replace('%ROUTES%', JSON.stringify(this.include.routes, null, 4))
				.replace('%INCLUDE%', this.include.src)
				.replace('%SCRIPTS%', this.scripts);
		}
	});
	

});