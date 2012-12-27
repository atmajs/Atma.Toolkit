include.js({
    helper: 'referenceHelper::refHelper'
}).done(function(resp) {

    include.exports = {
        action: function(type, idfr) {
            switch (type) {
            case 'project-import':
                importResources() && rewriteRoutes('reference','import');
                break;
            case 'project-reference':
                referenceResources() && rewriteRoutes('import','reference');
                break;
            default:
                console.error('Unknown Resource Type');
                break;
            }
            
            idfr.resolve && idfr.resolve();
        }
    }

    
    var rewriteRoutes = function(from, to) {
        global.parser.html.rewriteUrls(global.solution.resource, '.' + from + '/', '.' + to + '/');
        var routes = new io.File(global.solution.uri.combine('include.routes.js'));
        if (routes.exists()) {
            var source = routes.read();
            source = source.replace(new RegExp('([\'"]{1}[\s]*\/?)\.' + from + '\/', 'g'), '$1.' + to + '/');
            routes.write(source);
        }

        new io.File(global.solution.resource.uri).write(global.solution.resource.content);
    }
    
    var referenceResources = (function(){
        
        return function(){
            var globals = JSON.parse(new io.File(io.env.applicationDir.combine('globals.txt')).read()),
                referenceDir = io.env.applicationDir.combine('.reference/');
            
            var routes = new io.File(io.env.currentDir.combine('include.routes.js')),
                includeRoutes;
            if (routes.exists() == false){
                console.error('"%s" does not exists', file.uri.toString());
                return 0;
            }


            
            var include = {
                routes: function(cfg){
                    includeRoutes = cfg;
                }
            }          
            try{  
                eval(routes.read());
            }catch(e){};

            if (!includeRoutes){
                console.error('Routes couldnt be parsed');
                return 0;
            }

            routes = includeRoutes;
            
            
            for(var key in routes){
                if (routes[key].indexOf('.import') == -1) continue;
                
                var projectName = routes[key].replace(/^.*\.import\/([^\/]+).+/g,'$1');
                
                if (!projectName || projectName in globals.projects == false){
                    console.error('Project "%s" not defined in globals', projectName);
                    return 0;
                }                
                var reference = new net.URI(globals.projects[projectName].path);
                
                resp.refHelper.create(new net.URI(global.solution.uri.toDir()), projectName, reference)
            }
            
            return 1;
        }
    })();

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