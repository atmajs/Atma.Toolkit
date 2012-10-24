include.js({
    formatter: 'uglify'
}).done(function() {

    var fs = require('fs'),
        w = global;


    window.io.fileFactory.registerHandler([/\.js$/], Class({
        Base: io.File,        
        write: function(content){
            
            if (w.solution.config.minify){
                var ast;
                ast = jsp.parse(content);
                ast = pro.ast_mangle(ast);
                //-ast = pro.ast_squeeze(ast);
                    
                content = pro.gen_code(ast);
            }
            
            io.File.prototype.write.call(this, content);            
        }
    }));
});