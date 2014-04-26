(function(){

    /**
     *  Config {

            files: Array.String
            dist: String

     }
     */

    include.exports = {
        help: {
            description: 'Does simple file concatenation from a list of files',
            
            args: {
                files: '<array> file list',
                dist: '<string> output file destination'
            }
        },
        process: function(config, done){

            var files = config.files,
                dist = config.dist;

            if (files instanceof Array === false){
                done('Specify array of files to concatenate in {config}.files');
                return;
            }


            var output = ruqq.arr.aggr(files, [], function(x, aggr){
                var file = new io.File(x);
                if (file.exists() == false){
                    console.error('<file-concat: 404>', file.uri.toLocalFile());
                    return;
                }

                aggr.push(file.read());

            });

            new io.File(dist).write(output.join(''));
            done();
        }
    }

}());
