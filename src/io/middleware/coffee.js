(function() {


    include.exports = function(file){
        var coffee = require('coffee-script');

        if (typeof file.content !== 'string'){
            file.content = file.content.toString();
        }

        file.content = coffee.compile(file.content);
    }

}());
