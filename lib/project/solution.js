include.js('resource.js').done(function(){

    var w = window,
        r = ruqq,
        newLine = sys.newLine;
        
    
    
    w.solution = null;
        
    w.Solution = Class({
        Construct: function(type, uri, config, idfr) {
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
                minify: false,
                mainOutput: '',
                sourceOutput: '{name}.build/',                
                ////////resources: [
                ////////    /**
                ////////     * images/
                ////////     * resources/
                ////////     */
                ////////]
            }
            
            Object.extend(this.config, config);
            
            if (config.sourceOutput == null){
                this.config.sourceOutput = this.config.sourceOutput.replace('{name}', this.uri.file.replace('.' + this.uri.extension, ''));
            }
            
            this.uris = {
              outputDirectory : this.uri.combine(this.config.sourceOutput)
            }
            
            this.idfr = idfr;
        },
        
        _createBin: function(type, stack) {
            this.bin[type] = ruqq.arr.select(stack, ['id', 'url', 'namespace']);
        },
        _buildJavascript: function() {
            var stack = resolveIncludesStack('js', this.resource.includes),
                includeIndex = ruqq.arr.indexOf(stack, function(x) {
                    return x.url.indexOf('include.js') > -1;
                });
            this._createBin('js', stack);

            
            this.output.js = [];
            for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {

                if (i > includeIndex) {
                    var s = String.format( //
                    "var include = new IncludeResource('%1','%2','%3',null,null,'%4')", //
                    x.type, x.namespace ? '' : x.url, x.namespace || '', x.id //
                    );
                    this.output.js.push(s);
                }
                
                this.output.js.push(x.source);
            }
            
            var info = String.format("include.cfg(%1); include.register(%2)", //
            JSON.stringify(window.include.cfg()), //
            JSON.stringify(this.bin));



            this.output.js.splice(includeIndex + 1, 0, info);

            if (this.type == 'js') this.output.push(this.resource.source);

            this.output.js = this.output.js.join(newLine + ';');
        },
        _buildStyles: function() {
            var stack = resolveIncludesStack('css', this.resource.includes);
            this._createBin('css', stack);

            
            this.output.images = [];
            for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {
                
                new handler.CssHandler(solution.uri, solution.uris.outputDirectory.toDir(), x);
                
                var images = w.parser.css.extractImages(this.uri, new w.net.URI(x.url), x.source);
                this.output.images = this.output.images.concat(images);
            }
            
            this.output.css = r.arr.select(stack, 'source').join(newLine);
        },
        _build: function(type) {
            var stack = resolveIncludesStack(type, this.resource.includes);
            if (!stack.length) return;

            this._createBin(type, stack);

            var stream = [];
            for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {
                stream.push(String.format("<script type='include/#{type}' data-appuri='#{appuri}' data-id='#{id}'> #{source} </script>", {
                    type: type,
                    appuri: x.namespace || x.appuri,
                    source: x.source,
                    id: x.id
                }));
            }
            this.output[type] = stream.join(newLine);
        },
        process: function() {
            this.resource.process();
            return this;
        },
        resolve: function(sender) {
            if (sender == this.resource) {
                this.output = {};
                this.bin = {};



                this._buildStyles();
                this._build('lazy');
                this._build('load');

                this._buildJavascript();


                if (this.minify) {
                    var ast = jsp.parse(output.js);
                    ast = pro.ast_mangle(ast);
                    //-ast = pro.ast_squeeze(ast); 

                    this.output.js = pro.gen_code(ast);
                    this.output.css = cssmin(this.output.css);
                }

                if (sender.type == 'html') HtmlDocument.createHtml(this, this.output);
                
                
                this.save();
                this.idfr.resolve(this);
            }
        },
        
        save: function(){
            app.service('io', 'file/save', {
                content: this.output.js,
                path: this.uris.outputDirectory.combine('script.js').toLocalFile()
            });

            if (this.output.css) {
                app.service('io', 'file/save', {
                    content: this.output.css,
                    path: this.uris.outputDirectory.combine('style.css').toLocalFile()
                });
            }
            
            
            if (this.type == 'html') {
                this.uri.file = this.uri.getName() + '.build.' + this.uri.extension;
                
                app.service('io', 'file/save', {
                    content: this.output.html,
                    path: this.uri.toLocalFile()
                });
            }

        }
    });
    
    
    var resolveIncludesStack = (function(){
        
        function build(type, includes){
            if (!includes && !includes.length) return null;
            var arr = [];
            for (var i = 0; i < includes.length; i++) {

                var resource = includes[i];
                var stack = build(type, resource.includes);
                if (stack && stack.length) arr = arr.concat(stack);

                if (resource.type == type) arr.push(resource);
            }
            return arr;
        }
        
        function distinct(stack){
            for (var i = 0; i < stack.length; i++) {
                for (var j = 0; j < i; j++) {
                    if (stack[i].url == stack[j].url) {
                        stack.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
            return stack;
        }
        
        return function(type, includes) {
            var stack = distinct(build(type, includes));
            return type == 'css' ? stack.reverse() : stack;
        }
    })();
});