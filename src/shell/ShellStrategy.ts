import { Collection } from 'ruta'

declare let atma, global, logger;


export const ShellStrategy = class {
    routes: any;
    strategy: any;

    constructor (strategy){

        this.routes = new Collection();
        this.strategy = strategy;

        for (var key in strategy){

            this.routes.add(key, strategy[key]);
        }
    }

    process (path, config, done) {

        var route = this.routes.get(path);
        if (route == null) {

            logger
                .warn('[available strategy]:'.bold)
                .log(Object.keys(this.strategy))
                ;

            done('Invalid arguments `' + path + '`');
        }

        route.value(route.current.params, config, done);
    }
};
