!function() {

        
    include.exports = function(file){
        
        if (!solution.config.minify) {
            return;
        }
        
        
        file.content = require('clean-css').process(file.content);        
    }

}();