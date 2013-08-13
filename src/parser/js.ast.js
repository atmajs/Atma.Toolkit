include.js([ //
'ast/util.js::AstUtil', //
'ast/parse/includes.js::parseIncludes', //
'ast/reduce/includes.js::reduceIncludes' //
]).done(function(resp) {

	var util = resp.AstUtil,
		global = this,
		UglifyJS = global.UglifyJS || require('uglify-js');


	include.exports = {
		extractIncludes: function(resource, directory, variables) {

            var ast = (resource.ast = util.parse(resource.content, {filename: resource.uri.toLocalFile() })),
                info = resp.parseIncludes(ast, resource);

			/**
			 * is used in future include reducing */
			resource.info = {
				responseAccessors: info.responseAccessors,
				hasResponseObject: info.hasResponseObject,
				hasExports: info.hasExports
			};

            //console.log('<!>', resource.url, info.responseAccessors);

			////console.log('----');
			////console.log('\t', resource.url);
			////console.log('\t',
			////			info.hasExports,
			////			info.hasResponseObject,
			////			ruqq.arr.map(info.responseAccessors, function(x){ return x.join('.'); }));

			return info.includes;
		},

		reduceIncludes: function(resource, ast) {

            resp.reduceIncludes(resource, ast);

		}
	};


}.bind(typeof window === 'undefined' ? global : window));
