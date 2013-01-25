(function() {

    var CopyHandler = Class({
        process: function(config, done){
            config.sourceDir.readFile().copyTo(config.targetDir.uri);

            done && done();
        }
    });

	include.exports = {
		process: function(config, idfr) {

			include.js({
				io: ['files/templateHandler']
			}).done(function() {

				var folder = config.name || global.program.args[1];

                config = Object.extend(config,{
					targetDir  : new io.Directory(new net.URI(process.cwd() + '/')),
					sourceDir : new io.Directory(io.env.applicationDir.combine('template').combine(folder))
                });

                if (config.sourceDir.exists() == false) {
					console.error('Source Directory Not Found - ', sourceDir.uri.toString());
					idfr.resolve(1);

					return;
				}





                var handler = new io.File(config.sourceDir.uri.combine('/.handler/handler.js'));

                if (handler.exists()){
                    include.js(handler.uri.toString() + '::Handler').done(function(resp){
                        execute(resp.Handler, config, idfr.resolve);
                    });
                    return;
                }

                execute(CopyHandler, config, idfr.resolve);
			});
		}
	}

    function execute(Handler, config, done){
        (new Handler).process(config, done);
    }


}());
