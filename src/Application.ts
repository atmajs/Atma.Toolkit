import AppCfg from 'appcfg';
import ruta from 'ruta';
import { File, env, settings } from 'atma-io';
import { class_Dfr, class_Uri } from 'atma-utils';
import { Config } from './config/Config';
import { ShellStrategy } from './shell/ShellStrategy';
import { Prompt } from './shell/Prompt';
import { Actions } from './action/Actions';

// let Config = require('./config/Config');
// let ShellStrategy = require('./shell/Strategy.js');
// let ShellPrompt = require('./shell/Prompt.js');
// let ShellProcess = require('./shell/Process.js');

declare let global, Class, logger, include;

settings({
    extensions: {
        'yml': [
            'atma-io-middleware-yml:read'
        ]
    }
});


export class Application extends Prompt {
    //Extends: [Class.EventEmitter, ShellPrompt],

    config = null
    worker: class_Dfr
    errors = []
    current = null

    async initialize(): Promise<this> {

        try {
            global.app = this;

            let config = this.config = await AppCfg.fetch([
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
                Config.Settings,
                Config.Configs,
            ]);

            if (config.$cli.params.help) {
                //this.run({ action: 'help' });
                //return this;
            }
        } catch (err) {
            console.log('err', err);
        }
        return this;
    }

    help () {
        return this.run({ action: 'help' });
    }

    run(taskConfigs?) {

        this.worker = new class_Dfr();
        this.errors = [];

        if (taskConfigs != null) {
            if (Array.isArray(taskConfigs) === false) {
                taskConfigs = [taskConfigs];
            }

            this.config.tasks = taskConfigs;
        } else {

            taskConfigs = this.config.tasks;
        }
        if (Array.isArray(taskConfigs) === false || taskConfigs.length === 0) {

            return this
                .worker
                .reject('<app:run> tasks are invalid');
        }

        this.process(taskConfigs.shift());

        return this.worker;
    }



    async process(taskConfig) {

        let app = this;

        this.current = taskConfig;
        let handler = await this.findAction(taskConfig.action);

                // defer `run` to wait before for all `done`-stack is called when resolving action
        setTimeout(run, 0);

        function run() {
            if (handler.strategy) {

                let strategy = new ShellStrategy(handler.strategy),
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


        function next() {
            let taskConfig = app.config.tasks.shift();

            if (taskConfig == null) {
                app
                    .worker
                    .resolve();
                return;
            }

            app.process(taskConfig);
        }

        return this;
    }

    findAction(action) {
        let dfr = new class_Dfr(),
            mix = this.config.actions[action];

        if (mix != null && typeof mix === 'object') {
            return dfr.resolve(mix);
        }

        let act = Actions.get(action);
        if (act) {
            return dfr.resolve(act);
        }

        let path = mix;
        if (path == null) {
            path = '/src/action/' + action + '.js';
        }

        let base = env.applicationDir.toString();
        if (path[0] === '/') {
            path = class_Uri.combine(base, path);
        }

        include
            .instance(base)
            .setBase(base)
            .js(path + '::Action')
            .done(function (resp) {


                if (resp == null || resp.Action == null) {
                    dfr.reject('Action not found: ' + action);
                    return;
                }


                dfr.resolve(resp.Action);
            });

        return dfr;
    }

    findActions() {
        let actions = Array.prototype.slice.call(arguments),
            fns = [],
            dfr = new class_Dfr(),
            app = this;

        function next() {
            if (actions.length === 0) {
                dfr.resolve.apply(dfr, fns);
                return;
            }
            app
                .findAction(actions.shift())
                .done(function (fn) {
                    fns.push(fn);
                    next();
                })
                .fail(function (error) {
                    dfr.reject(error);
                })
        }

        next();
        return dfr;
    }

    async runAction(action, config, done) {
        let handler = await this.findAction(action);
        handler.process(config, done);
    }
}
