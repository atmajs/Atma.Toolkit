include.js({
	script: 'html/Document::Document'
}).done(function(resp) {

	include.exports = {
		build: function(solution, builtOutput) {
			var doc = new resp.Document(solution.resource.content);

			doc.removeAll('script', 'src').removeAll('link', 'rel', 'stylesheet');



			builtOutput.css && doc.appendResource('link', {
				rel: 'stylesheet',
				href: solution.uris.outputDirectory.combine('style.css').toRelativeString(solution.uri)
			});

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
				var tag = doc.createTag('script', {
					type: 'application/javascript',
					src: solution.uris.outputDirectory.combine('script.js').toRelativeString(solution.uri)
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