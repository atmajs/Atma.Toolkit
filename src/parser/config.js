/**
 *  Include Builder Config Parse/Define
 **/

include.js({
    script: 'io/file'
}).done(function() {

    include.exports = {
        prepairConfig: prepairConfig
    };

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
        var cfg = [{
            action: entry
        }];

        parseOverrides(program, cfg[0]);
        parseFile(cfg[0]);
        parseType(cfg[0]);

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

    global.config = prepairConfig(global.config);
    global.config.state = 4;


    /** HELPERS */


    function prepairConfig(config) {
        if (config instanceof Array === false) {
            config = [config];
        }
        for (var i = 0, x, length = config.length; i < length; i++) {
            x = config[i];
            if ('file' in x) {
                parseFile(x);
                parseType(x);
            }
            if (i == 0) {
                parseOverrides(program, config);
            }
        }
        return config;
    }


    function parseFile(config) {
        var uri = new net.URI(config.file);
        if (uri.isRelative()) {
            uri = new net.URI(net.URI.combine(process.cwd(), config.file));
        }
        config.uri = uri;
    }

    function parseType(config) {
        if (!config.type) {

            var ext = config.uri.extension;
            config.type = {
                htm: 'html',
                html: 'html',
                js: 'js'
            }[ext];
        }
    }

    function parseOverrides(program, config) {
        var array = program.rawArgs,
            i = 0,
            length = array.length,
            action = config.action,
            actionFound = false,
            key, value, x;


        for (; i < length; i++) {
            x = array[i];

            if (x[0] === '-') {
                key = x.substring(1);
                value = i < length - 1 ? array[i + 1] : null;
                if (value) {
                    var c = value[0];

                    if (c == '"' || c == "'") {
                        value = value.substring(1, value.length - 1);
                    }

                    config[key] = value;
                    continue;
                }

                config[key] = true;
                continue;
            }

            if (actionFound) {
                var c = x[0];
                if (c == '"' || c == "'") {
                    x = x.substring(1, x.length - 1);
                }

                (config.args || (config.args = [])).push(x);

                continue;
            }

            if (x == action) {
                actionFound = true;
            }
        }
    }

});
