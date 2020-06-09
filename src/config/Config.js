var TaskSource = require('./TaskSource');
var AppCfg = require('appcfg');

module.exports = {
    Tasks: TaskSource,
    Utils: {
        config: {
            $resolvePathFromProject: cfg_resolvePathFromProject
        }
    },
    Configs: Class({
        Base: Class.Deferred,
        data: {
            sync: false,
        },
        config: {},
        read: function(rootConfig){
            let configs = rootConfig.configs;
            if (typeof configs !== 'string') {
                this.resolve();
                return;
            }
            AppCfg.fetch([{
                path: configs
            }]).done((config) => {
                this.config = config.toJSON();
                this.resolve();
            })
        }
    }),
    Plugins: Class({
        Base: Class.Deferred,
        read: function(rootConfig){

            var plugins = rootConfig.plugins;
            if (plugins == null || plugins.length === 0)
                return this.resolve();

            var await = new Class.Await(),
                base = io.env.applicationDir
                ;

            function findPath (plugin) {
                var cwd = io.env.currentDir,
                    uri = new net.Uri(cwd);

                if (plugin[0] === '.' || plugin[0] === '/') {
                    let rel = uri.combine(plugin);
                    if (io.File.exists(rel)) {
                        return rel.toString();
                    }
                    return null;
                }

                let self = uri.combine(`node_modules/${plugin}/package.json`);
                if (io.File.exists(self)) {
                    return findPathInPackage (self.toString());
                }
                let atmaPlugin = base.combine(`plugins/${plugin}/package.json`);
                if (io.File.exists(atmaPlugin)) {
                    return findPathInPackage (atmaPlugin.toString());
                }
                let atmaNodeModules = base.combine(`node_modules/${plugin}/package.json`);
                if (io.File.exists(atmaNodeModules)) {
                    return findPathInPackage (atmaNodeModules.toString());
                }
                while (uri.path && uri.path !== '/') {
                    uri.cdUp();
                    let packageJson = uri.combine(`node_modules/${plugin}/package.json`);
                    if (io.File.exists(packageJson)) {
                        return findPathInPackage (packageJson.toString());
                    }
                }
            }
            function findPathInPackage (packagePath) {
                let base = packagePath.substring(0, packagePath.lastIndexOf('/') + 1);
                let path = [
                    `${base}index.js`,
                    `${base}lib/index.js`
                ].find(io.File.exists);
                if (path) {
                    return path;
                }
                let json = io.File.read(packagePath);
                let script = typeof json.atmaPlugin === 'string' ? json.atmaPlugin : json.main;

                path = new net.Uri(base).combine(script);
                if (io.File.exists(path)) {
                    return path;
                }
                return null;
            }

            plugins.forEach(function(plugin){

                let resolve = await.delegate();
                let url = findPath(plugin);
                if (url == null) {
                    logger
                        .error('<plugin 404>', plugin)
                        .warn('Did you forget to run `npm install %plugin-name%`?')
                        ;
                    resolve();
                    return;
                }

                include
                    .instance(url)
                    .js(url + '::Plugin')
                    .done(function(resp) {

                    var plugin = resp.Plugin && resp.Plugin.default || resp.Plugin;
                    if (plugin == null || plugin.register === null) {
                        logger.error('<plugin> 404 - ', url);
                        resolve();
                        return;
                    }
                    plugin.register(rootConfig);
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
                path: io.env.applicationDir.toString()
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
