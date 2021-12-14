
export const MimeTypes = {} as any;

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



function set(mimeType, ...extensions) {

    extensions.forEach(ext => {
        MimeTypes[ext] = mimeType;
    });
}
