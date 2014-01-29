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
			var $ = createDoc(htmlSource),
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

			return includes;
		}
	};
}());
