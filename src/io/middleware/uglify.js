!function() {
    
    if (!global.config.minify) {
        return;
    }

    var uglify = require("uglify-js"),
        config = global.config.uglify;

	include.exports = function(file) {
			
            console.log('Uglify... [start]');
			
            var start = Date.now(),
                compressor, ast;


			ast = uglify.parse(file.content);
			ast.figure_out_scope();

			
			compressor = uglify.Compressor(config);
            
			ast = ast.transform(compressor);

			ast.figure_out_scope();
			ast.compute_char_frequency();			
            ast.mangle_names();

			//ast = pro.ast_squeeze(ast);

			file.content = ast.print_to_string();
			
            console.log('Uglify... [end %sms]', Date.now() - start);
	};
}();