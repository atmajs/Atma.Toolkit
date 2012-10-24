include.js('resource.js').done(function() {

    var w = window,
        r = ruqq,
        newLine = sys.newLine;



    w.Solution = Class({
        Construct: function(type, uri, config, idfr) {
            w.solution = this;
            
            if (!config) config = {};

            this.directory = uri.toDir();
            this.uri = uri;
            this.type = type;

            this.resource = new Resource({
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


            this.idfr = idfr;
            
            
            config = w.include.cfg();
            for(var key in config) delete config[key];
        },

        
        process: function() {
            //-this.resource.process();
            this.resource.load();
            
            this.idfr && this.idfr && this.idfr.resolve(this);
            return this;
        }
    });    
});