window.DEBUG = true;

include.routes({
     "lib": "/.reference/libjs/{0}/lib/{1}.js",
     "ruqq": "/.reference/libjs/ruqq/lib/{0}.js",
     "compo": "/.reference/libjs/compos/{0}/lib/{1}.js"
});

if (DEBUG){
	include.plugin({
		lib: 'include/include.autoreload'
	});
}

if (window.location.href.indexOf('file:') === 0){
    // use custom loader only in file protocol, assume server to handle coffeescript and less
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
