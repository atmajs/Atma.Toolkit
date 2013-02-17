

include.js([ //
'template.js', //
'reference.js', //
'globals.js', //
'git-clone.js',//
'server.js', //
'shell.js', //
'solution.js', //
'custom.js', //
'npm.js', //
'concat.js', //
'watch.js']).done(

function(resp) {

    var config = global.config;

	if (config.state != 4) {
		console.error('Invalid Config State', config);
		return;
	}


	include.exports = Class({
		Construct: function(idfr) {
			this.idfr = idfr;
            config = (this.config = global.config);
            Class.bind(this, 'process');
		},
		process: function(error) {

            if (error){
                console.error(error.toString());
            }

			var current = config.shift();

			if (current == null) {
				this.idfr.resolve();
				return;
			}

            global.config = current;

            var handler;

            switch(current.action){
                case 'build':
                case 'project-import':
                case 'project-reference':
                    handler = resp.solution;
                    break;
                case 'git-clone':
                case 'libjs-clone':
                    handler = resp['git-clone'];
                    break;
                default:
                    handler = resp[current.action];
                    break;
            }

            if (handler == null){
                console.error('Error: Unknown Handler', current.action);
                return;
            }

            handler.process(current, this.process);
		}
	});

});
