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


        var nodeModulesPath = net.URI.combine(process.cwd(), 'node_modules'),
            paths = module.paths;

        paths.push(nodeModulesPath);

        console.log(nodeModulesPath);

        if (globalPath){
            paths.push(globalPath);
        }

        include.js({
            app: script + '::Script'
        }).done(function(resp){

            if (resp.Script && resp.Script.process){
                resp.Script.process(config, done);
            }else{
                console.error("Custom Script should exports 'process' function: include.exports = { process: function(config, done){ ...} }");
            }

            

            ruqq.arr.remove(paths, function(x){
                return x === nodeModulesPath || x === globalPath;
            });
        });
    }
}
