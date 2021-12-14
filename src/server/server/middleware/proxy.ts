import http_ from 'http'
import https_ from 'https'
import url_ from 'url'
import path_ from 'path'

declare let logger;

let proxyPath = null,
    matcher = null,
    proxyOptions = { followRedirects: false, proxyCache: false },
    CACHE = []
    ;


class Proxy {

    static set (path){
        proxyPath = path;
    }
    static setMatcher (mix){
        matcher = mix;
    }
    static pipe (req, res){
        if (!proxyPath) {
            return false;
        }
        if (typeof matcher === 'function') {
            if (!matcher(req.url)) {
                return false;
            }
        }
        if (matcher?.test) {
            if (!matcher.test(req.url)) {
                return false;
            }
        }
        let headers = req.headers,
            method = req.method,
            url = url_.resolve(proxyPath, req.url)
            ;
        let options = {
            method: method,
            headers: extend({}, headers),
            agent: false,
        }
        logger(60)
            .log('<server:proxy>', url, method);
        pipe(req, res, options, url);
        return true;
    }
};

export const proxify = function(proxyPath, opts){

    if (proxyPath) {
        Proxy.set(proxyPath);
    }
    if (opts) {
        if (opts.followRedirects != null) {
            proxyOptions.followRedirects = opts.followRedirects;
        }
        if (opts.proxyCache != null) {
            proxyOptions.proxyCache = opts.proxyCache;
        }
    }

    return function(req, res, next){

        if (!proxyPath)
            return next();

        Proxy.pipe(req, res);
    }
};


function pipe(req, res, options_, remoteUrl, redirects?) {

    if (redirects == null)
        redirects = 0;


    if (redirects > 10) {
        res.writeHead(500, {
            'content-type': 'text/plain'
        });
        res.end('Too much redirects, last url: ' + remoteUrl);
        return;
    }

    let remote = url_.parse(remoteUrl),
        options = {} as any,
        isCachable = CacheHelper.isCachable(req);

    if (isCachable && CacheHelper.fromCache(req, res)) {
        return;
    }

    extend(options, options_);
    extend(options, remote);
    options.headers.host = remote.host;
    delete options.headers.connection;

    let client = remote.protocol === 'https:'
        ? https_
        : http_;

    let request = client.request(options, function(response) {

        let code = response.statusCode;
        if (code === 301 || code === 302) {

            let location = response.headers.location;
            if (location) {
                location = locationNormalize(location, req);

                if (proxyOptions.followRedirects) {
                    pipe(req, res, options_, location, ++redirects);
                    return;
                }
                if (location.indexOf(proxyPath) > -1) {
                    let path = location.replace(proxyPath, '');
                    let host = resolveHostForRedirect(req);
                    response.headers.location = host + path;
                }
            }
        }


        res.writeHead(code, response.headers);

        if (isCachable) {
            let chunks = [];
            response
                .on('data', function(chunk) {
                    chunks.push(chunk);
                    res.write(chunk);
                })
                .on('end', function() {
                    res.end();
                    let buffer = Buffer.concat(chunks);
                    CacheHelper.saveCache(req, code, response.headers, buffer);
                });
        } else {
            response.pipe(res);
        }
    });

    req.pipe(request);
}



function extend(target, source){
    for (let key in source) {
        if (source[key] != null) {
            target[key] = source[key];
        }
    }
    return target;
}

function resolveHostForRedirect (req) {
    if (req.headers.origin != null) {
        return req.headers.origin;
    }
    if (req.headers.host) {
        return (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers.host;
    }
    return '/';
}
function locationNormalize(location, req) {
    if (location[0] === '/') {
        location = path_.join(proxyPath, location);
    }
    location = location.replace(/\\/g, '/');
    if (/^\w+:\/[^\/]/.test(location)) {
        location = location.replace('/', '//');
    }
    return location;
}


let CacheHelper = {
    isCachable (req) {
        if (proxyOptions.proxyCache === false) {
            return false;
        }
        let method = req.method.toLowerCase();
        if (method !== 'get' && method !== 'options') {
            return false;
        }
        return true;
    },
    fromCache (req, res) {
        let cache = this.getCache(req);
        if (cache == null) {
            return false;
        }

        res.writeHead(cache.code, cache.headers);
        res.end(cache.body);
        return true;
    },
    saveCache (req, code, headers, body) {
        let cache = {
            url: req.url,
            method: req.method,
            code: code,
            headers: headers,
            body: body
        };
        CACHE.push(cache);
    },

    getCache (req) {
        return CACHE.find(x => x.url === req.url && x.method === req.method);
    }
};
