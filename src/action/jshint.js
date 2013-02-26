include.js({
	script: 'io/middleware/hint::JSHint'
}).done(function(resp) {
	include.exports = {
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
                if (file.exists() == false){
                    console.error('File not found:', file.uri.toLocalFile());
                    return;
                }
                aggr.push(file);
            });



            ruqq.arr.each(files, function(file){
                file.read();
                resp.JSHint(file, config.jshint);
            });

            done();
		}
	};

});
