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

        include.js({
            app: script + '::Script'
        }).done(function(resp){
            resp.Script.process(config, done);
        });

    }
}
