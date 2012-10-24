void

function() {


    var w = window,
        r = ruqq,
        helper = {
            rewriteResource: function(doc, resource) {

                if (!resource.path) return;

                if (resource.type != 'css' && resource.type != 'js') return;


                var tagName = {
                    js: 'script',
                    css: 'link'
                }[resource.type],

                    attr = {
                        js: 'src',
                        css: 'href'
                    }[resource.type];

                var nodes = doc.getElementsByTagName(tagName),
                    url = resource.url.toLowerCase();


                for (var i = 0, x, length = nodes.length; x = nodes[i], i < length; i++) {
                    var value = x.getAttribute(attr);

                    if (value.toLowerCase() == url) {
                        x.setAttribute(attr, resource.rewrite);
                    }
                }
            }
        }




        w.include.promise('parser').html = {
            rewriteUrls: function(resource, line1, line2) {
                var json = {},
                    docHelper = HtmlDocument.helper,
                    doc = docHelper.createDoc(resource.source);

                var arr = doc.getElementsByTagName('script');
                for (var i = 0, x, length = arr.length; x = arr[i], i < length; i++) {
                    var src = x.getAttribute('src');
                    if (src && src.indexOf(line1) > -1) {
                        x.setAttribute('src', src.replace(line1, line2));
                    }
                }

                ////////////////doc.removeAll('script', 'src').removeAll('link', 'rel', 'stylesheet');
                ////////////////
                ////////////////for (var i = 0, x, length = resource.includes.length; x = resource.includes[i], i < length; i++) {
                ////////////////    var url = x.rewrite || x.url;
                ////////////////
                ////////////////    switch (x.type) {
                ////////////////    case 'css':
                ////////////////        doc.appendResource('link', {
                ////////////////            href: url,
                ////////////////            rel: 'stylesheet'
                ////////////////        });
                ////////////////        break;
                ////////////////    case 'js':
                ////////////////        doc.appendResource('script', {
                ////////////////            src: url,
                ////////////////            type: 'application/javascript'
                ////////////////        });
                ////////////////        break;
                ////////////////    }
                ////////////////}
                ////////////////
                ////////////////for (var key in rewrites) {
                ////////////////    var x = rewrites[key];
                ////////////////    if (!x.path) continue;
                ////////////////
                ////////////////    json[x.id] = x.rewrite;
                ////////////////    helper.rewriteResource(doc, rewrites[key]);
                ////////////////}
                ////////////////
                ////////////////var tag = doc.createTag('script', {
                ////////////////    type: 'application/javascript',
                ////////////////    innerHTML: "window.IncludeRewrites = " + JSON.stringify(json)
                ////////////////}),
                ////////////////    head = doc.first('head');
                ////////////////
                ////////////////head.insertBefore(tag, head.childNodes[0]);
                ////////////////
                ////////////////if (solution.loader && solution.loader.config) {
                ////////////////    var tag = doc.createTag('script', {
                ////////////////        type: 'application/javascript',
                ////////////////        innerHTML: "include.cfg(" + JSON.stringify(solution.loader.config) + ");"
                ////////////////    });
                ////////////////    var $include = doc.first('script', function(x) {
                ////////////////        var src = x.getAttribute('src');
                ////////////////        return src && src.indexOf('include.js') > -1;
                ////////////////    });
                ////////////////    
                ////////////////    if (!$include) throw new Error('include.js is not in document, oder was renamed.');
                ////////////////    
                ////////////////    var $parent = $include.parentNode,
                ////////////////        fn = $include.nextSibling ? 'insertBefore' : 'appendChild';
                ////////////////    
                ////////////////    $parent[fn](tag, $include.nextSibling);
                ////////////////    
                ////////////////}



                resource.source = "<!DOCTYPE html>" + sys.newLine + doc.documentElement.innerHTML;

            },
            extractIncludes: function(htmlSource, directory) {
                var docHelper = HtmlDocument.helper,
                    doc = docHelper.createDoc(htmlSource);

                var includes = [];
                directory = new net.URI(directory);

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

                doc.getAllAttributes('script', 'src').each(add.bind(this, 'js'));
                doc.getAllAttributes('link', 'href').each(add.bind(this, 'css'));


                var loaderIndex = r.arr.indexOf(includes, function(x) {
                    return x.url.indexOf('include.loader.js') > -1;
                });

                if (loaderIndex > -1) {
                    var $loader = r.arr.first(doc.getElementsByTagName('script'), function(x) {
                        var src = x.getAttribute('src');
                        return src && src.indexOf('include.loader.js') > -1;
                    }),
                        loaderUrl = $loader.getAttribute('src'),
                        loaderMain = $loader.getAttribute('main');


                    solution.loader = new w.parser.Loader(directory.combine(loaderUrl), loaderMain);


                    var arr = solution.loader.includes;


                    arr.unshift(1);
                    arr.unshift(loaderIndex);

                    includes.splice.apply(includes, arr);
                    //-includes.splice(loaderIndex, 1, arr);

                }

                return includes;
            }
        }

}();