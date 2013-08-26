(function(){

    /**
     *  Config {

            files: Array | String
            output: Array | String // Directory Path, if this is a string same directory is used for all processed files
     }
     */

    include.exports = {
        help: {
            description: 'Perfom import operations on specified files',
            args: {
                files: '<array|string> source file(s) (supports glob)',
                output: '<string> output directory'
            },
            example: [
                '$ atma import -files build/ -output release/',
                '$ atma import -files build/lib.js -output release/lib.js',
                '$ atma import -files foo.js;bar.js -output release/',
                {
                    files: 'build/',
                    output: 'release/'
                }
            ]
        },
        process: function(config, done){

            var files = config.files,
                output = config.output;

            if (typeof files === 'string'){

                if (~files.indexOf('*')){

                    files = new io
                        .Directory()
                        .readFiles(files)
                        .files
                        .map(function(x){
                            return x.uri.toLocalFile();
                        });

                }
                else{
                    files = files.split(';');
                }
            }

            if (typeof output === 'string' && ~output.indexOf(';')){
                output = output.split(';');
            }


            if (Array.isArray(files) === false){
                done('Specify single/array of file(s) to process in {config}.files');
                return;
            }


            io
                .File
                .getHookHandler()
                .register(/./, 'read', 'importer');
                
            io
                .File
                .clearCache();

            files.forEach(function(x, index){
                var file = new io.File(x);
                if (file.exists() == false){
                    logger.error('Import | File not exists - ', file.uri.toLocalFile());
                    return;
                }

                var dist = output instanceof Array ? output[index] : output,
                    code = file.read();

                if (!dist) {
                    logger.error('output not defined at %s for %s', index, file.uri.file);
                    return;
                }

                if (/\.[\w]{1,6}/g.test(dist)){
                    
                    // is a file
                }else{
                    
                    dist = net.Uri.combine(dist, file.uri.file);
                }

                io
                    .File
                    .middleware
                    .importer(file, config.defines);
                    

                new io
                    .File(dist)
                    .write(file.content);

                file.content = code;

                logger.log('Done - ', file.uri.file);
            });

            
            io
                .File
                .getHookHandler()
                .unregister('read', 'importer');
                
            done();
        }
    };

}());
