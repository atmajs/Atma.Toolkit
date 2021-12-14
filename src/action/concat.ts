import alot from 'alot';
import { File } from 'atma-io'

/**
 *  Config {

        files: Array.String
        dist: String

    }
    */

export default {
    help: {
        description: 'Does simple file concatenation from a list of files',

        args: {
            files: '<array> file list',
            dist: '<string> output file destination'
        }
    },
    async process (config, done){

        let files = config.files;
        let dist = config.dist;

        if (files instanceof Array === false){
            done('Specify array of files to concatenate in {config}.files');
            return;
        }


        let output = await alot(files)
            .map((str: string) => new File(str))
            .filterAsync(async f => {
                if (await f.existsAsync() === false) {
                    console.error('<file-concat: 404>', f.uri.toLocalFile());
                    return false;
                }
                return true;
            })
            .mapAsync(f => f.readAsync<string>())
            .toArrayAsync();

        await File.writeAsync(dist, output.join(''));
        done();
    }
}
