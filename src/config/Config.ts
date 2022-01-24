import alot from 'alot';
import AppCfg from 'appcfg';
import { File, env, settings } from 'atma-io';
import { class_Dfr, class_Uri } from 'atma-utils';
import { TaskSource } from './TaskSource'

declare let global, include, logger;

export const Config = {
    Tasks: TaskSource,
    Utils: {
        config: {
            $resolvePathFromProject: cfg_resolvePathFromProject
        }
    },
    Configs: class {
        data = {
            sync: false,
        }
        config = {}
        async read (rootConfig) {
            let configs = rootConfig.configs;
            if (typeof configs !== 'string') {
                return this;
            }
            let config = await AppCfg.fetch([{
                path: configs
            }]);
            this.config = config.toJSON();
            return this;
        }
    },
    Plugins: class {
        async read (rootConfig){

            let plugins = rootConfig.plugins;
            if (plugins == null || plugins.length === 0) {
                return;
            }

            let base = env.applicationDir
                ;

            function findPath (plugin) {
                let cwd = env.currentDir,
                    uri = new class_Uri(cwd);

                if (plugin[0] === '.' || plugin[0] === '/') {
                    let rel = uri.combine(plugin).toString();
                    if (File.exists(rel)) {
                        return rel.toString();
                    }
                    return null;
                }

                let self = uri.combine(`node_modules/${plugin}/package.json`).toString();
                if (File.exists(self)) {
                    return findPathInPackage (self.toString());
                }
                let atmaPlugin = base.combine(`plugins/${plugin}/package.json`).toString();
                if (File.exists(atmaPlugin)) {
                    return findPathInPackage (atmaPlugin.toString());
                }
                let atmaNodeModules = base.combine(`node_modules/${plugin}/package.json`).toString();
                if (File.exists(atmaNodeModules)) {
                    return findPathInPackage (atmaNodeModules.toString());
                }
                while (uri.path && uri.path !== '/') {
                    uri.cdUp();
                    let packageJson = uri.combine(`node_modules/${plugin}/package.json`).toString();
                    if (File.exists(packageJson)) {
                        return findPathInPackage (packageJson.toString());
                    }
                }
            }
            function findPathInPackage (packagePath) {
                let base = packagePath.substring(0, packagePath.lastIndexOf('/') + 1);
                let path = [
                    `${base}index.js`,
                    `${base}lib/index.js`
                ].find(File.exists);
                if (path) {
                    return path;
                }
                let json = File.read<any>(packagePath);
                let script = typeof json.atmaPlugin === 'string' ? json.atmaPlugin : json.main;
                let pathStr = new class_Uri(base).combine(script).toString();
                if (File.exists(pathStr)) {
                    return pathStr;
                }
                return null;
            }

            await alot(plugins).forEachAsync(async plugin => {
                let url = findPath(plugin);
                if (url == null) {
                    logger
                        .error('<plugin 404>', plugin)
                        .warn('Did you forget to run `npm install %plugin-name%`?')
                        ;
                    return;
                }


                let Plugin = await load(url);
                if (Plugin?.register == null) {
                    logger.error('<plugin> 404 - ', url);
                    return;
                }
                Plugin.register(rootConfig);

            }).toArrayAsync();
        }

        data = {
            sync: true
        }
    },

    Projects: class {

        async read (rootConfig){

            let routes = rootConfig.defaultRoutes;
            let projects = rootConfig.projects;

            for (let key in routes) {
                let path = routes[key];
                let projectName = /^\{([\w]+)\}/.exec(path)?.[1];

                if (!projectName) {
                    continue;
                }

                routes[key] = path.replace('{' + projectName + '}', '/.reference/' + projectName);

                if (projects[projectName] == null) {
                    logger.error('<config> projects - unknown project in default routes - ', projectName);
                }
            }
            projects['atma_toolkit'] = {
                path: env.applicationDir.toString()
            };
            return this;
        }

        data = {
            sync: true
        }
    },

    Settings: class {
        async read (rootConfig){
            if (rootConfig.settings) {
                if (rootConfig.settings.io) {
                    settings(rootConfig.settings.io);
                }
                if (rootConfig.settings.include) {
                    include.cfg(rootConfig.settings.include);
                }
            }
            return this;
        }

        data = {
            sync: true
        }
    }
};


// Private

function cfg_resolvePathFromProject(path) {
     if (!path || path[0] !== '{')
        return path;

    let config = this;

    let match = /\{([\w]+)\}\//.exec(path),
        projectName = match && match[1],
        project = config.projects[projectName],
        projectPath = project && project.path;

    if (!projectPath) {
        logger.error('<config> Project could be not resolved - ', path);
        return path;
    }

    path = path.substring(match[0].length);

    return class_Uri.combine(projectPath, path);
}

async function load (path: string): Promise<any> {
    return new Promise(resolve => {
        include
            .instance(path)
            .js(path + '::Plugin')
            .done(resp => {
                resolve(resp.Plugin);
            });
    });
}
