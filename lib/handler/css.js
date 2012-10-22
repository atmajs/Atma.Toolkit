void function(){
    
    var w = window,
        helper = {
            getRewritenPath: function(uri, original, cssDirectory){            
                var path = uri.toRelativeString(cssDirectory);
                
                return path;
            }
        }
    
    
    include.promise('handler').CssHandler = Class({
        Construct: function(solutionUri, outputDirectoryUri, resource){
            
            var copyImages = !urlhelper.isSubDir(solutionUri.toString(), resource.uri.toString()),
                images = w.parser.css.extractImages(solutionUri, resource.uri, resource.source);
            
            
            for(var i = 0, x, length = images.length; x = images[i], i<length; i++){
                
                if (copyImages){
                    var path = outputDirectoryUri.combine('images/').combine(resource.id || ''),
                        uri = solutionUri.combine(path).combine(resource.file);
                    
                    
                    new File(x.uri).copyTo(uri);
                    
                    x.replaceWith = helper.getRewritenPath(uri, x.href, outputDirectoryUri.toDir());
                }else{                    
                    x.replaceWith = helper.getRewritenPath(x.uri, x.href, outputDirectoryUri.toDir());                    
                }
                
                if (x.replaceWith)
                    resource.source = w.parser.css.replace(resource.source, x.href, x.replaceWith);
            }
            
            
        }
    })
    
}();