/**
 *  Include Builder Config Parse/Define
 **/

include.js({
    script: 'io/file',
    helper: 'configHelper'
}).done(function(resp) {


    var actions = [ //
    'template', //
    'reference', //
    'globals', //
    'git-clone', //
    'server', //
    'shell', //
    'project-import', //
    'project-reference', //
    'custom', //
    'concat', //
    'npm', //
    'watch', //
    'jshint', //
    'uglify', //
    ],
        program = require('commander'),
        args = program.args,
        config;

    global.program = program;

    if (!(args && args.length > 0)) {
        args = ['build.js'];
    }


    var entry = args[0].trim();


    if (actions.indexOf(entry) > -1) {
        var cfg = resp.configHelper.prepairConfig({
            action: entry
        });

        cfg.state = 4;

        global.config = cfg;
        return;
    }

    var file = new io.File(entry);


    if (file.exists() == false) {
        console.error('File doesnt exists (404)', file.uri.toLocalFile());
        return;
    }

    switch (file.uri.extension) {
    case 'config':
        global.config = JSON.parse(file.read());
        break;
    case 'js':
        eval(file.read());
        if (global.config == null) {
            console.error('Included Javascript as configuration exposed no config property');
            global.config = {
                state: 0
            };
            return;
        }
        break;
    default:
        global.config = {
            file: file.uri.toLocalFile(),
            action: 'build'
        }
        break;
    }

    global.config = resp.configHelper.prepairConfig(global.config);
    global.config.state = 4;




});
