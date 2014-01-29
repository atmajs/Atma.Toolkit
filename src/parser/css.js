include.exports = {
	extractResources: function(baseuri, uri, content) {

		var regexp = new RegExp(/url[\s]*\(('|")?([^)'"]+)('|")?\)/gi),
		    imgbin = [],
		    match = regexp.exec(content),
			href;
		
		
		while (match && match.length > 1 && match[2]) {
			href = match[2].trim();
			
			if (!href) 
				logger.error('NOT MATCHED', match);
			
			
			
			if (isAbsolute(href) === false) { 
					
				var base = href[0] === '/' ? baseuri : uri,
					imguri = new net.Uri(href[0] === '/' ? href.substring(1) : href);
				
	
				imgbin.push({
					mimeType: 'image/png',
					href: href,
					uri: base.combine(imguri),
					baseuri: uri
				});
			}

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
};


function isAbsolute(href) {
	if (href == null) 
		return true;
	
	if (/^\s*data:/.test(href)) 
		return true;
	
	return /^[\w]{1,8}:\/\//.exec(href) != null;
}