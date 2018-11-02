include.exports = {
    help: {
        description: 'Copy files with glob pattern support',
        args: {
            'files': '<object> fileName: fileDestination'
        },
        example: [
            {
                files: {
                    '/dev/index.html': '/release/index.html',
                    '/src/**' : '/release/src/**'
                }
            }
        ]
    },
    process: function(config, done){
        var files = config.files;

        if (files == null || typeof files !== 'object'){
            done('Copy Action: Define files in "files" property as object {source: target}');
            return;
        }
        
        for (var source in files) {
            if (source.indexOf('*') === -1) 
                continue;
            
            var target;
            target = files[source].replace(/\*+$/,'');
            target = path_ensureTrailingSlash(target);
            
            delete files[source];
            
            new io
                .Directory()
                .readFiles(source)
                .forEach(function(file){
                
                    var _relative = file.uri.toRelativeString(io.env.currentDir),
                        _source = file.uri.toString(),
                        _path = glob_getCalculatedPath(_relative, source);
                    
                    files[_source] =  net.Uri.combine(target, _path);
                });
        }

        for(var source in files){
            var file = new io.File(source),
                target = files[source];

            if (file.exists() === false){
                console.error('<file-copy: 404> ', file.uri.toLocalFile());
                continue;
            }


            file.copyTo(target);
        }

        done();
    }
};
