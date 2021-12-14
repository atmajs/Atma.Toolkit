import { Directory, env, File } from 'atma-io';
import { class_Uri } from 'atma-utils';

declare let include;

class CopyHandler {
    process (config, done){
        config.sourceDir.copyTo(config.targetDir.uri);
        done?.();
    }
};



export default {
    help: {
        description: 'Project, Component Scaffolding',
        examples: [
            '$ atma template starter',
            '$ atma template compo foo',
            '$ atma template todoapp',
            {
                action: 'template',
                name: 'starter'
            }
        ]
    },
    process(config, done) {


        File
        .getFactory()
        .registerHandler(/\/\.handler\/.+$/g, class extends File {
            copyTo (uri){
                return this;
            }
            write (...args){
                return this;
            }
            read <T = string> (...args) {
                return '' as any;
            }
        });

        var folder = config.name || process.argv[3];

        if (!folder) {
            done('Template Name is not defined');
            return;
        }


        config = {
            ...config,
            targetDir  : new Directory(new class_Uri(process.cwd() + '/')),
            sourceDir : new Directory(env.applicationDir.combine('template/').combine(folder + '/'))
        };

        if (config.sourceDir.exists() == false) {
            done('Scaffolding Not Found - ' + config.sourceDir.uri.toString());
            return;
        }

        var handler = new File(config.sourceDir.uri.combine('.handler/handler.js'));

        if (handler.exists()){
            include.js(handler.uri.toString() + '::Handler').done(function(resp){

                execute(resp.Handler, config, done);
            });
            return;
        }

        execute(CopyHandler, config, done);
    }
}

function execute(Handler, config, done){
    (Handler instanceof Function ? new Handler : Handler).process(config, done);
}

