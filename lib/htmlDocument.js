void

function() {
    var w = window;

    w.HtmlDocument = {
        createHtml: function(solution, builtOutput) {
            var doc = document.implementation.createHTMLDocument('');
            doc.documentElement.innerHTML = solution.resource.source;



            function removeAll(tagName, ifattr, value) {
                var elements = doc.getElementsByTagName(tagName);
                for (var i = 0; i < elements.length; i++) {
                    if (ifattr && !elements[i].getAttribute(ifattr)) continue;
                    else if (value && ifattr && elements[i].getAttribute(ifattr) == value) continue;

                    elements[i].parentNode.removeChild(elements[i]);
                }
            }
            function appendElement(parentTagName, name, attr) {
                var tag = doc.createElement(name);
                for (var key in attr) {
                    tag.setAttribute(key, attr[key]);
                }
                doc.getElementsByTagName(parentTagName)[0].appendChild(tag)
                return tag;
            }


            removeAll('script', 'src');
            removeAll('link', 'rel', 'stylesheet');

            builtOutput.js && appendElement('head', 'script', {
                type: 'application/javascript',
                src: solution.uris.outputDirectory.combine('script.js').toRelativeString(solution.uri)
            });

            builtOutput.css && appendElement('head','link', {
                rel: 'stylesheet',
                href: solution.uris.outputDirectory.combine('style.css').toRelativeString(solution.uri)
            });

            if (builtOutput.lazy || builtOutput.load) {                
                appendElement('body','div', {
                    id: 'build.release.xhr',
                    style: 'display: none;'
                }).innerHTML = (builtOutput.lazy || '') + (builtOutput.load || '');
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
}();