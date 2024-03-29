
/**
 *  Config {

        files: Array | String
        output: Array | String // Directory Path, if this is a string same directory is used for all processed files
 }
 */

import { Directory, File } from 'atma-io';
import { class_Uri } from 'atma-utils';

declare let logger;

export const ImportAction = {
    help: {
        description: 'Perfom import operations on specified files',
        args: {
            files: '<array|string> source file(s) (supports glob)',
            output: '<string> output directory or file pattern'
        },
        example: [
            '$ atma import -files build/ -output release/',
            '$ atma import -files build/lib.js -output release/lib.js',
            '$ atma import -files foo.js;bar.js -output release/',
            '$ atma import -files foo.js;bar.js -output release/{filename}_build.js',
            {
                files: 'build/',
                output: 'release/'
            }
        ]
    },
    process (config, done) {

        var files = config.files,
            output = config.output;

        if (typeof files === 'string') {

            if (~files.indexOf('*')) {

                files = Directory
                    .readFiles(files)
                    .map(function (x) {
                        return x.uri.toString();
                    });

            }
            else {
                files = files.split(';');
            }
        }

        if (typeof output === 'string' && ~output.indexOf(';')) {
            output = output.split(';');
        }

        if (Array.isArray(files) === false) {
            done('Specify single/array of file(s) to process in {config}.files');
            return;
        }

        File
            .getHookHandler()
            .register({
                regexp: /./,
                method: 'read',
                handler: 'atma-io-middleware-importer',
                zIndex: 100
            }, null, null);

        File
            .clearCache();

        files.forEach(function (x, index) {
            var file = new File(x);
            if (file.exists() == false) {
                logger.error('<action:importer> | File not exists - ', file.uri.toLocalFile());
                return;
            }

            var dist = output instanceof Array ? output[index] : output;
            if (!dist) {
                logger.error('output not defined at %s for %s', index, file.uri.file);
                return;
            }
            if (dist.indexOf('{') !== -1) {
                dist = output_fromPattern(dist, file.uri);
            }

            if (/\.[\w]{1,6}/g.test(dist)) {
                // is file
            }
            else {
                dist = output_fromDirectory(dist, file.uri);
            }


            var content = file.read(config)
            new File(dist)
                .write(content);

            logger.log('Done - ', file.uri.file);
        });


        File
            .getHookHandler()
            .unregister('read', 'atma-io-middleware-importer');

        done();
    }
};

function output_fromDirectory(ouput, fileUri) {
    return class_Uri.combine(ouput, fileUri.file);
}
function output_fromPattern(output, fileUri) {
    return output.replace(/\{(\w+)\}/g, function (full, pattern) {
        switch (pattern) {
            case 'filename':
                return fileUri.getName();
            case 'extension':
                return fileUri.extension;
            default:
                logger.error('Invalid filepattern', pattern, 'Expect: {filename}, {extension}');
                throw Error('Invalid filepattern, expect')
        }
    })
}
