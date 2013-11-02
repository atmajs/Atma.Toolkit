
include.exports = Class({
    process: function(config, done){

        var name = config.args[1];

        if (!name){
            logger.error('Compo-name undefined. Usage > atma template server-model %NAME%');
            return;
        };

        config.name = name;

        ruqq.arr.each(config.sourceDir.readFiles().files, function(file){

            var content = interpolate(file.read(), config),
                path = file
                    .uri
                    .toRelativeString(config.sourceDir.uri),
                
                url = config
                    .targetDir
                    .uri
                    .combine(name + '/')
                    .combine(interpolate(path, config));

            new io.File(url).write(content);
        });


        logger
            .log('green<Created>, please add route manually to the services.yml'.color)
            .log("'/rest/:model(%1,%2)' : /server/http/service/%1.js".yellow.bold.format(name, name + 's'));

        done();
    }
});



function interpolate(str, model){

    var Expression = mask.Utils.Expression;
    return str.replace(/~\[([^\]]+)\]/g, function(full, expr){

        return Expression.eval(expr, model);
    });
}
