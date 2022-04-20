import { Application, StaticContent } from 'atma-server'
import { env, File } from 'atma-io'
import { class_Uri } from 'atma-utils';
import { proxify } from './server/middleware/proxy'

declare let global, include, logger, atma, mask;

const location = include.location;


export const Server = {

    async start(config) {
        let appConfig = global.app.config;

        let port = config.port || process.env.PORT || 5777,
            proxyPath = config.proxy,
            proxyOnly = config.proxyOnly,
            proxyFollowRedirects = config.followRedirects,
            singlePage = config.singlePage;


        let atmaConfigsPath = new class_Uri(location)
            .combine('src/server/server/config/')
            .toString()
            ;

        let base = env
            .applicationDir
            .combine('src/server/')
            .toString();

        include.cfg({
            path: base
        });

        let configs = [atmaConfigsPath];
        if (config.config) {
            configs.push(config.config);
        }

        let app = await Application.create({
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

        mask.cfg('allowCache', false);

        let bodyParser = require('body-parser'),
            Url = require('url')
            ;

        let responders = [];
        if (proxyOnly !== true) {
            responders.push(app.responder({
                middleware: [
                    function (req, res, next) {
                        let url = Url.parse(req.url, true);
                        req.query = url.query;
                        next();
                    },
                    bodyParser.json()
                ]
            }));
        }
        responders.push(StaticContent.create({
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }));
        responders.push(proxify(proxyPath, { followRedirects: proxyFollowRedirects }));

        app.responders(responders);

        let server = require('http')
            .createServer(app.process.bind(app))
            .listen(port);

        if (config.sslPort) {
            let sslPort = config.sslPort,
                keyFile = config.key,
                certFile = config.cert;

            if (!keyFile || !File.exists(keyFile)) {
                throw new Error(`SSL public Key File not exists. --key "${keyFile}"`);
            }
            if (!certFile || !File.exists(certFile)) {
                throw new Error(`CERT File not exists. --cert "${certFile}"`);
            }
            let options = {
                key: File.read(keyFile, { encoding: 'binary' }),
                cert: File.read(certFile, { encoding: 'binary' }),
            };
            require('https')
                .createServer(options, app.process.bind(app))
                .listen(sslPort);
        }


        let serverCfg = appConfig.server,

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

        include.cfg('path', null);
        logger.log('Listen %s'.green.bold, port);



        (atma.server || (atma.server = {})).app = app;
    }
};
