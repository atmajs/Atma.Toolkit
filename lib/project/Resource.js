void
function() {

    var w = window,
        r = ruqq;

    w.Resource = Class({
        //Base: Include,
        Construct: function(includeData, parent) {
            
            var _type = includeData.type,
                _url = includeData.url,
                _namespace = includeData.namespace,
                _uri = includeData.uri; // ?optional


            this.type = _type;
            this.namespace = _namespace;




            this.uri = _uri || urlhelper.resolveUri(_url, parent && parent.directory);
            this.appuri = urlhelper.resolveAppUri(_url, parent && parent.appuri);

            console.log('R:', _url);

            this.url = _url;

            this.location = w.urlhelper.getDir(this.appuri);
            this.directory = w.urlhelper.getDir(this.uri.toString());

            var id;
            if (_namespace) id = _namespace;
            else if (_url[0] == '/') id = _url;
            else if (parent && parent.namespace) id = parent.namespace + '/' + _url;
            else if (parent && parent.location) id = '/' + parent.location.replace(/^[\/]+/, '') + _url;
            else id = '/' + _url;
            this.id = id;



            this.idfr = parent;
            this.includes = [];
            this.index = -1;


        },
        onload: function(source) {
            if (typeof source === 'object' && source.load) source = source.load[0];

            if (!source) {
                console.error('Page cannt be loaded', this.url);
                this.idfr.resolve(this);
                return;
            }
            this.source = source;

            switch (this.type) {
            case 'html':
            case 'js':
                if (this.type == 'js' && this.url.indexOf('include.js') > -1) break;

                var includes = w.parser[this.type].extractIncludes(source, solution.directory, solution.variables);

                this.includes = r.arr.map(includes, function(x){
                    return new Resource(x, this);
                }.bind(this));
                
                break;
            case 'css':
            case 'load':
            case 'lazy':
                this.idfr.resolve(this);
                return;
            default:
                throw new Error('Builder: resource of unknown type' + this.type);
                break;
            }

            this.process();
        },
        process: function() {
            if (this.source == null) {
                w.xhr.load(this.uri.toLocalFile(), this.onload.bind(this));
                return;
            }
            if (++this.index > this.includes.length - 1) {
                this.idfr.resolve(this);
                return;
            }
            this.includes[this.index].process();
        },
        resolve: function(resource) {
            this.process();
        }
    });
}();