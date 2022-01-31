import { class_Dfr,  class_EventEmitter, class_Uri } from 'atma-utils';

declare let atma, logger;

if (atma.shell == null) {
    atma.shell = {};
}

/*
 *    Events:
 *        - process_start     { command }
 *        - process_exception { command, error }
 *        - process_exit      { command, code }
 *        - process_ready     { command }
 *        - process_stdout    { command, buffer }
 *        - process_stderr    { command, buffer }
 *
 *    Promise
 *        - fail (Array<{ command, error }> errors)
 *        - done (Process self)
 */
export const Process = atma.shell.Process = Class({
    Extends: [ class_Dfr, class_EventEmitter ],

    children: null,
    errors: null,
    lastCode: 0,

    Construct: function(mix, done) {
        let params = mix;

        if (typeof mix === 'string') {
            params = {
                command : mix,
                detached: false
            };
        }

        let command  = params.command || params.commands,
            detached = params.detached || false,
            cwd      = params.cwd || process.cwd(),
            rgxReady = params.matchReady;

        this.silent   = params.silent;
        this.parallel = params.parallel || false;
        this.errors   = [];
        this.children = [];
        this.commands = Array.isArray(command)
            ?   command
            : [ command ]
            ;

        this.commands  = command_parseAll(this.commands, detached, cwd, rgxReady);
        this.callback  = done;
        this.extracted = {};
    },
    state: 0,
    process: function(){
        this.run();
    },
    kill: function(done){
        let child = this.children.pop();
        if (child == null) {
            return done && done();
        }
        this.once('process_exit', done);
        child.kill('SIGINT');
    },
    run: function() {
        if (this.commands.length === 0) {
            if (this.state !== -1) {
                this.state = -1;
                if (this.errors.length === 0) {
                    this.resolve(this);
                } else {
                    this.reject(this.errors);
                }
                this.callback && this.callback(this.errors.pop());
            }
            return;
        }

        let options  = this.commands.shift(),
            command  = ValueExtractor.interpolateAny(options.command, this.extracted),
            rgxReady = options.matchReady,
            detached = options.detached === true,
            silent   = this.silent,
            stdio = detached ? (void 0) : 'pipe',
            extractor = options.extract ? new ValueExtractor(this.extracted, options.extract) : null,
            child;

        if (global.process.platform === 'win32'){
            if (options.exec !== 'cmd'){

                options.args.unshift('/C', options.exec);
                options.exec = 'cmd';
            }
        }
        try {
            let cwd = options.cwd || process.cwd();
            if (Directory.exists(cwd + '/') === false) {
                throw Error('CWD Directory not exists: ' + cwd);
            }

            let exec = ValueExtractor.interpolateAny(options.exec, this.extracted),
                args = ValueExtractor.interpolateAny(options.args, this.extracted);

            child = child_process.spawn(exec, args, {
                cwd: options.cwd || process.cwd(),
                env: process.env,
                stdio: stdio,
                detached: detached
            });
            this.children.push(child);
        }catch(error){

            logger.error('Could not run the command', command, error);
            this.errors.push({
                command: command,
                error: error
            });
            this.emit('process_exception', {
                command: command,
                error: error
            });
            this.run();
            return;
        }

        let that = this;
        child.on('exit', function(code) {
            that.emit('process_exit', {
                command: command,
                code: code
            });
            that.lastCode = code;
            if (code > 0) {
                that.errors.push({
                    command: command,
                    error: new Error('Exit code: ' + code)
                });
            }
            extractor && extractor.complete();
            that.run();
        });

        child.stdout.on('data', function(buffer){
            if (detached !== true && silent !== true) {
                process.stdout.write(buffer);
            }
            if (rgxReady != null && rgxReady.test(buffer.toString())) {
                rgxReady = null;
                that.emit('process_ready', {
                    command: command
                });
            }
            if (extractor != null) {
                extractor.write(buffer);
            }
            that.emit('process_stdout', {
                command: command,
                buffer: buffer
            });
        });
        child.stderr.on('data', function(buffer){
            if (detached !== true && silent !== true) {
                process.stderr.write(buffer);
            }
            that.emit('process_stderr', {
                command: command,
                buffer: buffer
            });
        });
        that.emit('process_start', {
            command: command
        });

        if (this.parallel !== false) {
            this.run();
        }
        if (rgxReady == null) {
            setTimeout(function(){
                that.emit('process_ready', {
                    command: command
                });
            }, 200);
        }
    }
});

