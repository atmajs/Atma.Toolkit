include.exports = Class({
    process: function(config, done){

        config
            .sourceDir
            .readFiles()
            .copyTo(config.targetDir.uri);

        done && done();
    }
});
