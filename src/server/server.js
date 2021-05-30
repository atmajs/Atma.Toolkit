var resource = include
    .js(
        './server/middleware/Middleware.js',
        './server/middleware/static.js',
        './server/middleware/proxy.js'
    )

    .done(function (resp) {

        var appConfig = app.config;

        resource.exports = {

            start: function (config) {

                var Server = require('atma-server');


                var port = config.port || process.env.PORT || 5777,
                    proxyPath = config.proxy,
                    proxyOnly = config.proxyOnly,
                    proxyFollowRedirects = config.followRedirects,
                    singlePage = config.singlePage;


                let atmaConfigsPath = new net
                    .Uri(resource.location)
                    .combine('server/config/')
                    .toString()
                    ;

                let base = io
                    .env
                    .applicationDir
                    .combine('src/server/')
                    .toString();

                resource.cfg({
                    path: base
                });

                let configs = [atmaConfigsPath];
                if (config.config) {
                    configs.push(config.config);
                }

                atma.server.app = new Server.Application({
                    configs: configs,
                    config: {
                        debug: true,
                        rewriteRules: singlePage ? [
                            {
                                rule: '^/([\\w_\\-]+)(/[\\w_\\-]+){0,3}(\\?.*)?$ index.html'
                            }
                        ] : (void 0)
                    },
                    args: {
                        debug: true
                    }
                });

                atma.server.app.done(function (app) {

                    mask.cfg('allowCache', false);

                    var bodyParser = require('body-parser'),
                        Url = require('url')
                        ;

                    var responders = [];
                    if (proxyOnly !== true) {
                        responders.push(app.responder({
                            middleware: [
                                function (req, res, next) {
                                    var url = Url.parse(req.url, true);
                                    req.query = url.query;
                                    next();
                                },
                                bodyParser.json()
                            ]
                        }));
                    }
                    responders.push(Server.StaticContent.create({
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    }));
                    responders.push(resp.proxy(proxyPath, { followRedirects: proxyFollowRedirects }));

                    app.responders(responders);

                    var server = require('http')
                        .createServer(app.process.bind(app))
                        .listen(port);

                    if (config.sslPort) {
                        var sslPort = config.sslPort,
                            keyFile = config.key,
                            certFile = config.cert;

                        if (!keyFile || !io.File.exists(keyFile)) {
                            throw new Error(`SSL public Key File not exists. --key "${keyFile}"`);
                        }
                        if (!certFile || !io.File.exists(certFile)) {
                            throw new Error(`CERT File not exists. --cert "${certFile}"`);
                        }
                        var options = {
                            key: io.File.read(keyFile, { encoding: 'buffer' }),
                            cert: io.File.read(certFile, { encoding: 'buffer' }),
                        };
                        require('https')
                            .createServer(options, app.process.bind(app))
                            .listen(sslPort);
                    }


                    var serverCfg = appConfig.server,

                        handlers, pages, websockets, subapps;

                    if (serverCfg) {
                        handlers = serverCfg.handlers,
                            websockets = serverCfg.websockets,
                            subapps = serverCfg.subapps;
                        pages = serverCfg.pages;
                    }


                    handlers && app
                        .handlers
                        .registerHandlers(handlers, app.config.handler)
                        ;

                    websockets && app
                        .handlers
                        .registerWebsockets(websockets, app.config)
                        ;

                    subapps && app
                        .handlers
                        .registerSubApps(subapps)
                        ;

                    pages && app
                        .handlers
                        .registerPages(pages, app.config.page)

                    app
                        .autoreload(server);
                    //    .getWatcher()
                    //    .on('fileChange', function(path){
                    //
                    //        io.File.clearCache(path);
                    //    })
                    //    ;



                    include.cfg('path', null);
                    logger.log('Listen %s'.green.bold, port);
                });
            }
        };

    });
