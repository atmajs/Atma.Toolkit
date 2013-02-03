/**
 * @TODO -
 *      Goal of this module, is to have the ability to install any npm package into
 *      includejs directory and link this in custom scripts.
 *
 *      This should be better for scripting, as custom script can require(package)
 *      from any location.
 *
 *      But it seems, it should be better to allow access to global npm modules
 *      directory.
 */

(function() {

	var spawn = require('child_process').spawn;

	include.exports = {
		process: function(config, done) {
            exec(config.args, done);
		}
	};



	function exec(args, done) {

        var child = spawn(resolveNPM(), args, {
				cwd: io.env.applicationDir.toLocalDir(),
                env: process.env,
                stdio: 'inherit'
			});


		child.on('exit', function(code) {
			console.log('child process exited with code ' + code);

            done();
		});
	}

    function resolveNPM(){
        switch(process.platform){
            case 'win32':
                return 'npm.cmd';
        }

        return 'npm';
    }

}());
