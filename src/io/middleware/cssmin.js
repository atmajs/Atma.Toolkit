!function() {

        
    include.exports = function(file){
        
        if (!global.config.minify) {
            return;
        }
        
        
        file.content = require('clean-css').process(file.content);        
    }

}();