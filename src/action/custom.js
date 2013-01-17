include.exports = {
    process: function(config, idfr){
        
        var script = config.script;
        
        if (config.args && !script){
            script = config.args[0];
        }
        
        if (!(script && new io.File(script).exists())){
            console.error('Custom script not exists', script);
            idfr && idfr.resolve();
        }
        
        include.routes({
            app: net.URI.combine('file:///',process.cwd(),'{0}')
        });
        
        include.js({
            app: script + '::Script'
        }).done(function(resp){
            resp.Script.process(config, idfr);
        });
        
    }
}