include.js({
	script: 'helper/stdout::stdout'
}).done(function(resp) {





	var jshint = require('jshint').JSHINT,
		color = resp.stdout.color;


	include.exports = function(file) {

		var config = global.config.jshint;

        if (!config){
            return;
        }


        var globals = config.globals,
			options = config.options,
			ignore = config.ignore;



		if (!global.config.jshint) {
			return;
		}

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
        color(String.format( //
        '%1 [%2ms] %3',  result ? 'green{Success}' : 'red{Warn ' + jshint.errors.length + '}', Date.now() - start, file.uri.file //
        )));

		if (!result) {
			jshint.errors.forEach(function(e) {
				if (!e) {
					return;
				}
				var evidence = e.evidence,
					character = e.character,
					pos;

				if (evidence) {

					var msg = String.format(color('[yellow{%1}:yellow{%2}] bold{%3}'), 'L' + e.line, 'C' + character, e.reason);


					console.log(msg);
				} else {
					console.log(e.reason);
				}
			});
		}
	};
});
