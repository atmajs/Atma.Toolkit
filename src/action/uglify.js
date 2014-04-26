(function() {
	include.exports = {
		help: {
			description: 'Compress javascript files',
			args: {
				files: '<string|array>'
			}
		},
		process: function(config, done) {

			if (config.files == null) 
				config.files = config.args;
			
		
			if (config.files == null) {
				done('Set file(s) in config.files');
				return;
			}

			if (config.settings){
				var ioSetts = config.settings.io;
				if (ioSetts)
					io.settings(ioSetts);
			}


			var _files = config.files,
				_output = config.output
				;

            if (typeof _files === 'string')
                _files = [_files];

            if (typeof _output === 'string')
            	_output = [_output];

            
            config.minify = true;

            

            _files
            	.map(function(x){
	                var file = new io.File(x);

	                if (file.exists() == false){
	                    console.error('<action: uglify> File not found:', file.uri.toLocalFile());
	                    return null;
	                }

	                return file;
	            })
	            .forEach(function(file, index){
                
                if (file == null)
                	return;

                file.read();
                
				io
					.File
					.middleware
					.condcomments(file, config);
				
				io
					.File
					.middleware
					.uglify(file, config);
					
					
				var output = _output && _output[index];
				if (output == null) {
					output = file.uri.combine(file.uri.getName() + '.min.' + file.uri.extension); 
				}
				
                new io
                	.File(output)
                	.write(file.content);

            });

            done();
		}
	};

}());
