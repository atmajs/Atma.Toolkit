include.exports = {
    help: {
        description: 'Run custom script',
        args: {
            'script' : '<string> script path'
        },
        example: [
            '$ atma custom myscript.js',
            {
                action: 'custom',
                script: 'foo/myscript.js'
            }
        ]
    },
    process: function(config, done) {
        var script = config.script;

        if (script && typeof script.process === 'function'){
            script.process(config, done);
            return;
        }

        if (config.args && !script) {
            script = config.args[0];
        }

        if (!script) {
            done('Custom script not defined - via cli: $ atma custom name.js, via config: define script property');
            return;
        }

        if (new io.File(script).exists() === false) {
            script += '.js';
        }

        if (new io.File(script).exists() === false) {
            done('Custom script not exists: %1'.format(script));
            return;
        }

        var url = net.Uri.combine('file:///', process.cwd().replace(/\\/g, '/'), script);


        include
            .instance(url)
            .js(url + '::Script')
            .done(function(resp) {

            if (resp.Script && resp.Script.process) {
                resp.Script.process(config, done);
                return;
            }
            
            console.log("Hint: To allow multiple custom scripts to be called one after another export 'process' function:".blue.bold);
            console.log("include.exports = { process: function(config, done){ ... } }".blue.bold);
        });
    }
}