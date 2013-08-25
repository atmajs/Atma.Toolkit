include
	.js('atma.js')
	.done(function(resp) {
	
		include.exports = {
			process: function(url, scripts) {
				if (scripts == null) {
					scripts = [];
				}
				
				resp.atma.process(url, scripts);
	
				
				/**
				 *
				 * @TODO - implement project resource loader
				 * 
				 * */
				
				scripts.push({
					script: 'var TEST = 10'
				});
				
				
				return scripts;
			}
		};
	
	
	});