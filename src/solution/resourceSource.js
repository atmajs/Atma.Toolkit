include.js({
    helper: 'referenceHelper::refHelper'
}).done(function(resp) {

    include.exports = {
        action: function(type, done) {
            switch (type) {
            case 'project-import':
                importResources() && rewriteRoutes('reference','import');
                break;
            case 'project-reference':
                rewriteRoutes('import','reference');
                break;
            default:
                console.error('Unknown Resource Type');
                break;
            }
            
            done && done();
        }
    }

    
    var rewriteRoutes = function(from, to) {
        global
            .parser
            .html
            .rewriteUrls(global.solution.resource, '.' + from + '/', '.' + to + '/');
        
        var routes = new io.File(global.solution.uri.combine('include.routes.js'));
        if (routes.exists()) {
            var source = routes.read();
            source = source.replace(new RegExp('([\'"]{1}[\s]*\/?)\.' + from + '\/', 'g'), '$1.' + to + '/');
            routes.write(source);
        }

        new io
            .File(global.solution.resource.uri)
            .write(global.solution.resource.content);
    }
  

    var importResources = (function() {
        function processCopy(parent, processed) {
                if (processed == null) processed = {};

                ruqq.arr.each(parent.includes, function(x) {
                    if (processed[x.uri.toString()]) return;

                    if (x.uri.path.indexOf('/.reference/') > -1) {
                        var uri;
                        uri = x.uri.combine('');
                        uri.path = uri.path.replace(/\/\.reference\//, '/.import/');

                        new io.File(x.uri).copyTo(uri);

                        x.rewrite = uri.toRelativeString(io.env.currentDir);
                        processed[x.uri.toString()] = x;
                    }

                    processCopy(x, processed);
                });
                return processed;
            };

        return function() {
            processCopy(global.solution.resource);
            return 1;
        };
    })();

});