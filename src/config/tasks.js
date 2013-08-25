
var Utils;

include
    .js('utils/config.js')
    .done(function(resp){
        Utils = resp.config;
        
        include.exports = function(app, done){
            
            done(prepair_Config(app));
        };
        

    });


function prepair_Config(app) {

    var actions = app.config.actions,
        cli = app.config.cli,
        paramKeys = Object.keys(cli.params),
        action = cli.args[0] || '';

    if (actions[action] != null) {
        
        return {
            tasks: Utils.prepairConfig({
                action: action
            })
        };
    }


    var file = new io.File(action);

    if (file.exists() === false) {
        file = new io.File('build.js');
        //cli.args.unshift('build.js');
    }


    if (file.exists() === false) {
        console.error('File doesnt exist (404)', file.uri.toLocalFile());
        return null;
    }
    
    var cfg;
    switch (file.uri.extension) {
        case 'yml':
            cfg = file.read();
            break;
        case 'js':
            cfg = require(file.uri.toLocalFile());
            
            if (cfg_isEmpty(cfg)) {
                cfg = global.config;
            }
            
            if (cfg_isEmpty(cfg)) {
                console.error('Included Javascript as configuration exposed no config property');
                return null;
            }
            break;
        default:
            cfg = {
                file: file.uri.toLocalFile(),
                action: 'build'
            };
            break;
    }

    return {
        settings: resolveSettings(cfg),
        raw: cfg,
        tasks: Utils.prepairConfig(cfg, cli.args)
    };
}

function cfg_isEmpty(cfg) {
    if (cfg == null) 
        return true;
    
    if (Array.isArray(cfg)) 
        return cfg.length === 0;
    
    return Object.keys(cfg).length === 0;
}


function resolveSettings(config) {
    if (config.action == 'settings') 
        return config;
    

    var setts = config.settings;

    if (setts) {
        delete config.settings;
        return setts;
    }

    if (config instanceof Array) {

        setts = ruqq.arr.first(config, 'action', '==', 'settings');
        if (setts) {
            ruqq.arr.remove(config, 'action', '==', 'settings');
        }

        return setts;
    }

    if (typeof config === 'object'){
        for (var key in config) {
            var group = config[key];
            if (group.action === 'settings') {
                setts = group;
                delete config[key];
                return setts;
            }

            return resolveSettings(group);
        }
    }

    return null;
}