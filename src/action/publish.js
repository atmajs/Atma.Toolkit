module.exports = {
    help: {
        description: [
            'Commit all changes with message and push to git and npm'
        ],
        args: {
            m: 'commit message'
        },
    },
    process: function (config, done) {

        let message = config.m;

        this.bump((error, version) => {
            if (error) {
                done(error);
                return;
            }
            if (message == null) {
                message = `v${version}`;
            }
            let branch = 'master';

            let publish = [
                'npm run build',
                'git add -A',
                `git commit -a -m "publish: ${message}"`,
                'git push origin ' + branch,
                'npm publish',
            ];
            runCommands(publish, done);
        });
    },
    
    runCommands: function (commands, done) {
        runCommands(commands, done);
    },
    bump: function (done) {
        app
            .findAction('bump')
            .done(function (action) {
                action.process({}, done);
            });
    }
};


// var npm_run;
// (function () {
//     var pckg = null;
//     npm_run = function (action) {
//         if (pckg == null)
//             _load();

//         if (action in pckg) {
//             return 'npm run ' + action;
//         }
//         return null;
//     };

//     function _load() {
//         if (io.File.exists('package.json') === false) {
//             pckg = {};
//             return;
//         }

//         pckg = io.File.read('package.json');
//         if (typeof pckg === 'string') {
//             pckg = JSON.parse(pckg);
//         }
//     }

// }());


var runCommands;
(function () {
    var _shell;
    runCommands = function (commands, done) {

        if (_shell)
            return process();

        app
            .findAction('shell')
            .done(function (shell) {
                _shell = shell;
                process();
            });

        function process() {
            var index = -1;
            function next(error) {
                if (error) {
                    done(error);
                    return;
                }

                if (++index >= commands.length) {
                    done();
                    return;
                }

                var command = commands[index];
                if (command == null) {
                    next();
                    return;
                }
                if (typeof command === 'function') {
                    if (command.length === 1) {
                        command(next);
                        return;
                    }
                    command();
                    next();
                    return;
                }


                _shell
                    .process(command)
                    .done(function () {
                        next();
                    })
                    .fail(function (error) {
                        logger.error('Shell error', error);
                        next(error);
                    })
            }

            next();
        }
    };
}());