window.DEBUG = true;

include.routes(%ROUTES%);

if (DEBUG){
	include.plugin({
		atma: 'include/include.autoreload'
	});
}

if (window.location.href.indexOf('file:') === 0){
    // use custom loader only in file protocol, assume server to handle coffeescript and less
	include.cfg({
		loader: {
			'coffee': {
				atma: 'include/loader/coffee/loader'
			},
			'less': {
				atma: 'include/loader/less/loader'
			}
		}
	});

}
