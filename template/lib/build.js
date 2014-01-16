/**
 *	Build: Run Atma.js Toolkit
 *  ``` > npm install atma ```
 *	``` > atma```
 **/

module.exports = {
	'settings': {
		io: {
			extensions: {
				js: ['condcomments:read', 'importer:read']
			}
		}
	},
	'add-handlers': {
		action: 'custom',
		script: 'tools/license-handler.js'
	},
	'import': {
		files: 'builds/**',
		output: 'lib/',
		defines: {
			DEBUG: true
		}
	},
	'jshint': {
		files: ['lib/#{name}.js'],
		jshint: JSHint()
	},
	'uglify': {
		files: 'lib/#{name}.js',
		defines: {
			DEBUG: false
		}
	},

	'watch': {
		files: 'src/**',
		config: '#[import]'
	},
	
	// `> atma bump`
	'bump': {
		action: 'custom',
		script: 'tools/bump.js'
	},

	'defaults': ['add-handlers', 'import', 'jshint', 'uglify']
};




function JSHint() {

	return {
		options: {
			curly: true,
			eqeqeq: true,
			forin: false,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			noempty: true,
			nonew: true,
			expr: true,
			regexp: true,
			undef: true,
			unused: true,
			strict: true,
			trailing: true,

			boss: true,
			eqnull: true,
			es5: true,
			lastsemic: true,
			browser: true,
			node: true,
			onevar: false,
			evil: true,
			sub: true,
		},
		globals: {
			define: true,
			require: true,
		}
	};
}
