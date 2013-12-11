
var MimeTypes = include.exports = {};

set('text/html', 'html', 'htm');
set('text/css', 'css', 'less');
set('text/plain', 'txt', 'mask');

set('application/x-javascript', 'js', 'coffee', 'jsnext');
set('application/json', 'json', 'yml');

set('image/jpeg', 'jpeg', 'jpg');
set('image/gif', 'gif');
set('image/png', 'png');
set('image/svg+xml', 'svg');

set('video/mp4', 'mp4', 'f4v', 'f4p');
set('video/ogg', 'ogv');
set('video/webm', 'webm');
set('video/x-flv', 'flv');
set('video/mov', 'quicktime')
set('video/x-flv', 'flv')

set('audio/mpeg', 'mp3');
set('audio/ogg', 'ogg');

set('application/x-shockwave-flash', 'swf');



function set() {
	var mimeType = arguments[0];
	for (var i = 1, x, length = arguments.length; i < length; i++) {
		MimeTypes[arguments[i]] = mimeType;
	}
}
