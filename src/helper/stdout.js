
(function(){

    include.exports = {
        color: (function(){

            return function(str){

                function format(value){
                    return '\u001b['+value+'m$1\u001b[0m'
                }

                var colors = {
                    red: format(31),
                    green: format(32),
                    yellow: format(33),
                    blue: format(34),

                    bold: format(1),
                    italic: format(3),
                    underline: format(4),
                    inverse: format(7)
                }

                for(var key in colors){
                    str = str.replace(new RegExp(key + '\\{([^\\}]+)\\}','g'), colors[key]);
                }

                return str;
            }
        })()
    };

    global.color = include.exports.color;

}());
