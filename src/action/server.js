(function(){

    /**
     *  CONFIG
     *
     *      action: 'server',
     *      open: 'url path to open in browser after server has started', is DEFAULT for next raw argument
     *      port: PORT to start at localhost
     */

    include.exports = {
        help: {
            description: 'Start local dev server in current working directory',
            args: {
                port: '<?number> port number, @default: 5777',
                open: '<?string> open path in browser after server start',
                proxy: '<?string> url to a proxy. Pipe request to proxy server if request cannot be handled',
                proxyOnly: '<?flag> no local files or routes are invoked',
                proxyCache: '<?flag> cache requests from remote server',
                config: '<?string> path to additional yml or json configuration file for appcfg and server module',
                sslPort: '<?number> creates also https for the port',
                key: '<?string> keyFile path',
                cert: '<?string> certFile path',
            }
        },
        process (config, done){


            if (config.args)
                config.open = config.args[0];
            
            include
                .js('/src/server/server.js')
                .done(function(resp){
    
                    resp.server.start(config);
    
                    if (config.open){
                        require('openurl').open(String.format(
                            'http://localhost:%1/%2', config.port || 5777, config.open));
                    }
    
                    done();
                });
        }
    }

}());
