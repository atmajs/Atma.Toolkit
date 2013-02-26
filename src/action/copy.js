include.exports = {
    process: function(config, done){
        var files = config.files;

        if (files == null || typeof files !== 'object'){
            done('Copy Action: Define files in "files" property as object {source: target}');
            return;
        }

        for(var source in files){
            var file = new io.File(source),
                target = files[source];

            if (file.exists() === false){
                console.warn('File not exists: ', file.uri.toLocalFile());
                continue;
            }


            file.copyTo(target);
        }

        done();
    }
}
