include.exports = Class({
    process: function(config, done){

    	var name = config.args[1];

        if (!name){
            logger.error('Compo-name undefined. Usage > atma template starter-compo %NAME%');
            return;
        };

        config.name = name;

        config.sourceDir.readFiles().files.forEach(function(file){

            var content = String.format(file.read({skipHooks: true}), config),
                path = file
                    .uri
                    .toRelativeString(config.sourceDir.uri),
                
                url = config
                    .targetDir
                    .uri
                    .combine(name + '/')
                    .combine(String.format(path, config));

            new io.File(url).write(content);
        });

        done();
    }
});
