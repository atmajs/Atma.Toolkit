void
function() {
    
    include.promise('parser').Loader = Class({
        Construct: function(uri, mainFile) {
            
            var source = app.service('io', 'file/readSync', {
                file: uri.toLocalFile()
            });
            
            var includes = [];
            
            function BUILDER_LOAD(url, callback) {
                
                includes.push({
                    type: 'js',
                    url: url
                });
                
                callback && callback();
            }


            var config = eval(source);

            window.include.cfg(config);
            
            includes.push({
                type: 'js',
                url: mainFile
            });
            
            
            this.config = config;
            this.includes = includes;
        }
    });
}();