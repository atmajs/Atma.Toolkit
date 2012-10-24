include.js({
    formatter: ['cssmin']
}).done(function() {

    var fs = require('fs'),
        w = global,
        settings = {
            outputDirectoryUri: ''
        };

    w.io.settingsStyle = settings;


    window.io.fileFactory.registerHandler([/\.css$/], Class({
        Base: io.File,
        read: function() {
            this.source = io.File.prototype.read.call(this);
            this.images = w.parser.css.extractImages(w.solution.uri, this.uri, this.source);
            return this.source;
        },
        copyTo: function(uri) {
            if (this.source == null) this.read();

            copyImages(this, uri);

            new io.File(uri).write(this.source);
        },
        write: function(content) {

            if (w.solution.config.minify) {
                contet = cssmin(content);
            }

            io.File.prototype.write.call(this, content);
        }
    }));




    function copyImages(cssFile, targetUri) {

        var solutionUri = w.solution.uri,
            copyImages = !w.urlhelper.isSubDir(solutionUri.toString(), cssFile.uri.toString()),
            images = cssFile.images,
            dir = net.URI.combine(targetUri.toDir(), 'images/');


        for (var i = 0, x, length = images.length; x = images[i], i < length; i++) {

            if (copyImages) {
                var uri = net.URI.combine(dir, x.uri.file);


                new io.File(x.uri).copyTo(uri);
                x.replaceWith = getRewritenPath(uri, x.href, dir);

            } else {
                x.replaceWith = getRewritenPath(x.uri, x.href, dir);
            }

            if (x.replaceWith) cssFile.source = w.parser.css.replace(cssFile.source, x.href, x.replaceWith);
        }
    }

    function getRewritenPath(uri, original, cssDirectory) {
        var path = uri.toRelativeString(cssDirectory);
        return path;
    }
});