;(function() {

    var ruqq = global.ruqq,
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

            this.url = _url;

            this.location = global.urlhelper.getDir(this.appuri);
            this.directory = global.urlhelper.getDir(this.uri.toString());

            
            this.id = this.appuri;
            
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

                var includes = global.parser[this.type].extractIncludes(this.source, solution.directory, solution.variables);

                this.includes = ruqq.arr.map(includes, function(x){
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
            
            ruqq.arr.invoke(this.includes, 'load');
            
        }
    });
    
    
    include.exports = Resource;
})();