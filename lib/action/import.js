void

function() {

    var w = window,
        _uri, _outputDirectory, _config;

    include.promise('action').importer = {
        importResources: function(solution) {
            _uri = solution.uri;
            _outputDirectory = solution.uris.outputDirectory;
            _config = solution.config;
         
         
            var processed = processCopy(solution.resource);
            
            
            w.parser.html.rewriteUrls(solution.resource, processed);
            
            solution.output = {
                html: solution.resource.source
            }
            
            solution.save();
        }
    }



    var processCopy = function(parent, processed) {
        if (!parent.includes) return null;

        var outer;
        if (processed == null) {
            outer = true;
            processed = {};
        }


        var resources = parent.includes,
            files = [],
            basepath = _uri.toString(),
            destination = _outputDirectory;


        for (var i = 0, x, length = resources.length; x = resources[i], i < length; i++) {            
            
            if (processed[x.uri.toString()]) continue;            
            if (w.urlhelper.isSubDir(basepath, x.uri.toString()) == false) {
                var path = x.url,
                    namespace = x.namespace;


                var key = namespace,
                    value, path = null;

                if (key) {
                    while (key.length && w.include.cfg(key) == null) {
                        var index = key.lastIndexOf('.');
                        if (index == -1) index = 0;
                        key = key.substring(0, index);
                    }
                    value = namespace.replace(key + '.', '');
                    path = new net.URI(key + '/' + x.uri.file);

                }
                if (!path && parent.path) {
                    var relative = x.uri.toRelativeString(parent.uri);
                    if (relative) {
                        path = parent.path.combine(relative);
                    }

                    if (!path) {
                        var directory = w.urlhelper.getDir(parent.path);
                        path = net.URI.combine(directory, x.uri.file);
                        path = new net.URI(path);
                    }
                }


                if (!path) {
                    path = new net.URI(x.uri.file);
                }

                x.path = path;
                x.rewrite = net.URI.combine(_config.outputSources, x.path.toString());
                x.rewrite = x.rewrite.replace(/^[\/\s]+/, '');

                var copyTo = destination.combine(path);



                processed[x.uri.toString()] = x;

                handler.io.FileCopier.copySync(x.uri, copyTo);

                if (x.type == 'css') {
                    var images = new w.handler.CssHandler(solution.uri, copyTo.toDir(), x);
                    if (images && images.length) {
                        (new w.handler.io.FileCopier()).copySync(images);
                    }
                }
            }


            x.parent = parent;

            processCopy(x, processed);
        }
        
        return processed;
        
    }
}();