include.exports = {
	extractImages: function(baseuri, uri, content) {

		var regexp = new RegExp(/url[\s]*\(('|")?([^)'"]+)('|")?\)/gi),
		    imgbin = [],
		    match = regexp.exec(content),
			href;

		while (match && match.length > 1 && match[2]) {
			href = match[2].trim();
			
			if (!href) {
				console.error('NOT MATCHED', match);
			}
			console.log('CSS match', href);

			var imguri = new net.URI(href),
				base = href[0] === '/' ? baseuri : uri;
				
			if (href[0] === '/') {
				href = href.substring(1);
			}

			imgbin.push({
				mimeType: 'image/png',
				href: href,
				uri: imguri.isRelative() ? base.combine(imguri) : imguri,
				baseuri: uri
			});

			match = regexp.exec(content);
		}

		return imgbin;
	},
	replace: function(source, original, rewrite) {
		var start = 0,
			found = -1;
		while (~ (found = source.indexOf(original, found + 1))) {
			var before = source[found - 1];
			if (/[\s"'\(]/i.test(before) == false) continue;

			source = source.substring(0, found) + rewrite + source.substring(found + original.length);
		}
		return source;
	}
}