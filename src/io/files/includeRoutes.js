void
function() {

    var fs = require('fs');

    io.File.getFactory().registerHandler(/include\.routes\.js$/g, Class({
        Base: io.File,
        copyTo: function(uri){
            var source = this.read(),
                globals = JSON.parse(new io.File(io.env.applicationDir.combine('globals.txt')).read()),
                referenceDir = uri.combine('.reference/'),
                projects = {};
            
            for(var key in globals.defaultRoutes){
                var path = globals.defaultRoutes[key];
                
                var projectName = /^\{[\w]+\}/.exec(path);
                if (!projectName || !(projectName = projectName[0])) continue;

                projectName = projectName.replace(/[\{\}]/g,'');
                
                globals.defaultRoutes[key] = path.replace('{' + projectName + '}', '/.reference/' + projectName);
                
                if (projects[projectName] != null)  continue;
                
                
                var item = globals.projects[projectName];
                if (!(item && item.path)) {
                    throw new Error('Unknown Project - ' + projectName);
                }
                
                projects[projectName]  = new net.URI(item.path);                
            }
            
            for(var key in projects){
                var folder = referenceDir.toLocalDir();
                if (fs.existsSync(folder) == false) {
                    fs.mkdirSync(folder);
                }
                
                var target = referenceDir.combine(key + '/').toLocalDir();
                if (fs.existsSync(target)) {
                    console.warn('Warn - Dir exists -', target);
                    continue;
                }
            
                fs.symlinkSync(projects[key].toLocalDir(), target, 'dir');                
            }
            
            new io.File(uri).write(source.replace('%ROUTES%', JSON.stringify(globals.defaultRoutes, null, 5)));
        }
    }));    
}();

