;(function() {

    var fs = require('fs'),
        w = global;


    window.io.fileFactory.registerHandler([/\.js$/], Class({
        Base: io.File,        
        write: function(content){
            
            if (w.solution.config.minify){
                var uglify = require("uglify-js"),
                    ast;
                
                
                ast = uglify.parse(content);
                //ast = pro.ast_mangle(ast);
                
                ast.figure_out_scope();
                ast.compute_char_frequency();
                ast.mangle_names();
                
                //ast = pro.ast_squeeze(ast);
                    
                content = ast.print_to_string();
            }
            
            io.File.prototype.write.call(this, content);            
        }
    }));
})();