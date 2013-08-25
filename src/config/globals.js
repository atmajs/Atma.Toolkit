
var __path = io.env.applicationDir.toString() + '/',
    __globals;

include
    .load('/globals/projects.txt')
    .done(function(resp) {

    __globals = JSON.parse(resp.load.projects);
    __globals.resolvePathFromProject = resolvePathByProject;
    
    include.exports = function(app, done) {
        
        prepairProjects(__globals);
        prepairPlugins(__globals, app.config);
    

        done({
            globals: __globals
        });
    };
});


function resolvePathByProject(path){
    if (!(path && path[0] === '{')) {
        return path;
    }
    
    var match = /\{([\w]+)\}\//.exec(path),
        projectName = match && match[1],
        project = __globals.projects[projectName],
        projectPath = project && project.path;
        
    if (!projectPath) {
        console.error('Project could be not resolved - ', path);
        return path;
    }
    
    path = path.substring(match[0].length);
    
    return net.Uri.combinePathes(projectPath, path);
};

function prepairPlugins(globals, config) {
    
    if (globals.plugins == null) {
        return;
    }


    ruqq.arr.each(globals.plugins, function(plugin) {
        var url = String.format('%1plugins/%2/%2-plugin.js', __path, plugin);
        include.js(url + '::Plugin')
            .done(function(resp) {

            if (resp.Plugin == null) {
                logger.error('<plugin> 404 - ', url);
                return;
            }

            resp.Plugin.register(config);
        });
    });

}


function prepairProjects(globals) {
    var key, path, projectName;

    var globals_routes = globals.defaultRoutes,
        globals_projects = globals.projects;

    for (key in globals_routes) {
        path = globals_routes[key];
        projectName = /^\{([\w]+)\}/.exec(path);

        if (!projectName || !(projectName = projectName[1])) {
            continue;
        }

        globals_routes[key] = path.replace('{' + projectName + '}', '/.reference/' + projectName);

        if (globals_projects[projectName] == null) {
            console.error('projects.txt - unknown project in default routes - ', projectName);
        }

    }
    
    
    globals_projects['atma.toolkit'] = {
        path: __path
    };


}