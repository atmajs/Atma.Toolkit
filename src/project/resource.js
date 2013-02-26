include.js({
    parser: ['html::HTML', 'js.ast::JS']
}).done(function(resp) {


    var ruqq = global.ruqq,
        cache = {},
        Resource = Class({
        Construct: function(includeData, parent) {

            var _type = includeData.type,
                _url = includeData.url,
                _namespace = includeData.namespace,
                _uri = includeData.uri; // ?optional


            this.type = _type;
            this.namespace = _namespace;


            this.uri = _uri || urlhelper.resolveUri(_url, parent && parent.directory);
            this.appuri = urlhelper.resolveAppUri(_url, parent && parent.appuri);



            console.log('R:', this.appuri);

            if (cache[this.appuri]){
                return cache[this.appuri];
            }

            cache[this.appuri] = this;

            this.url = this.appuri;//_url;

            this.location = global.urlhelper.getDir(this.appuri);
            this.directory = global.urlhelper.getDir(this.uri.toString());


            this.id = this.appuri;

            this.idfr = parent;
            this.includes = [];
            this.index = -1;

            return this;
        },

        load: function(){

            if (this.content){
                return this;
            }

            var file = new io.File(this.uri);
            if (file.exists() == false){
                console.log(color('red{bold{404 - }}'), this.uri.toLocalFile());
                return this;
            }

            this.content = file.read();

            switch (this.type) {
            case 'html':
                this.includes = ruqq.arr.map(resp.HTML.extractIncludes(this.content, solution.directory, solution.variables), function(x){
                    return new Resource(x, this);
                }.bind(this));
                break;
            case 'js':
                ////if (this.type == 'js' && this.url.indexOf('include.js') > -1) {
                ////    break;
                ////}

                var includes = resp.JS.extractIncludes(this, solution.directory, solution.variables);

                this.includes = ruqq.arr.map(includes, function(x){
                    return new Resource(x, this);
                }.bind(this));

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
                return cache[appuri];
            },
            clearCache: function(path){

                if (!path){
                    cache = {};
                    return;
                }

                for (var key in cache){
                    var resource = cache[key];
                    if (resource.uri.toLocalFile().toLowerCase() === path.toLowerCase()){
                        delete cache[key];
                        return;
                    }
                }

            }
        }
    });


    include.exports = Resource;
});
