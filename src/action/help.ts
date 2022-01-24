declare let global, include, logger, app;

var tab = 1;

function write(message, indent = 0) {

    indent += tab;

    var pref = '';

    while (--indent > -1)
        pref += '   ';

    logger.log(pref + message.color.white);
}

function newLine() {
    write('');
}

export const HelpAction = {
    process () {

        console.log('HELP');

        logger.cfg('logCaller', false);


        var actions = app.config.actions,
            args = app.config.$cli.args,
            action = args[0];

        newLine();
        newLine();

        if (action) {

            help_action(action);
        }else{

            help_generic();
        }


        newLine();
    }
};

/*
 *      Utils
 */


function help_generic() {
    write('bg_green<bold<Atma Toolkit>> usage:');

    newLine();
    write('$ atma [action] [arguments ...]'.cyan, 1);
    write('$ atma [config path] [arguments ...]'.cyan, 1);

    newLine();
    write('Some actions can be run direct from cli,');
    write('but some only via configuration file,');
    write('as they require complex arguments');

    newLine();
    write('Actions:'.bold, 1);

    Object.keys(app.config.actions).forEach(function(action){
         write(action, 2);
    });

    newLine();

    write('To get more help for each action enter:', 1)
    write('$ atma [action] --help'.cyan, 2);

    newLine();

    write('In case of any issue, please contact green<bold<team@atma.dev>>');
    write('You can also attach a log output:');
    write('$ atma [arguments] --level 99 --no-color > output.log'.cyan, 1);

    newLine();
    write('Happy Coding.')
}

function help_action(action) {

    if (action in app.config.actions === false) {
        logger.error('Action not found: ', action);
        logger.log('$ atma --help'.bold);
        return;
    }

    logger.log(' Action: bold<%s>'.color.white, action);

    app
        .findAction(action)
        .done(function(handler){
            var help = handler.help;

            if (handler.strategy) {
                if (help == null)
                    help = {};

                help.routes = Object.keys(handler.strategy);
            }

            if (help == null) {
                logger.log('< no help information yet >');
                return;
            }

            logger.log(help);
        })
}
