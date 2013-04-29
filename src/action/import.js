include.js({
    script: 'io/middleware/importer'
}).done(function(resp){

    /**
     *  Config {

            files: Array | String
            output: Array | String // Directory Path, if this is a string same directory is used for all processed files
     }
     */

    include.exports = {
        process: function(config, done){

            var files = config.files,
                output = config.output;

            if (typeof files === 'string'){

                if (~files.indexOf('*')){

                    files = ruqq.arr.map(new io.Directory().readFiles(files).files, function(x){
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


            if (files instanceof Array === false){
                console.error('Specify single/array of file(s) to process in {config}.files');
                done && done(new Error('No files'));
            }


            io.File.getHookHandler().register('read', resp.importer);
            io.File.clearCache();

            ruqq.arr.each(files, function(x, index){
                var file = new io.File(x);
                if (file.exists() == false){
                    console.error('Import | File not exists - ', file.uri.toLocalFile());
                    return;
                }

                var dist = output instanceof Array ? output[index] : output,
                    code = file.read();

                if (!dist){
                    console.error('output not defined at ', index, 'for resource', fiel.uri.file);
                    return;
                }

                if (/\.[\w]{1,6}/g.test(dist)){
                    // is file
                }else{
                    dist = net.URI.combine(dist, file.uri.file);
                }

                resp.importer(file, config.defines);

                new io.File(dist).write(file.content);

                file.content = code;

                console.log('Done - ', file.uri.file);
            });

            done && done();
        }
    }

});
