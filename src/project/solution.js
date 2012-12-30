include.js('resource.js::Resource').done(function(resp) {

    var r = ruqq,
        newLine = sys.newLine;


    

    global.Solution = Class({
        Construct: function(config, idfr) {
            /** singleton */
            global.solution = this;
            
            var uri = config.uri,
                type = config.type;
                
			if (!uri || new io.File(uri.toLocalFile()).exists() == false) {
				console.error('File doesnt exists (404)', uri.toLocalFile());
                idfr.resolve(1);
				return;
			}
			if (!type) {
				console.error('Unknown solution type', type);
                idfr.resolve(1);
				return;
			}

            this.directory = uri.toDir();
            this.uri = uri;
            this.type = type;
            this.idfr = idfr;

            this.resource = new resp.Resource({
                type: type,
                url: '/',
                uri: this.uri,
            }, this);


            this.config = {
                file: '',
                
                vars: {
                    /** Variables */
                },
                
                action: 'build',
                
                minify: false,
                outputMain: '#{name}.#{action}.#{type}',
                outputSources: '#{name}.build/',                
            }

            Object.extend(this.config, config);
            
            if (this.config.outputSources[this.config.outputSources.length - 1] != '/') {
                this.config.outputSources += '/';
            }
            
            var info = {
                name: this.uri.file.replace('.' + this.uri.extension, ''),
                action: this.config.action,
                type: this.type
            }
            
            this.config.outputSources = String.format(this.config.outputSources, info);
            this.config.outputMain = String.format(this.config.outputMain, info);
            
            this.uris = {
                outputDirectory: this.uri.combine(this.config.outputSources),
                outputMain: this.uri.combine(this.config.outputMain)
            }
            

            if (this.uris.outputMain.toString() == this.uri.toString()){
                
                console.log(this.uris.outputMain.toString(), this.uri.toString());
                throw new Error('Processed File has the same path as the original.');
            }
            
            if (config.vars) {
                var arr = [];
                for (var key in config.vars) {
                    arr.push(String.format('var %1 = "%2"', key, config.vars[key]));
                }
                this.variables = arr.join(';');
            }

            console.log('Solution Ready');
        },

        
        process: function() {
            this.resource.load();
            
            this.idfr && this.idfr && this.idfr.resolve(this);
            return this;
        }
    });    
});