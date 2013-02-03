include.exports = {
    process: function(config, done){

        var script = config.script;

        if (config.args && !script){
            script = config.args[0];
        }

        if (!(script && new io.File(script).exists())){
            done && done(new Error(String.format('Custom script not exists: %1', script)));
        }

        include.routes({
            app: net.URI.combine('file:///',process.cwd(),'{0}')
        });


        var _path = /[^;]+[\\\/]npm[\\\/][^;]*/g.exec(process.env.path);

        globalPath = _path && _path[0].replace(/\\/g,'/');
        globalPath = net.URI.combine(globalPath, 'node_modules');


        include.js({
            app: script + '::Script'
        }).done(function(resp){

            var nodeModulesPath = net.URI.combine(process.cwd(), 'node_modules'),
                paths = module.paths;

            paths.push(nodeModulesPath);

            if (globalPath){
                paths.push(globalPath);
            }

            resp.Script.process(config, done);

            ruqq.arr.remove(paths, function(x){
                return x === nodeModulesPath || x === globalPath;
            });
        });
    }
}
