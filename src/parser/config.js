/**
 *  Include Builder Config Parse/Define
 **/

include.js({
    script: 'io/file',
    helper: ['configHelper', 'globals']
}).done(function(resp) {

    
    
    var actions =  resp.globals.actions,
        args = process.argv.slice(2),
        action = args[0],
        config;
    

    if (actions[action] != null) {
        var cfg = resp.configHelper.prepairConfig({
            action: action
        });

        cfg.state = 4;

        global.config = cfg;
        return;
    }

    var file = new io.File(action);
    
    if (file.exists() === false){
        file = new io.File('build.js');
        args.unshift('build.js');
        
        process.argv.splice(2, 'build.js');
    }


    if (file.exists() === false) {
        console.error('File doesnt exist (404)', file.uri.toLocalFile());
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

    global.Settings.initialize(global.config);
    global.config = resp.configHelper.prepairConfig(global.config, args);
    global.config.state = 4;




});
