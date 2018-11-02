(function() {

    var CopyHandler = Class({
        process: function(config, done){
            config.sourceDir.copyTo(config.targetDir.uri);

            done && done();
        }
    });
	
	io
		.File
		.getFactory()
		.registerHandler(/\/\.handler\/.+$/g, Class({
			Base: io.File,
			copyTo: function(uri){
				return this;
			},
			write: function(){
				return this;
			},
			read: function(){
				return '';
			}
		}));


	include.exports = {
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
		process: function(config, done) {

			var folder = config.name || process.argv[3];
			
			if (!folder) {
				done('Template Name is not defined');
				return;
			}

			
			config = Object.extend(config,{
				targetDir  : new io.Directory(new net.Uri(process.cwd() + '/')),
				sourceDir : new io.Directory(io.env.applicationDir.combine('template/').combine(folder + '/'))
			});

			if (config.sourceDir.exists() == false) {
				done('Scaffolding Not Found - ' + config.sourceDir.uri.toString());
				return;
			}

			var handler = new io.File(config.sourceDir.uri.combine('.handler/handler.js'));

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


}());
