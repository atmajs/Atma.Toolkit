(function() {

	var jshint = require('jshint').JSHINT;


	include.exports = function(file, config) {

        if (!config){
		    config = global.config && global.config.jshint;
        }

        if (!config){
            return;
        }


        var globals = config.globals,
			options = config.options,
			ignore = config.ignore;


		/**
		 *  DO not apply jshint on minimized scripts
		 */
		if (file.uri.file.indexOf('.min.') > -1) {
			return;
		}

		if (ignore && ignore.hasOwnProperty(file.uri.file)) {
			return;
		}

        if (typeof file.content !== 'string'){
            file.content = file.content.toString();
        }

		var start = Date.now(),
			result = jshint(file.content, options, globals);

		console.log( //
        '%1 [%2ms] %3'
        	.format(result 
        				? 'green{Success}' 
        				: 'red{Warn ' + jshint.errors.length + '}'
        			, Date.now() - start
					, file.uri.file)

        	.colorize()
        );

		if (!result) {
			jshint.errors.forEach(function(e) {
				if (!e) {
					return;
				}
				var evidence = e.evidence,
					character = e.character,
					pos;

				if (evidence) {

					var msg = '[yellow{%1}:yellow{%2}] bold{%3}'
								.colorize()
								.format('L' + e.line, 'C' + character, e.reason);


					console.log(msg);
					return;
				} 

				console.log(e.reason);
				
			});
		}
	};
}());
