import alot from 'alot';
import { Directory, File, env } from 'atma-io';
import { class_Uri } from 'atma-utils';

export const CopyAction = {
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
    async process (config, done){
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

            Directory
                .readFiles(source)
                .forEach(function(file){

                    var _relative = file.uri.toRelativeString(env.currentDir),
                        _source = file.uri.toString(),
                        _path = glob_getCalculatedPath(_relative, source);

                    files[_source] =  class_Uri.combine(target, _path);
                });
        }

        var output = await alot(files)
            .map((str: string) => new File(str))
            .filterAsync(async f => {
                if (await f.existsAsync() === false) {
                    console.error('<file-copy: 404>', f.uri.toLocalFile());
                    return false;
                }
                return true;
            })
            .forEachAsync(f => f.copyToAsync(target))
            .toArrayAsync();

        done();
    }
};
