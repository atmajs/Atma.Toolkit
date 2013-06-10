(function() {

    var CopyHandler = Class({
        process: function(config, done){
            config.sourceDir.readFiles().copyTo(config.targetDir.uri);

            done && done();
        }
    });

	include.exports = {
		process: function(config, done) {

			include.js({
				io: ['files/templateHandler']
			}).done(function() {

				var folder = config.name || process.argv[3];

				
				config = Object.extend(config,{
					targetDir  : new io.Directory(new net.URI(process.cwd() + '/')),
					sourceDir : new io.Directory(io.env.applicationDir.combine('template/').combine(folder + '/'))
                });

                if (config.sourceDir.exists() == false) {
					return done && done('Scaffolding Not Found - ' + config.sourceDir.uri.toString());
				}

                var handler = new io.File(config.sourceDir.uri.combine('.handler/handler.js'));

                if (handler.exists()){
                    include.js(handler.uri.toString() + '::Handler').done(function(resp){
						
                        execute(resp.Handler, config, done);
                    });
                    return null;
                }
                return execute(CopyHandler, config, done);
			});
		}
	}

    function execute(Handler, config, done){
        (Handler instanceof Function ? new Handler : Handler).process(config, done);
    }


}());
