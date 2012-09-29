void function(){
    
    var w = window,
        helper = {
            getRewritenPath: function(uri, original, cssDirectory){            
                var path = uri.toRelativeString(cssDirectory);
                
                return path;
            }
        }
    
    
    include.promise('handler').CssHandler = Class({
        Construct: function(solutionUri, outputDirectory, resource){
            
            var handlePath = true, copyImages;
            
            if (urlhelper.isSubDir(solutionUri.toString(), resource.uri.toString()) == false){
                copyImages = true;
            }
            
            var images = w.parser.css.extractImages(solutionUri, resource.uri, resource.source);
            
            var arr = [];
            for(var i = 0, x, length = images.length; x = images[i], i<length; i++){
                
                if (!copyImages){
                    x.replaceWith = helper.getRewritenPath(x.uri, x.href, outputDirectory);                    
                }else{
                    var path = net.URI.combine(outputDirectory, 'images', resource.id || ''),
                        uri = solutionUri.combine(path).combine(resource.file);
                    
                    x.replaceWith = helper.getRewritenPath(uri, x.href, outputDirectory);
                    
                    arr.push({
                       copyFrom: x.uri,
                       copyTo: uri
                    });
                }
                
                if (x.replaceWith)
                    resource.source = w.parser.css.replace(resource.source, x.href, x.replaceWith);
            }
            
            return arr;
            
        }
    })
    
}();