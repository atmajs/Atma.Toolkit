var AppCfg = require('appcfg'),
    Config = require('./config/Config'),
    ShellStrategy = require('./shell/Strategy.js'),
    ShellPrompt = require('./shell/Prompt.js'),
    ShellProcess = require('./shell/Process.js'),
    io = require('atma-io');


io.settings({
    extensions: {
        'yml': [
            'atma-io-middleware-yml:read'
        ]
    }
});


var Application = Class({
    Extends: [Class.EventEmitter, Class.Deferred, ShellPrompt],

    config: null,

    Construct: function() {

        global.app = this;

        this.config = AppCfg
            .fetch([
                Config.Utils,
                {
                    path: '%APP%/globals/actions.js'
                },
                {
                    path: '%APP%/globals/config.yml'
                },
                {
                    path: '%APPDATA%/.atma/config.yml',
                    writable: true,
                    optional: true
                },
                {
                    path: 'package.json',
                    getterProperty: 'atma',
                    optional: true,
                    lookupAncestors: true
                },
                Config.Projects,
                Config.Plugins,
                Config.Tasks,
                Config.Settings
            ]);

        this
            .config
            .done(function() {

                if (app.config.$cli.params.help) {
                    app.run({ action: 'help' });
                    return;
                }

                app.resolve(app);
            });

    },

    run: function(taskConfigs) {

        app.worker = new Class.Deferred();
        app.errors = [];

        if (taskConfigs != null) {
            if (Array.isArray(taskConfigs) === false) {
                taskConfigs = [taskConfigs];
            }

            this.config.tasks = taskConfigs;
        } else {

            taskConfigs = this.config.tasks;
        }
        if (Array.isArray(taskConfigs) === false || taskConfigs.length === 0) {

            return app
                .worker
                .reject('<app:run> tasks are invalid');
        }

        this.process(taskConfigs.shift());

        return app.worker;
    },



    process: function(taskConfig) {

        var app = this;

        this.current = taskConfig;
        this
            .findAction(taskConfig.action)
            .fail(function(error) {
                logger.error('<app.action>', error);
                next();
            })
            .done(function(handler) {

                // defer `run` to wait before for all `done`-stack is called when resolving action
                setTimeout(run);

                function run() {
                    if (handler.strategy) {

                        var strategy = new ShellStrategy(handler.strategy),
                            path = process.argv.slice(3).join(' '),
                            cmd = ruta.$utils.pathFromCLI(path);

                        strategy.process(cmd, taskConfig, callback);
                        return;
                    }
                    if (handler.process) {
                        handler.process(taskConfig, callback);
                        return;
                    }
                    app.errors.push('<fail> ' +
                        taskConfig.action +
                        ':' +
                        ' No `strategy` object, no `process` function'
                    );
                }


                function callback(error) {

                    if (error)
                        app.errors.push('<fail> ' + taskConfig.action + ':' + error);
                    next();
                }
            });

        function next() {
            var taskConfig = app.config.tasks.shift();

            if (taskConfig == null) {
                app
                    .worker
                    .resolve();
                return;
            }

            app.process(taskConfig);
        }

        return this;
    },

    findAction: function(action) {
        var dfr = new Class.Deferred(),
            mix = this.config.actions[action];

        if (mix != null && typeof mix === 'object') {
            return dfr.resolve(mix);
        }

        var path = mix;
        if (path == null)
            path = '/src/action/' + action + '.js';

        var base = io.env.applicationDir.toString();
        if (path[0] === '/')
            path = net.Uri.combine(base, path);

        include
            .instance(base)
            .setBase(base)
            .js(path + '::Action')
            .done(function(resp) {


                if (resp == null || resp.Action == null) {
                    dfr.reject('Action not found: ' + action);
                    return;
                }


                dfr.resolve(resp.Action);
            });

        return dfr;
    },

    findActions: function() {
        var actions = Array.prototype.slice.call(arguments),
            fns = [],
            dfr = new Class.Deferred(),
            app = this;

        function next() {
            if (actions.length === 0) {
                dfr.resolve.apply(dfr, fns);
                return;
            }
            app
                .findAction(actions.shift())
                .done(function(fn) {
                    fns.push(fn);
                    next();
                })
                .fail(function(error) {
                    dfr.reject(error);
                })
        }

        next();
        return dfr;
    },

    runAction: function(action, config, done) {
        this
            .findAction(action)
            .done(function(action) {
                action.process(config, done);
            })
            .fail(function() {
                done('<Atma.Toolkit::Action - 404> ' + action);
            })
    }
});



module.exports = new Application;