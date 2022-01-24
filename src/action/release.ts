import { File, env, glob } from 'atma-io'
import { Shell } from 'shellbee'

declare let app, logger;

export const ReleaseAction = {
    help: {
        description: [
            'Increase the version in `package.json | bower.json | component.json`',
            '`npm run build` the project',
            'Commit and push version',
            '`npm publish` the project',
            'Checkout `release` branch',
            'Remove files not for `release`',
            'Commit and push changes',
            'Create and push the git tag using current version',
            'Checkout back to master'
        ],
        args: {
            release: 'Array, default: lib/**, vendor/**, readme.md, package.json, bower.json',
            branch: 'String, Current active branch, default: master',
            afterBump: 'Array, additional commands after bump',
            afterPublish: 'Array, additional commands after publishing',
        },
    },
    process (config, done){

        var branch = config.branch || 'master';
        var includes = config.release || (app.config.settings && app.config.settings.release) || [
            'lib/**',
            'vendor/**',
            'readme.md',
            'package.json',
            'bower.json'
        ];
        var afterBump     = config.afterBump    || [],
            afterPublish  = config.afterPublish || [];

        this.bump(function(error, version){
            if (error) {
                done(error);
                return;
            }

            var publish = [
                npm_run('beforeRelease'),
                npm_run('build'),
                'git add -A',
                'git commit -a -m "v' + version + '"',
                'git push origin ' + branch,
                (function(){
                    if (File.exists('package.json') === false)
                        return null;

                    var pckg = File.read<any>('package.json');
                    if (typeof pckg === 'string')
                        pckg = JSON.parse(pckg);

                    var name = pckg.name;
                    if (name && name !== '-')
                        return 'npm publish';

                    return null;
                }()),
                'git checkout -B release',
                function () {
                    ignoreFile_create(includes)
                },
                'git rm -r --cached .',
                'git add -A',
                'git commit -a -m "v' + version + '"',
                'git push origin release -ff',
                'git tag v' + version,
                'git push --tags',
                function () {
                    ignoreFile_reset();
                },
                'git checkout ' + branch + ' -ff'
            ];

            var commands = afterBump
                .concat(publish)
                .concat(afterPublish)
                ;

            runCommands(commands, done);
        });
    },
    includeFiles: {
        create: function(includes){
            ignoreFile_create(includes);
        },
        reset : function(){
            ignoreFile_reset();
        }
    },
    runCommands: function(commands, done){
        runCommands(commands, done);
    },
    bump: function(done){
        app
            .findAction('bump')
            .done(function(action){
                action.process({}, done);
            });
    }
};


var npm_run;
(function(){
    var pckg = null;
    npm_run = function(action){
        if (pckg == null)
            _load();

        if (action in pckg) {
            return 'npm run ' + action;
        }
        return null;
    };

    function _load(){
        if (File.exists('package.json') === false) {
            pckg = {};
            return;
        }

        pckg = File.read('package.json');
        if (typeof pckg === 'string') {
            pckg = JSON.parse(pckg);
        }
    }

}());


var ignoreFile_create,
    ignoreFile_reset;
(function(){
    var GIT_IGNORE = '.gitignore';
    var _gitignore;

    ignoreFile_create = function (includes) {
        _gitignore = File.read(GIT_IGNORE);

        var cwd = env.currentDir;
        var files = includes.reduce(function(aggr, path){
            if (path.indexOf('*') !== -1) {
                var files = glob
                    .readFiles(path)
                    .map(function(file){
                        path = file.uri.toRelativeString(cwd);
                        addFolder(aggr, path);
                        return path;
                    });

                aggr = aggr.concat(files);
                return aggr;
            }

            aggr.push(path);
            return aggr;
        }, []);


        var lines = [ '*' ];
        lines = lines.concat(includes
            .filter(function(path){
                return path.indexOf('/') !== -1
            })
            .map(function(path){
                return '!' + path.substring(0, path.lastIndexOf('/') + 1)
            })
        );
        lines = lines.concat(files.map(function(filename){
            return '!' + filename;
        }));

        File.write(GIT_IGNORE, lines.join('\n'));

        logger.log('gitignore:'.cyan, File.read(GIT_IGNORE));
    };
    ignoreFile_reset = function () {
        if (!_gitignore) {
            File.remove(GIT_IGNORE);
            return;
        }
        File.write(GIT_IGNORE, _gitignore);
    };

    function addFolder(arr, path) {
        var dir = path.substring(0, path.lastIndexOf('/') + 1);
        if (dir && arr.indexOf(dir) === -1) {
            arr.push(dir);
        }
        if (dir.length > 1) {
            addFolder(arr, dir.substring(0, dir.length - 1));
        }
    }
}());

async function runCommands (commands, done){
    let shell = await Shell.run({
        commands
    });

    await shell.onCompleteAsync()
    done();
};
