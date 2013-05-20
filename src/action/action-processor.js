include.js('/src/helper/globals.js').done(function(resp) {

    var _actions = resp.globals.actions,
        _resource = include,
        _config, _done, _index;


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

        var handler, handlerPath = _actions[current.action];
        
        if (!handlerPath) {
            console.warn('Error: Unknown Handler', current.action);
            process();
            return;
        }
        
        _resource.js(handlerPath + '::Handler').done(function(resp){
            if (resp.Handler == null){
                console.error('Handler could not be loaded', handlerPath);
                process();
                return;
            }
            if (typeof resp.Handler.process !== 'function') {
                console.error('Action Handler exports no process function - \
                              use include.exports = {process: function(config, onComplete){}}');
                
                process();
                return;
            }
            
            resp.Handler.process(current, process);
        });
    }

});
