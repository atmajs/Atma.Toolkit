
include
	.load('dev.html')
	.done(function(resp){
	
	include.exports = Compo({
		mode: 'server:all',
		
		scripts: null,
		renderStart: function(model, ctx){
			
			this.include = atma.server.app
				.config
				.$getInclude();
			
			this.scripts = atma.server.app
				.config
				.$getScripts(ctx.page.data.id)
				.map(function(x, index){
					return "'" + x + "'";
				})
				.join(',\n');
				
		},
		toHtml: function(){
			return resp
				.load
				.dev
				.replace('%CFG%', JSON.stringify(this.include.cfg))
				.replace('%INCLUDE%', this.include.src)
				.replace('%SCRIPTS%', this.scripts);
		}
	});
	

});