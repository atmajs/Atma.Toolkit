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
            
            include
                .instance(io.env.currentDir.toString());
            script
                .process(config, done);
            return;
        }

        if (config.args && !script) 
            script = config.args[0];
        
        if (!script) {
            done('Custom script not defined - via cli: $ atma custom name.js, via config: define script property');
            return;
        }

        if (io.File.exists(script) === false) {
            script += '.js';
        }

        if (io.File.exists(script) === false) {
            done('Custom script not exists: %1'.format(script));
            return;
        }

        script = script.replace(/\\/g, '/');
        var base = process.cwd().replace(/\\/g, '/');
        var url = net.Uri.combine(
        	'file:///'
        	, base
        	, script
        );


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