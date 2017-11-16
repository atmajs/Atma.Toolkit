var TaskSource = require('./TaskSource');


module.exports = {
    Tasks: TaskSource,
    Utils: {
        config: {
            $resolvePathFromProject: cfg_resolvePathFromProject
        }
    },
    Plugins: Class({
        Base: Class.Deferred,
        read: function(rootConfig){
            
            var plugins = rootConfig.plugins;
            if (plugins == null || plugins.length === 0) 
                return this.resolve();
            
            var await = new Class.Await(),
                base = io.env.applicationDir.toString() + '/'
                ;
            
            plugins.forEach(function(plugin){
                
                var resolve = await.delegate(),
                    url = String.format('%1plugins/%2/%2-plugin.js', base, plugin)
                    ;
                    
                if (io.File.exists(url) === false) {
                    url = String.format('%1node_modules/%2/index.js', base, plugin);
                    
                    if (io.File.exists(url) === false) {
                        var cwd = io.env.currentDir,
                            uri = new net.Uri(cwd);

                        if (plugin[0] === '.' || plugin[0] === '/') {
                            url = net.Uri.combine(cwd, plugin);
                            if (io.File.exists(url) === false) {
                                url = null;
                            }
                        }
                        else {
                            while (true){
                                url = uri
                                    .combine('node_modules/' + plugin + '/index.js')
                                    .toString();
                                
                                if (io.File.exists(url))
                                    break;
                                
                                if (!uri.path || uri.path === '/') {
                                    url = null;
                                    break;
                                }
                                
                                uri = uri.combine('../')
                            }
                        }
                        
                        if (url == null) {
                            logger
                                .error('<plugin 404>', plugin)
                                .warn('Did you forget to run `npm install %plugin-name%`?')
                                ;
                            resolve();
                            return;
                        }
                    }
                }
                
                include
                    .instance(url)
                    .js(url + '::Plugin')
                    .done(function(resp) {
                    
                    var Plugin = resp.Plugin
                    if (Plugin == null) {
                        logger.error('<plugin> 404 - ', url);
                        resolve();
                        return;
                    }
        
                    Plugin.register(rootConfig);
                    resolve();
                });   
            });
            
            
            await.always(this.resolveDelegate());
        },
        
        data: {
            sync: true
        }
    }),
    
    Projects: Class({
        Base: Class.Deferred,
        
        read: function(rootConfig){
            
            var key, path, projectName;
        
            var routes = rootConfig.defaultRoutes,
                projects = rootConfig.projects
                ;
        
            for (key in routes) {
                path = routes[key];
                projectName = /^\{([\w]+)\}/.exec(path);
        
                if (!projectName || !(projectName = projectName[1])) 
                    continue;
                
        
                routes[key] = path.replace('{' + projectName + '}', '/.reference/' + projectName);
        
                if (projects[projectName] == null) 
                    logger.error('<config> projects - unknown project in default routes - ', projectName);
            }
            
            
            projects['atma_toolkit'] = {
                path: io.env.applicationDir.toString() + '/'
            };
            
            this.resolve();
        },
        
        data: {
            sync: true
        }
    }),
    
    Settings: Class({
        Base: Class.Deferred,
        
        read: function(rootConfig){
            if (rootConfig.settings) {                
                if (rootConfig.settings.io) {
                    io.settings(rootConfig.settings.io);
                }
                if (rootConfig.settings.include) {
                    include.cfg(rootConfig.settings.include);
                }
            }
            this.resolve();
        },
        
        data: {
            sync: true
        }
    })
};


// Private

function cfg_resolvePathFromProject(path) {
     if (!path || path[0] !== '{') 
        return path;
    
    var config = this;
    
    var match = /\{([\w]+)\}\//.exec(path),
        projectName = match && match[1],
        project = config.projects[projectName],
        projectPath = project && project.path;
        
    if (!projectPath) {
        logger.error('<config> Project could be not resolved - ', path);
        return path;
    }
    
    path = path.substring(match[0].length);
    
    return net.Uri.combinePathes(projectPath, path);
}