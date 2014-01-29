(function() {
	
	var createDoc = (function(){
		
		var _cheerio;
		return function(html){
			if (_cheerio == null) 
				_cheerio = require('cheerio');
				
			return _cheerio.load(html);
		};
	}());
	
	include.exports = {
		build: function(solution, builtOutput) {
			var $ = createDoc(solution.resource.content);

			$('script[src]')
				.filter(function(i, x){
					return x.attribs.ignore == null;
				})
				.remove()
				;
			
			$('link[href]')
				.filter(function(i, x){
					return x.attribs.ignore == null;
				})
				.remove()
				;
			

			if (builtOutput.css) {
				var href = solution
					.uris
					.outputDirectory
					.combine('style.css')
					.toRelativeString(solution.uris.outputMain);

				if (solution.config.version) {
					href += '?v=' + solution.config.version;
				}
				
				$('head').append($('<link>').attr({
					rel: 'stylesheet',
					href: href
				}));
			}


			if (builtOutput.lazy || builtOutput.load) {
				var $div = $('<div>')
					.attr({
						id: 'build.release.xhr',
						style: 'display: none;',
						hidden: 'hidden'
					})
					.html((builtOutput.lazy || '') + (builtOutput.load || ''))
					;
				$('body').append($div);
			}

			if (builtOutput.js) {
                var src = solution
					.uris
					.outputDirectory
					.combine('script.js')
					.toRelativeString(solution.uris.outputMain);
					
                if (solution.config.version) {
					src += '?v=' + solution.config.version;
				}
                
				var $div= $('<script>').attr({
					type: 'text/javascript',
					src: src
				});
				$('body').append($div);
			}
			//
			//var doctype = $.doctype;
			//if (doctype) {
			//	doctype = "<!DOCTYPE "
			//		+ doctype.name
			//		+ (doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : '')
			//		+ (!doctype.publicId && doctype.systemId ? ' SYSTEM' : '')
			//		+ (doctype.systemId ? ' "' + doctype.systemId + '"' : '') + '>';
			//		
			//} else {
			//	doctype = "<!DOCTYPE html>";
			//}

			builtOutput.html = $.html(); //doctype + $.documentElement.innerHTML;

		}
	};

}());