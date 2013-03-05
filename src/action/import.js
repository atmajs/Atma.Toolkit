(function(){

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
                    files = [files];
                }
            }

            if (files instanceof Array === false){
                console.error('Specify single/array of file(s) to process in {config}.files');
                done && done(new Error('No files'));
            }

            var js = Settings.io.extensions.js;

            if (js.indexOf('importer:read') === -1){
                js.push('importer:read');
            }

            ruqq.arr.each(files, function(x, index){
                var file = new io.File(x);
                if (file.exists() == false){
                    console.error('Import | File not exists - ', file.uri.toLocalFile());
                    return;
                }

                var dist = output instanceof Array ? output[index] : output;

                new io.File(net.URI.combine(dist, file.uri.file)).write(file.read());

                console.log('Done - ', file.uri.file);
            });

            done && done();
        }
    }

}());
