void

function() {
    var w = window;

    w.urlhelper = {
        resolveAppUri: function(url, current) {
            if (url[0] == '/') return url;
            if (!current || url.substring(0, 4) == 'file') return '/';

            var index = current.lastIndexOf('/');
            return (index == -1 ? '/' : (current.substring(index + 1, -index))) + url;
        },
        resolveUri: function(url, parentLocation) {
            if (solution == null) return new net.URI('');
            
            var _url = '';
            
            if (url[0] == '/') {
                _url = solution.directory + url.substring(1);
            }
            else if (url.substring(0, 4) == 'file') {
                _url = url;
            } else if (parentLocation != null) {
                _url = net.URI.combine(parentLocation, url);
            }
            
            return new net.URI(_url);
        },
        getDir: function(url) {
            if (!url) return '/';
            var index = url.lastIndexOf('/');
            return index == -1 ? '' : url.substring(index + 1, -index);
        },
        isSubDir: function(basepath, path){
            var basedir = this.getDir(basepath),
                dir = this.getDir(path);
            
            return dir.toLowerCase().indexOf(basedir.toLowerCase()) == 0;
        }
    }


    w.xhr = {
        load: function(url, callback) {
            var xhr = new XMLHttpRequest();
            
            xhr.onreadystatechange = function() {
                xhr.readyState == 4 && callback(xhr.responseText);
            };

            xhr.open('GET', url, false);
            xhr.send();
        }
    }
}();