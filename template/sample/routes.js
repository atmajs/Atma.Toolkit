window.DEBUG = true;

include.routes({
     "lib": "/.import/libjs/{0}/lib/{1}.js",
     "ruqq": "/.import/libjs/ruqq/lib/{0}.js",
     "compo": "/.import/libjs/compos/{0}/lib/{1}.js"
});

if (window.DEBUG ){ //&& window.location.hash.indexOf('!watch') > -1
	include.plugin({
		lib: 'include/include.autoreload'
	});
}

/** IncludeJS server compiles resources, so compiling on the fly is not needed. Using file protocol for tests do not forget allow browsers local file access */

if (window.location.href.indexOf('file') != -1){
	include.cfg({
		loader: {
			'coffee': {
				lib: 'include/loader/coffee/loader'
			},
			'less': {
				lib: 'include/loader/less/loader'	
			}
		}
	});
}
