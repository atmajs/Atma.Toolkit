import { Application } from './Application'

namespace NodeJSNativeStart {

    export function runNewNode(args) {

        let spawn = require('child_process').spawn;
        let path = require('path');
        let proc = spawn(process.execPath, args, { stdio: 'inherit' });

        proc.on('exit', function (code, signal) {
            process.on('exit', function () {
                if (signal) {
                    process.kill(process.pid, signal);
                } else {
                    process.exit(code);
                }
            });
        });

        // terminate children.
        process.on('SIGINT', function () {
            proc.kill('SIGINT'); // calls runner.abort()
            proc.kill('SIGTERM'); // if that didn't work, we're probably in an infinite loop, so make it die.
        });
    }

    export function resolveNativeNodeArgumentsIfAny() {
        let path = require('path');

        let args = [path.join(__dirname.replace(/lib[\/\\]?$/, ''), 'index.js')];
        let isDebug = false;
        let count = 0;

        process.argv.slice(2).forEach(function (arg) {
            let flag = arg.split('=')[0];
            switch (flag) {
                case '-d':
                    args.unshift('--debug');
                    break;
                case 'debug':
                    args.unshift('--inspect');
                    isDebug = true;
                    break;
                case '--debug':
                case '--debug-brk':
                case '--inspect':
                case '--inspect-brk':
                    args.unshift(arg);
                    break;
                case '-gc':
                case '--expose-gc':
                    args.unshift('--expose-gc');
                    break;
                case '--gc-global':
                case '--es_staging':
                case '--no-deprecation':
                case '--no-warnings':
                case '--prof':
                case '--log-timer-events':
                case '--throw-deprecation':
                case '--trace-deprecation':
                case '--trace-warnings':
                case '--use_strict':
                case '--allow-natives-syntax':
                case '--perf-basic-prof':
                case '--napi-modules':
                    args.unshift(arg);
                    break;
                default:
                    if (arg.indexOf('--harmony') === 0) {
                        args.unshift(arg);
                    } else if (arg.indexOf('--trace') === 0) {
                        args.unshift(arg);
                    } else if (arg.indexOf('--icu-data-dir') === 0) {
                        args.unshift(arg);
                    } else if (arg.indexOf('--max-old-space-size') === 0) {
                        args.unshift(arg);
                    } else if (arg.indexOf('--preserve-symlinks') === 0) {
                        args.unshift(arg);
                    } else {
                        count++;
                        args.push(arg);
                    }
                    break;
            }
        });
        if (args.length === count + 1) {
            return null;
        }
        if (isDebug) {
            args.push('--debugger');
        }
        return args;
    }
}

namespace ApplicationStart {
    declare let global, io, include, logger;

    export async function preload() {

        let isTest = process.argv.includes('test');
        if (isTest) {
            process.env.TEST = 'true';
        }

        require('includejs');
        require('atma-libs/globals-dev');

        let _ = require('atma-utils');
        global.atma = {};
        global.ruta = require('ruta');
        global.Class = require('atma-class');
        global.mask = require('maskjs');

        process
            .mainModule
            .paths
            .push(process.cwd() + '/node_modules');


        require('atma-logger/lib/global-dev');
        require('atma-io');


        let base = io.env.applicationDir.toString();

        include
            .cfg({
                //        path: base,
                extentionDefault: {
                    "js": "ts"
                }
            })
            .routes({
                handler: base + 'src/handler/{0}.ts',
                parser: base + 'src/parser/{0}.ts',
                action: base + 'src/action/{0}.ts',
                script: base + 'src/{0}.ts',
                helper: base + 'src/helper/{0}.ts',
                server: base + 'src/server/{0}.ts',
                atma: base + '{0}.ts'
            });


        let app = new Application();
        return await app.initialize();
    }


    export function initialize(app: Application) {

        logger(99)
            .log('> process:'.cyan, process)
            .log('> config:'.cyan, app.config);

        if (app.config.$cli.params.help) {
            app.help();
            return 1;
        }

        if (app.config.tasks == null) {
            logger.error('<config:invalid> Tasks are not defined', app.config.toJSON());
            return 0;
        }
        app
            .run()
            .fail(function (error) {
                logger.error(error);
                process.exit(1);
            })
            .always(function () {
                if (app.errors.length) {
                    logger.error(app.errors);
                    process.exit(1);
                }
                logger.log('<done>'.green);
            });

        return 1;
    }
}

(async function () {
    let args = NodeJSNativeStart.resolveNativeNodeArgumentsIfAny();
    if (args) {
        NodeJSNativeStart.runNewNode(args);
        return;
    }
    let app = await ApplicationStart.preload();
    ApplicationStart.initialize(app);
}());
