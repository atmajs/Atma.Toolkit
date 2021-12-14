import { staticRef } from './utils/staticRef'
import { VideoStreamer } from './utils/Videostreamer'
import { MimeTypes } from './utils/MimeTypes'
import { class_Uri } from 'atma-utils';



var _base = process.cwd(),

    File = File;

export const StaticMiddleware = function () {

    return function (req, res, next, config) {
        var url = req.url,
            base = (config && (config.static || config.base)) || _base
            ;

        if (url === '/')
            url = 'index.html';

        var query = url.indexOf('?');
        if (query !== -1)
            url = url.substring(0, query);

        var uri = new class_Uri(class_Uri.combine(base, url)),
            file = new File(uri);

        if (file.exists()) {
            file_send(file, req, res);
            return;
        }

        file = staticRef(file);

        if (file && file.exists()) {
            file_send(file, req, res);
            return;
        }

        req.filePath = uri.toLocalFile();
        next();
    };
};


function file_send(file, req, res) {
    var mimeType = file.mimeType
        || MimeTypes[file.uri && file.uri.extension]
        || 'text/plain'
        ;


    if (mimeType.indexOf('video/') === 0) {
        VideoStreamer(file.uri.toLocalFile(), req, res);
        return;
    }

    var content = file.read('buffer');

    if (content == null)
        content = '<undefined>';



    if (typeof content === 'object' && content instanceof Buffer === false) {
        try {
            content = JSON.stringify(content);
        } catch (error) {
            content = '<json:stringify>' + error.toString();
        }
    }

    res.writeHeader(200, {
        'Content-Type': mimeType
    });


    res.end(content);
}
