

var http = require('http'),
	Url = require('url'),
	proxyPath = null,
	matcher = null;

var Proxy = Class({
	Static: {
		set: function(path){
			proxyPath = Url.parse(path);
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
			
			logger(60).log(' - prox - ', req.url);
			
			var options = Object.extend({
				headers: req.headers,
				method: req.method
			}, proxyPath);
			
			Object.extend(options, Url.parse(req.url));
			
			options.headers.host = proxyPath.host;
			
			var proxy = http.request(options, function(response){
				res.writeHeader(response.statusCode, response.headers);
				
				response.pipe(res, {end: true});
			});
			
			req.pipe(proxy, {end: true});
			
			
			return true;
			
		}
	}
});

include.exports = function(proxyPath){
	
	if (proxyPath) 
		Proxy.set(proxyPath);
	
	return function(req, res, next){
		
		if (!proxyPath) 
			return next();
		
		Proxy.pipe(req, res);
	}
};