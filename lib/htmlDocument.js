void

function() {
    var w = window, r = ruqq;

    var $doc = {
        removeAll: function(tagName, ifattr, value) {
            var elements = this.getElementsByTagName(tagName);
            for (var i = 0; i < elements.length; i++) {
                
                if (ifattr && !elements[i].getAttribute(ifattr)) continue;
                if (value && elements[i].getAttribute(ifattr) != value) continue;
                elements[i].parentNode.removeChild(elements[i]);
            }
            return this;
        },
        createTag: function(tagName, attr){
            var tag = this.createElement(tagName);
            for (var key in attr) {
                switch(key){
                    case 'innerHTML':
                        tag[key] = attr[key];
                        continue;
                }
                
                tag.setAttribute(key, attr[key]);
            }
            return tag;
        },
        appendResource: function(tagName, attr){
            var tag = this.createTag(tagName, attr);
            this.first('head').appendChild(tag)
            return tag;
        },
        
        getAllAttributes: function(tagName, attr){                
            return r.arr(this.getElementsByTagName(tagName)).where(function(x) {
                return !!x.getAttribute(attr) && /:\/\/|^\/\//.test(x.getAttribute(attr)) == false;
            }).map(function(x) {
                return x.getAttribute(attr);
            });
        },
        first: function(tagName, arg){
            var elements = this.getElementsByTagName(tagName);
            
            if (typeof arg == 'function'){
                for(var i = 0, x, length = elements.length; x = elements[i], i<length; i++){
                    if (arg(x)) return x;
                }
            }
            
            return elements[0];
        }
    }
    
    w.HtmlDocument = {
        helper : {
            createDoc: function(html){
                var doc = document.implementation.createHTMLDocument('');                
                doc.documentElement.innerHTML = html;
                
                for(var key in $doc){
                    doc[key] = $doc[key];
                }            
                return doc;
            }
            
        },
        createSolutionHtml: function(solution, builtOutput) {
            var S = solution,
                doc = this.helper.createDoc(S.resource.source);
            
            
            doc.removeAll('script', 'src').removeAll('link', 'rel', 'stylesheet');

            builtOutput.js && doc.appendResource('script', {
                type: 'application/javascript',
                src: S.uris.outputDirectory.combine('script.js').toRelativeString(S.uri)
            });

            builtOutput.css && doc.appendResource('link', {
                rel: 'stylesheet',
                href: S.uris.outputDirectory.combine('style.css').toRelativeString(S.uri)
            });

            if (builtOutput.lazy || builtOutput.load) {                
                var tag = doc.createTag('div', {
                    id: 'build.release.xhr',
                    style: 'display: none;',
                    innerHTML: (builtOutput.lazy || '') + (builtOutput.load || '')
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
}();