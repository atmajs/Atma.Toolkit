include.js({
	script: 'html/Document'
}).done(function(resp) {

	include.exports = {
		build: function(solution, builtOutput) {
			var doc = new resp.Document(solution.resource.content);

			ruqq//
            .arr(doc.getElementsByTagName('script')) //
			.where(function(x) {
				if (x.getAttribute('ignore')) {
					return false;
				}
				return !!x.getAttribute('src');
			}).each(function(x) {
				x.parentNode.removeChild(x);
			});


			ruqq//
            .arr(doc.getElementsByTagName('link')) //
			.where(function(x) {
				return x.getAttribute('rel') == 'stylesheet';
			}).each(function(x) {
				x.parentNode.removeChild(x);
			});


			if (builtOutput.css) {
				var href = solution.uris.outputDirectory.combine('style.css').toRelativeString(solution.uri);

				if (solution.config.version) {
					href += '?v=' + solution.config.version;
				}
				doc.appendResource('link', {
					rel: 'stylesheet',
					href: href
				});
			}


			if (builtOutput.lazy || builtOutput.load) {
				var tag = doc.createTag('div', {
					id: 'build.release.xhr',
					style: 'display: none;',
					hidden: 'hidden',
					innerHTML: (builtOutput.lazy || '') + (builtOutput.load || '')
				});
				doc.first('body').appendChild(tag);
			}

			if (builtOutput.js) {
                var src = solution.uris.outputDirectory.combine('script.js').toRelativeString(solution.uri);
                if (solution.config.version) {
					src += '?v=' + solution.config.version;
				}
                
				var tag = doc.createTag('script', {
					type: 'text/javascript',
					src: src
				});
				doc.first('body').appendChild(tag);
			}

			var doctype = doc.doctype;
			if (doctype) {
				doctype = "<!DOCTYPE " + doctype.name + (doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : '') + (!doctype.publicId && doctype.systemId ? ' SYSTEM' : '') + (doctype.systemId ? ' "' + doctype.systemId + '"' : '') + '>';
			} else {
				doctype = "<!DOCTYPE html>";
			}

			builtOutput.html = doctype + doc.documentElement.innerHTML;

		}
	};

});