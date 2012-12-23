!function() {

    if (!global.config.minify) {
        return;
    }
        
    include.exports = function(file){
        file.content = require('clean-css').process(file.content);        
    }

}();