void function(){
    
    var w = global,
        p = program;
    
    var file = new io.File(p.args[0]);
    
    if (file.uri.extension == 'config'){
        w.config = JSON.parse(file.read());
    }else{
        w.config = {
            file: p.args[0],
            minify: p.minify
        };
    }
    
    
    var uri = new net.URI(w.config.file);
    if (uri.isRelative()) {
        uri = io.env.currentDir.combine(w.config.file);
    }

    var type = {
            htm: 'html',
            html: 'html',
            js: 'js'
    }[uri.extension] || w.config.type;
    
    if (!type) return console.error('Unknown Solution Type');

    w.config.uri = uri;
    w.config.type = type;
    
    
    var array = p.rawArgs;
    for(var i = 0, x, length = array.length; x = array[i], i<length; i++){
        if (x[0] != '-') continue;
        var key = x.substring(1);
        
        var value = array[++i];
        if (!value) continue;
        
        if (value[0] == '"') value = value.substring(1, value.length - 1);
        
        
        w.config[key] = value;
    }
    
    w.config.state = 4;
    return null;
}();