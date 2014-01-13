(function() {
	include.exports = {
		help: {
			description: 'Compress javascript files',
			args: {
				files: '<string|array>'
			}
		},
		process: function(config, done) {

			if (config.files == null) {
				config.files = config.args;
			}
		
			if (config.files == null) {
				done('Set file(s) in config.files');
				return;
			}

            if (typeof config.files === 'string'){
                config.files = [config.files];
            }

            config.minify = true;

            var files = ruqq.arr.aggr(config.files, [], function(x, aggr){
                var file = new io.File(x);

                if (file.exists() == false){
                    console.error('File not found:', file.uri.toLocalFile());
                    return;
                }
                aggr.push(file);
            });

            files.forEach(function(file){
                file.read();
                
				io
					.File
					.middleware
					.uglify(file, config);
					
				io
					.File
					.middleware
					.condcomments(file, config);
					
                new io.File(file.uri.combine(file.uri.getName() + '.min.' + file.uri.extension)).write(file.content);
            });

            done();
		}
	};

}());
