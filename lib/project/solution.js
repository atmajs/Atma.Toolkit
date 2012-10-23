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
                outputSources: config.action ? '.import/' : '#{name}.build/',                
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
            this.resource.process();
            return this;
        },
        resolve: function(sender) {
            if (sender == this.resource) {

                if (this.config.action == "import") {
                   
                    w.action.importer.importResources(this);
                    return;
                }
                
                
                w.action.builder.build(this);
                
                if (this.config.minify) {
                    var ast = jsp.parse(this.output.js);
                    ast = pro.ast_mangle(ast);
                    //-ast = pro.ast_squeeze(ast);
                    
                    this.output.js = pro.gen_code(ast);
                    this.output.css = cssmin(this.output.css);
                }
                
                if (this.resource.type == 'html') {
                    HtmlDocument.createSolutionHtml(this, this.output);
                }
                
                this.save();
                this.idfr && this.idfr && this.idfr.resolve(this);
            }
        },
        save: function() {
            
            if (this.output.js){
                app.service('io', 'file/save', {
                    content: this.output.js,
                    path: this.uris.outputDirectory.combine('script.js').toLocalFile()
                });
            }

            if (this.output.css) {
                app.service('io', 'file/save', {
                    content: this.output.css,
                    path: this.uris.outputDirectory.combine('style.css').toLocalFile()
                });
            }

            if (this.type == 'html') {
                app.service('io', 'file/save', {
                    content: this.output.html,
                    path: this.uris.outputMain.toLocalFile()
                });
            }

        }
    });
});