include.js('resource.js').done(function() {

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
                file: '',
                
                vars: {
                    /** Variables */
                },
                
                action: 'build',
                
                minify: false,
                outputMain: '#{name}.#{action}.#{type}',
                outputSources: '#{name}.build/',
                
                
                
                ////////resources: [
                ////////    /**
                ////////     * images/
                ////////     * resources/
                ////////     */
                ////////]
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
                throw new Error('Processed File has same path as the original.');
            }
            
            if (config.vars) {
                var arr = [];
                for (var key in config.vars) {
                    arr.push(String.format('var %1 = "%2"', key, config.vars[key]));
                }
                this.variables = arr.join(';');
            }


            this.idfr = idfr;
        },

        _createBin: function(type, stack) {
            this.bin[type] = ruqq.arr.select(stack, ['id', 'url', 'namespace']);
        },
        _buildJavascript: function() {
            var stack = includesStack.resolve('js', this.resource.includes),
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
            var stack = includesStack.resolve('css', this.resource.includes);
            this._createBin('css', stack);


            this.output.images = [];
            for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {

                var images = new handler.CssHandler(solution.uri, solution.uris.outputDirectory.toDir(), x);

                if (images && images.length) {
                    (new handler.io.FileCopier()).copySync(images);
                }
            }

            this.output.css = r.arr.select(stack, 'source').join(newLine);
        },
        _build: function(type) {
            var stack = includesStack.resolve(type, this.resource.includes);
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

                if (this.config.action == "copy") {
                    this.copyOnly(this.resource);
                    return;
                }

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

                if (this.resource.type == 'html') HtmlDocument.createHtml(this, this.output);


                this.save();
                this.idfr.resolve(this);
            }
        },

        copyOnly: function(parent, processed) {
            if (!parent.includes) return;
            
            var outer;
            if (processed == null) {
                outer = true;
                processed = {};
            }


            var resources = parent.includes,
                files = [],
                basepath = this.uri.toString(),
                destination = this.uris.outputDirectory;
                
            
            for (var i = 0, x, length = resources.length; x = resources[i], i < length; i++) {
                if (urlhelper.isSubDir(basepath, x.uri.toString()) == false) {
                    var path = x.url,
                        namespace = x.namespace;


                    var key = namespace,
                        value,
                        path = null;

                    if (key) {
                        while (key.length && include.cfg(key) == null) {
                            var index = key.lastIndexOf('.');
                            if (index == -1) index = 0;
                            key = key.substring(0, index);
                        }
                        value = namespace.replace(key + '.', '');
                        
                        //console.log('uri', key, value);
                        
                        path = new net.URI(key + '/' + x.uri.file);
                        
                    }
                    if (!path && parent.path){
                        var relative = x.uri.toRelativeString(parent.uri);
                        if (relative){
                            path = parent.path.combine(relative);
                        }
                        
                        if (!path){
                            var directory = urlhelper.getDir(parent.path);
                            path = net.URI.combine(directory, x.uri.file);
                            path = new net.URI(path);
                        }
                    }                        
                
                    
                    if (!path) {                        
                        path = new net.URI(x.uri.file);
                    }
                    
                    x.path = path;
                    x.rewrite = net.URI.combine(this.config.outputSources, x.path.toString());
                    x.rewrite = x.rewrite.replace(/^[\/\s]+/,'');
                    
                    var copyTo = destination.combine(path);
                    
                    
                    
                    processed[x.uri.toString()] = x;
                    
                    handler.io.FileCopier.copySync(x.uri, copyTo);
                    
                    if (x.type == 'css'){                        
                        var images = new handler.CssHandler(solution.uri, copyTo.toDir(), x);
                        if (images && images.length) {
                            (new handler.io.FileCopier()).copySync(images);
                        }
                    }                    
                }
                
                
                x.parent = parent;
                this.copyOnly(x, processed);
            }
            
            
            if (outer){                
                parser.html.rewriteUrls(parent, processed);
                
                app.service('io', 'file/save',{
                    content: parent.source,
                    path: this.uris.outputMain.toLocalFile()
                });
            }
            
        },
        save: function() {
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


    var includesStack = (function() {

        function build(type, includes) {
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

        function distinct(stack) {
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

        function resolve(type, includes) {
            var stack = distinct(build(type, includes));
            return type == 'css' ? stack.reverse() : stack;
        }

        return {
            resolve: resolve,
            distinct: distinct
        }
    })();
});