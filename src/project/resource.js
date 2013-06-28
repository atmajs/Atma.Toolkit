include.js({
    parser: ['html::HTML', 'js.ast::JS'],
    server: 'controllers/static-reference::RefPath'
}).done(function(resp) {


    var __cache = {};
    
    var Resource = Class({
        Construct: function(includeData, parent) {

            var _type = includeData.type,
                _url = includeData.url,
                _namespace = includeData.namespace,
                _uri = includeData.uri,
                _parentLocation = parent && parent.directory,
                _parentAppUri = parent && parent.appuri; // ?optional


            this.type = _type;
            this.namespace = _namespace;
            
            this.uri = _uri || path_resolveUri(_url, _parentLocation, solution.directory);
            this.appuri = path_resolveAppUri(_url, _parentAppUri);



            console.log('R:', this.appuri);

            if (__cache[this.appuri])
                return __cache[this.appuri];
            

            __cache[this.appuri] = this;
            

            this.url = this.appuri;
            this.location = path_getDir(this.appuri);
            this.directory = path_getDir(this.uri.toString());
            this.id = this.appuri;
            
            this.includes = [];
            this.index = -1;

            return this;
        },

        load: function(){

            if (this.content)
                return this;
            

            var file = new io.File(this.uri);
            
            if (!file.exists()) 
                file = new io.File(resp.RefPath(this.uri.toLocalFile()));
            
            
            if (file.exists() === false){
                console.log('404 - '.red.bold, this.uri.toLocalFile());
                return this;
            }

            this.content = file.read();
            
            var that = this,
                includes = null;

            switch (this.type) {
            case 'html':
                includes = resp.HTML.extractIncludes(this.content, solution.directory, solution.variables);
                
                this.includes = includes.map(function(x){
                    return new Resource(x, that);
                });
                
                break;
            case 'js':
                
                includes = resp.JS.extractIncludes(this, solution.directory, solution.variables);

                this.includes = includes.map(function(x){
                    return new Resource(x, that);
                });

                break;
            case 'css':
            case 'load':
            case 'lazy':
                return this;
            default:
                throw new Error('Builder: resource of unknown type' + this.type);
                break;
            }

            ruqq.arr.invoke(this.includes, 'load');

            return this;
        },
        Static: {
            getResource: function(appuri){
                return __cache[appuri];
            },
            clearCache: function(path){

                if (!path){
                    __cache = {};
                    return;
                }

                for (var key in __cache){
                    var resource = __cache[key];
                    if (resource.uri.toLocalFile().toLowerCase() === path.toLowerCase()){
                        delete __cache[key];
                        return;
                    }
                }

            }
        }
    });


    include.exports = Resource;
});
