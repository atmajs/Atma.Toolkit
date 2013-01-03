(function() {

        
    include.exports = function(file){
        var coffee = require('coffee-script');
        
        file.content = coffee.compile(file.content);        
    }

}());