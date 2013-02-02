(function(){

    /**
     *  CONFIG
     *
     *      action: 'server',
     *      open: 'url path to open in browser after server has started', is DEFAULT for next raw argument
     *      port: PORT to start at localhost
     */

    include.exports = {
        process: function(config, done){


            if (config.args){
                config.open = config.args[0];
            }

            include.js('/src/server/server.js').done(function(resp){

                resp.server.start(config);

                if (config.open){
                    require('openurl').open(String.format('http://localhost:%1/%2', config.port || 5777, config.open));
                }

                done && done();
            });
        }
    }

}());
