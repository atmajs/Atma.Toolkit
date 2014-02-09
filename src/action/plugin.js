
include
	.js(
		'/src/cli/Shell.js'
	)
	.done(function(resp){
		include.exports = {
			
			help : {
				description: 'Install Atma Plugins to the CWD or to the global Atma path',
			},
			
			strategy: {
				
				'^install/:pluginName??:global(g|global)': function(params, config, done){
				
					var pluginName = params.pluginName,
						global = params.global;
					
					if (global) {
						
						install_npmGlobal(pluginName, function(code){
							
							if (code === 0) 
								install_writeMetaGlobal(pluginName);
							
							done(code);	
						})
						
						return;
					}
					
					
					install_npmLocal(pluginName, function(code){
						
						if (code === 0) 
							install_writeMetaLocal(pluginName);
						
						done(code);
					});
					
				}
			}
		};
		
		

		
				
		function install_writeMetaLocal(pluginName){
			
			var file = new io.File('package.json'),
				package_ = {};
			if (file.exists()) 
				package_ = file.read();
			
			if (package_.dependencies == null) 
				package_.dependencies = {};
			
			package_.dependencies[pluginName] = '>0.0.0';
			
			if (package_.atma == null) 
				package_.atma = {};
			
			if (package_.atma.plugins == null) 
				package_.atma.plugins = [];
				
			if (package_.atma.plugins.indexOf(pluginName) === -1) 
				package_.atma.plugins.push(pluginName);
				
			file.write(package_);
		}
		
		function install_writeMetaGlobal(pluginName) {
			app.config.$write({
				plugins: [ pluginName ]
			});
		}
		
		function install_npmLocal(pluginName, done){
			
			new resp
				.Shell({
					command: 'npm install --save ' + pluginName
				}, done)
				.process()
				;
		}
		
		function install_npmGlobal(pluginName, done){
			
			var path = io.env.applicationDir.toLocalDir();
			
			new resp
				.Shell({
					command: 'npm install ' + pluginName,
					cwd: path
				}, done)
				.process()
				;
		}
		
	});