function command_parseAll(commands, detachedAll, cwdAll, rgxReadyAll) {
    if (cwdAll != null) {
        cwdAll = path_ensure(cwdAll, process.cwd());
    }
    return commands.reduce(function(aggr, command, index){

        let detached = detachedAll || false,
            cwd = cwdAll || process.cwd(),
            matchReady = rgxReadyAll,
            extract = null,
            exec;

        if (typeof command === 'string') {
            exec = command;
        }
        else if (command != null) {
            let obj = command;
            exec    = obj.command;
            if (obj.cwd) {
                cwd  = path_ensure(obj.cwd, cwd);
            }
            if (obj.detached) {
                detached = obj.detached;
            }
            if (obj.matchReady) {
                matchReady = obj.matchReady;
            }
            if (obj.extract) {
                extract = obj.extract;
            }
        }

        if (exec == null || exec === '') {
            logger.warn('Command Object is not valid. Should be at least {command: string}');
            return aggr;
        }

        let args = command_parse(exec);
        aggr.push({
            exec: args.shift(),
            args: args,
            cwd: cwd,
            //stdio: 'pipe',
            detached: detached,
            command: exec,
            matchReady: matchReady,
            extract: extract
        });
        return aggr;

    }, []);
}
function command_parse(command) {
    let parts = command.trim().split(/\s+/);
    let imax = parts.length,
        i = -1,
        c, arg;

    while ( ++i < imax ){

        arg = parts[i];
        if (arg.length === 0)
            continue;

        c = arg[0];

        if (c !== '"' && c !== "'")
            continue;


        let start = i;
        for( ; i < imax; i++ ){

            arg = parts[i];
            if (arg[arg.length - 1] === c) {

                let str = parts
                    .splice(start, i - start + 1)
                    .join(' ')
                    .slice(1,  -1)
                    ;

                parts.splice(start, 0, str);
                imax = parts.length;
                break;
            }
        }
    }
    return parts;
}

function path_ensure(cwd, base) {
    if (new class_Uri(cwd).isRelative()) {
        let x = require('path').normalize(class_Uri.combine(base, cwd));
        return x;
    }
    return cwd;
}

let child_process = require('child_process');
let ValueExtractor = Class({
    target: null,
    extractMeta: null,
    string: '',
    Construct: function(current, extract) {
        this.target = current;
        this.extractMeta = extract;
        this.string = '';
    },
    write: function(buffer){
        this.string += buffer.toString();
    },
    complete: function(){
        for (let key in this.extractMeta) {
            this.target[key] = ValueExtractor.extract(this.string, this.extractMeta[key]);
        }
    },
    Static: {
        extract: function (str, mix) {
            if (typeof mix === 'function') {
                return mix(str);
            }
        },
        interpolateAny: function(mix, values){
            if (mix == null) {
                return;
            }
            if (typeof mix === 'string') {
                return ValueExtractor.interpolateStr(mix, values);
            }
            if (typeof mix.map === 'function') {
                return mix.map(function(str){
                    return ValueExtractor.interpolateAny(str, values);
                });
            }
            return mix;
        },
        interpolateStr: function(str, values) {
            return str.replace(/\{\{(\w+)\}\}/g, function(full, prop){
                let val = values[prop];
                if (val == null) {
                    logger.warn('Extracted property expected: ', prop, values);
                    return '';
                }
                return val;
            });
        }
    }
})
