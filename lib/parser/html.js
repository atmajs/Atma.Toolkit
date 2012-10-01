void function(){

var w = window,
    r = ruqq,
    helper = {
        rewriteResource: function(doc, resource){
            
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
            
            var nodes = doc.getElementsByTagName(tagName), url = resource.url.toLowerCase();
            
            
            for(var i = 0, x, length = nodes.length; x = nodes[i], i<length; i++){
                var value = x.getAttribute(attr);
                
                if (value.toLowerCase() == url){
                    x.setAttribute(attr, resource.rewrite);
                }
            }
        }
    }

    
    
    
w.include.promise('parser').html = {
    rewriteUrls: function(resource, rewrites){
        var doc = document.implementation.createHTMLDocument(''),
            json = {};
        doc.documentElement.innerHTML = resource.source;
        
        
        
        for(var key in rewrites){
            var x = rewrites[key];
            if (!x.path) continue;
            
            json[x.id] = x.rewrite;            
            helper.rewriteResource(doc, rewrites[key]);
        }
        
        var tag = doc.createElement('script');
        tag.setAttribute('type','application/javascript');
        tag.innerHTML = "window.IncludeRewrites = " + JSON.stringify(json);
        
        var head = doc.getElementsByTagName('head')[0];
        head.insertBefore(tag, head.childNodes[0]);
        
        resource.source = "<!DOCTYPE html>" + sys.newLine + doc.documentElement.innerHTML;
        
    },
    extractIncludes: function(htmlSource, directory) {
        var doc = document.implementation.createHTMLDocument('');
        doc.documentElement.innerHTML = htmlSource;

        function getAll(name, attr) {
            return r.arr(doc.getElementsByTagName(name)).where(function(x) {
                return !!x.getAttribute(attr) && /:\/\/|^\/\//.test(x.getAttribute(attr)) == false;
            }).map(function(x) {
                return x.getAttribute(attr);
            });
        }

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

        getAll('script', 'src').each(add.bind(this, 'js'));
        getAll('link', 'href').each(add.bind(this, 'css'));
        
        
        return includes;
    }
}

}();