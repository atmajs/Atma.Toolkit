import { env, File } from 'atma-io';
import { class_Uri } from 'atma-utils';

declare let include;


export default {
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
    async process (config, done) {
        var script = config.script;


        if (script && typeof script.process === 'function'){

            include
                .instance(env.currentDir.toString());
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

        var ext = /\.[\w]{1,5}$/;
        if (ext.test(script) === false) {
            let extension = ['.js', '.ts'].find(x => {
                return File.exists(script + x)
            });
            if (extension) {
                script += extension;
            }
        }

        if (File.exists(script) === false) {
            done(`Custom script '${script}' not resolved in ${process.cwd()}.`);
            return;
        }

        script = script.replace(/\\/g, '/');
        var base = process.cwd().replace(/\\/g, '/');
        var url = class_Uri.combine(
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

        });
    }
}
