(function() {


	var createDoc = (function(){
		
		var _cheerio;
		return function(html){
			if (_cheerio == null) 
				_cheerio = require('cheerio');
				
			return _cheerio.load(html);
		};
	}());


	include.promise('parser').html = include.exports = {
		rewriteUrls: function(resource, line1, line2) {
			var json = {},
				$ = createDoc(resource.content)
				
			$('script[src]').each(function(i, el){
				var attr = el.attribs.src;
				if (attr.indexOf(line1) === -1)
					return;
				
				el.attribs.src = attr.replace(line1, line2);
			})

			resource.content = $.html();
		},
		extractIncludes: function(htmlSource, directory) {
			var dfr = new Class.Deferred,
				$ = createDoc(htmlSource),
				includes = []
				;
			
			directory = new net.Uri(directory);
			

			function add(type, x) {
				var url, appuri;
				if (x[0] == '/') {
					appuri = x;
					url = x.substring(1);
				} else {
					appuri = '/' + x;
					url = x;
				}

				includes.push({
					type: type,
					url: x,
					uri: directory.combine(url),
					namespace: '',
					appuri: appuri
				});
				
			}

			$('script[src]')
				.filter(function(i, x){
					return x.attribs.ignore == null;
				})
				.each(function(i, x){
					add('js', x.attribs.src);
				});
			
			$('link[href]')
				.filter(function(i, x) {
					return x.attribs.ignore == null;
				})
				.each(function(i, x){
					add('css', x.attribs.href);
				});
			
			var templates = $('script[type="text/mask"]')
				.map(function(i, x){
					return $(x).html()
				})
				.toArray();	
			getMaskDependencies('/', templates, function(list){
				var map = {
					'mask': 'load',
					'data': 'load',
					'style': 'css',
					'script': 'js'
				};
				for(var key in list) {
					list[key].forEach(function(url){
						add(map[key], url);
					});
				}
				dfr.resolve(includes);
			});

			return dfr;
		}
	};
	
	function getMaskDependencies(path, arr, cb) {
		var data = {};
		function next () {
			if (arr.length === 0) {
				cb(data);
				return;
			}
			var template = arr.shift();
		
			mask
				.Module
				.getDependencies(template, path, { flattern: true })
				.fail(function(error) {
					logger.error(error);
				})
				.done(function(list) {
					for (var key in list) {
						if (data[key] == null) {
							data[key] = list[key];
							continue;
						}
						data[key] = data[key].concat(list[key]);
					}
					next();
				});
		}
		next();
	}
}());
