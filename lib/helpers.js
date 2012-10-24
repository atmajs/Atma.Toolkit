void

function() {
    var w = window,
        fs = require('fs');

    w.urlhelper = {
        resolveAppUri: function(url, current) {
            if (url[0] == '/') return url;
            if (!current || url.substring(0, 4) == 'file') return '/';

            var index = current.lastIndexOf('/');
            return (index == -1 ? '/' : (current.substring(index + 1, -index))) + url;
        },
        resolveUri: function(url, parentLocation) {
            if (solution == null) return new net.URI('');
            
            if (url[0] == '/'){
                parentLocation = solution.directory;
                url = url.substring(1);
            }
            
            var uri = new net.URI(url);
            
            return uri.isRelative() ? (new net.URI(parentLocation)).combine(uri) : uri;            
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

    w.referenceHelper = {
        create: function(solutionDir, name, referenceSource){
            var dir = new io.Directory(referenceSource);
            if (dir.exists() == false) return console.error('Directory do not exist.');
        
            if (name == null) name = dir.getName();
            
            var targetDir = new io.Directory(solutionDir.combine('.reference/' + name))
            if (targetDir.exists()) return console.error('Reference with the name "%s" already exists', name);
        
        
            new io.Directory(solutionDir.combine('.reference/')).ensure();
        
        
            fs.symlinkSync(dir.uri.toLocalDir(), targetDir.uri.toLocalDir(), 'dir');
            return null;
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