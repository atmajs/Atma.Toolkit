include.js({
	helper: ['stdout', 'globals::Projects']
}).done(function(resp) {

    var fs = require('fs'),
        color = resp.stdout.color;

	
    io.File.getFactory().registerHandler(/include\.routes\.js$/g, Class({
        Base: io.File,
        copyTo: function(uri){
            var source = this.read(),
                globals = resp.Projects(),
                referenceDir = uri.combine('.reference/');

			if (!globals || !globals.projects) {
				console.warn('globals.txt errored - include.routes wont be copied');
				return;
			}
				
			var projects = globals.projects,
				key;

            for(key in projects){
                
				var folder = referenceDir.toLocalDir();
                if (fs.existsSync(folder) == false) {
                    fs.mkdirSync(folder);
                }

                var target = referenceDir.combine(key + '/').toLocalDir();
                if (fs.existsSync(target)) {
                    console.warn(color('yellow{Warn - Dir exists} -'), target);
                    continue;
                }

                io.utils.dir.symlinkSync(new net.URI(projects[key].path).toLocalDir(), target);
            }

            new io.File(uri).write(source.replace('%ROUTES%', JSON.stringify(globals.defaultRoutes, null, 5)));
        }
    }));
});
