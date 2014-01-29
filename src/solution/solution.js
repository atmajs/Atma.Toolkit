include
.js('resource.js::Resource')
.done(function(resp) {
    
	if (typeof sln === 'undefined') 
		sln = {};
	
	//@TODO remove globals, but also check dependencies
	
    sln.Solution = global.Solution = Class({
        Construct: function(config, done) {
            /** singleton */
            global.solution = this;
            
            var uri = config.uri,
                type = config.type
				;
                
			if (!uri || new io.File(uri).exists() == false) 
				return done('File doesnt exists (404) ' + uri.toLocalFile());
			
			if (!type) 
				return done('Unknown solution type' + type);

				
            this.directory = uri.toDir();
            this.uri = uri;
            this.type = type;
            this.done = done;
			
			
            this.resource = new resp.Resource({
                type: type,
                url: '/',
                uri: this.uri,
            }, this);


			var cfg = this.config = config;
			
			obj_defaults(cfg, {
				minify: false,
				outputMain: '#{name}.#{action}.#{type}',
                outputSources: '#{name}.build/'
			});
			
			
			cfg.outputSources = path_ensureTrailingSlash(cfg.outputSources);
            
            
            var info = {
                name: uri.getName(),
                action: cfg.action,
                type: type
            }
            
            cfg.outputSources = cfg.outputSources.format(info);
            cfg.outputMain = cfg.outputMain.format(info);
            
            this.uris = {
                outputDirectory: uri.combine(cfg.outputSources),
                outputMain: uri.combine(cfg.outputMain)
            }
            

            if (this.uris.outputMain.toString() === uri.toString()){
                
                console.log(this.uris.outputMain.toString(), uri.toString());
                throw new Error('Processed File has the same path as the original.');
            }
            
            if (config.vars) {
                var arr = [];
                for (var key in config.vars) {
                    arr.push('var %1 = "%2"'.format(key, config.vars[key]));
                }
                this.variables = arr.join(';');
            }

            return 0;
        },

		onbuild: function(fileStats){
			
			var msg;
			msg = 'Files: [JS: #{js}] [CSS: #{css}] [LOAD: #{load}] [LAZY: #{lazy}]';
			msg = msg
				.format(fileStats)
				.bold
				.green;
				
            logger.log(msg);
			
			this.save();

		},
		
		save: function(){
			if (this.output.js) {
				new io
					.File(this.uris.outputDirectory.combine('script.js'))
					.write(this.output.js);
			}

			if (this.output.css) {
				new io
					.File(this.uris.outputDirectory.combine('style.css'))
					.write(this.output.css);
			}
			
			if (this.output.html) {
				new io
					.File(this.uris.outputMain)
					.write(this.output.html);
			}
		},
        
        process: function() {
            this.resource.load();
            
            this.done(this);
            return this;
        },
		
		Static: {
			createEmpty: function(){
				var config = {
					uri: io
							.env
							.currentDir
							.combine('/index.js'),
					type: 'js'
				};
				
				return new sln.Solution(config);
			}
		}
    });    
});