!
function() {

	var uglify = require("uglify-js");

	/**
	 *  Handler can accept as file content - JavaScript String or UglifJS AST Tree
	 */

	include.exports = function(file) {
        var minify = global.config.minify;

		if (!minify && typeof file.content === 'string') {
			return;
		}


		console.log('Uglify... [start]');
		var config = minify ? (global.config.uglify || {
			global_defs: {
				DEBUG: false
			}
		}) : {
			sequences: false,
			properties: false,
			dead_code: false,
			drop_debugger: false,
			unsafe: false,
			conditionals: false,
			comparisons: false,
			evaluate: false,
			booleans: false,
			loops: false,
			unused: false,
			hoist_funs: false,
			hoist_vars: false,
			if_return: false,
			join_vars: false,
			cascade: false,
			side_effects: false,
			global_defs: {
				DEBUG: false
			}

		},
			start = Date.now(),
			compressor, ast;

		ast = typeof file.content === 'string' ? uglify.parse(file.content) : file.content;
		ast.figure_out_scope();


		compressor = uglify.Compressor(config);

		ast = ast.transform(compressor);

        if (minify){
            ast.figure_out_scope();
            ast.compute_char_frequency();
            ast.mangle_names();

            //ast = pro.ast_squeeze(ast);
        }

		file.content = ast.print_to_string({
			beautify: !minify
		});

		console.log('Uglify... [end %sms]', Date.now() - start);
	};
}();
