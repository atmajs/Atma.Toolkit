window.DEBUG = true;

include.routes(%ROUTES%);

if (window.DEBUG ){ //&& window.location.hash.indexOf('!watch') > -1
	include.plugin({
		lib: 'include/include.autoreload'
	});
}

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