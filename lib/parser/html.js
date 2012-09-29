void function(){

var w = window,
    r = ruqq;

w.include.promise('parser').html = {
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

        function add(type, x) {
            var url, appuri;
            if (x[0] == '/') {
                appuri = x;
                url = directory + x.substring(1);
            } else {
                appuri = '/' + x;
                url = directory + x;
            }
            includes.push({
                type: type,
                url: x,
                uri: new net.URI(url),
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