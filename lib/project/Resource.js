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
            else id = this.appuri;//'/' + _url;
            this.id = id;



            this.idfr = parent;
            this.includes = [];
            this.index = -1;


        },
        
        load: function(){
            var file = new io.File(this.uri);
            if (file.exists() == false){
                console.log('File Not Exists - ', this.uri.toLocalFile());
                return;
            }
            
            this.source = file.read();
            
            switch (this.type) {
            case 'html':
            case 'js':
                if (this.type == 'js' && this.url.indexOf('include.js') > -1) break;

                var includes = w.parser[this.type].extractIncludes(this.source, solution.directory, solution.variables);

                this.includes = r.arr.map(includes, function(x){
                    return new Resource(x, this);
                }.bind(this));
                
                break;
            case 'css':
            case 'load':
            case 'lazy':                
                return;
            default:
                throw new Error('Builder: resource of unknown type' + this.type);
                break;
            }
            
            r.arr.invoke(this.includes, 'load');
            
        }
    });
}();