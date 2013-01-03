window.DEBUG = true;

include.routes(%ROUTES%);

if (window.DEBUG && window.location.hash.indexOf('!watch') > -1){
	include.embed({
		lib: 'include/include.autoreload'
	});
}