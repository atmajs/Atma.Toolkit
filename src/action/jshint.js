(function() {
	include.exports = {
		
		help: {
			description: 'Run JSHint on specified files',
			args: {
				files: '<array|string>',
				jshint: '<object> jshint variables, support ignore property to ignore some files'
			}
		},
		process: function(config, done) {



			if (config.files == null) {
				done('Set file(s) in config.files');
				return;
			}

            if (typeof config.files === 'string'){
                config.files = [config.files];
            }

            var files = ruqq.arr.aggr(config.files, [], function(x, aggr){
                var file = new io.File(x);
                if (file.exists() === false){
                    logger.error('File not found:', file.uri.toLocalFile());
                    return;
                }
                aggr.push(file);
            });

			
			var JSHint = io
				.File
				.middleware
				.hint
				;

            ruqq.arr.each(files, function(file){
                file.read();
                JSHint(file, config.jshint);
            });

            done();
		}
	};

}());
