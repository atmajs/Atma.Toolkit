

var http_ = require('http'),
	https_ = require('https'),
	url_ = require('url'),

	proxyPath = null,
	matcher = null,
	options = { followRedirects = true };

var Proxy = Class({
	Static: {
		set: function(path){
			proxyPath = path;
		},
		setMatcher: function(mix){
			matcher = mix;
		},
		pipe: function(req, res){
			if (!proxyPath) 
				return false;
			
			if (typeof matcher === 'function') {
				if (!matcher(req.url))
					return false;
			}
			if (matcher && matcher.test) {
				if (!matcher.test(req.url)) 
					return false;
			}
			
			var headers = req.headers,
				method = req.method,
				url = url_.resolve(proxyPath, req.url)
				;
		
			var options = {
				method: method,
				headers: extend({}, headers),
				agent: false,
			};
			
			logger(60)
				.log('<server:proxy>', url, method);
			pipe(req, res, options, url);
			return true;
		}
	}
});

include.exports = function(proxyPath, opts){
	
	if (proxyPath) {
		Proxy.set(proxyPath);
	}
	if (opts) {
		if (opts.followRedirects != null) {
			options.followRedirects = opts.followRedirects;
		}
	}
	
	return function(req, res, next){
		
		if (!proxyPath) 
			return next();
		
		Proxy.pipe(req, res);
	}
};


function pipe(req, res, options_, remoteUrl, redirects) {
	
	if (redirects == null) 
		redirects = 0;
		
	
	if (redirects > 10) {
		res.writeHead(500, {
			'content-type': 'text/plain'
		});
		res.end('Too much redirects, last url: ' + remoteUrl);
		return;
	}
	
	var remote = url_.parse(remoteUrl),
		options = {};
		
	extend(options, options_);
	extend(options, remote);
	options.headers.host = remote.host;
	delete options.headers.connection;
	
	var client = remote.protocol === 'https:'
		? https_
		: http_;
	
	var request = client.request(options, function(response) {
		
		var code = response.statusCode;
		if ((code === 301 || code === 302) && options.followRedirects) {
			
			var location = response.headers.location;
			if (location) {
				pipe(req, res, options_, location, ++redirects);
			}
			return;
		}
		
		res.writeHead(code, response.headers);
		response.pipe(res); 
	});
	
	req.pipe(request);
}



function extend(target, source){
	for (var key in source) {
		if (source[key] != null) {
			target[key] = source[key];
		}
	}
	return target;
}