;(function() {

    var fs = require('fs'),
        w = global;


    window.io.fileFactory.registerHandler([/\.js$/], Class({
        Base: io.File,        
        write: function(content){
            
            if (w.solution.config.minify){
				console.log('Uglify... [start]');
                var uglify = require("uglify-js"),
                    ast,
					start = Date.now();
                
                
                ast = uglify.parse(content);
				ast.figure_out_scope();
				
                //ast = pro.ast_mangle(ast);
				
				var compressor = uglify.Compressor(global.solution.config.uglify);
				ast = ast.transform(compressor);
                
                ast.figure_out_scope();
                ast.compute_char_frequency();
                ast.mangle_names();
                
                //ast = pro.ast_squeeze(ast);
                    
                content = ast.print_to_string();
				console.log('Uglify... [end %sms]', Date.now() - start);
            }
            
            io.File.prototype.write.call(this, content);            
        }
    }));
})();