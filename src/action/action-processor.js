include.js([ //
'template.js', //
'reference.js', //
'globals.js', //
'git-clone.js', //
'server.js', //
'shell.js', //
'solution.js', //
'custom.js', //
'npm.js', //
'concat.js', //
'watch.js', //
'uglify.js', //
'jshint.js', //
'copy.js', //
]).done(

function(resp) {

    var _config, _done, _index;


    include.exports = Class({
        Construct: function() {

        },
        run: function(globalConfig, done) {
            _config = globalConfig;
            _done = done;
            _index = -1;
            process();
        }
    });

    function process(error) {
        if (error) {
            console.error(error.toString());
        }

        if (++_index > _config.length - 1){
            if (current == null) {
                console.log('/* Done */');
                _done && _done();
                return;
            }
        }

        var current = _config[_index];


        /* Some action handlers depends of global config object
         * TODO - eliminate this dependency
         */
        global.config = current;

        var handler;

        switch (current.action) {
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

        if (handler == null) {
            console.warn('Error: Unknown Handler', current.action);
            process();
            return;
        }

        handler.process(current, process);
    }

});
