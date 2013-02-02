(function(){

    /**
     *  Config {

            files: Array.String
            dist: String

     }
     */

    include.exports = {
        process: function(config, done){

            var files = config.files,
                dist = config.dist;

            if (files instanceof Array === false){
                console.error('Specify array of files to concatenate in {config}.files');
                done && done(new Error('No files'));
            }


            var output = ruqq.arr.aggr(files, [], function(x, aggr){
                var file = new io.File(x);
                if (file.exists() == false){
                    console.error('File not exists - ', file.uri.toLocalFile());
                    return;
                }

                aggr.push(file.read());

            });


            new io.File(dist).write(output.join(''));


            done && done();
        }
    }

}());
