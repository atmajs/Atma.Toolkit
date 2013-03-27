global.config = {
	build: {
		file: "index.dev.html",
		outputMain: "index.html",
		outputSources: "index.build",
		minify: true,
		/** UglifyJS compressor settings */
		uglify: {},
		/** is used in UglifJS:def_globals and in conditional comment derectives */
		defines: {
			DEBUG: false
		},
		jshint: JSHint()
	}
};


function JSHint() {

	return {
		options: {
			curly: true,
			eqeqeq: true,
			forin: true,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			noempty: true,
			nonew: true,
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
			define: false,
			require: false,
			window: false,
			document: false,
			XMLHttpRequest: false,
			$: false,

			include: false,
			mask: false,
			ruqq: false,
			Compo: false,
			Class: false
		},
		/** files to ingore */
		ignore: {
			"iscroll-full.js": 1,
			"mobiscroll.js": 1,
			"prism.lib.js": 1,
			"jquery.js": 1
		}
	};
}
