(function() {

    function replacement(value) {
        return START + value + '$1' + END;
    }

    var START = '\u001b[',
        END = '\u001b[0m',
        
        colors = {
            red: '31m',
            green: '32m',
            yellow: '33m',
            blue: '34m',
    
            bold: '1m',
            italic: '3m',
            underline: '4m',
            inverse: '7m'
        };



    include.exports = {
        colors: colors,
        colorize: function(color, str){
            return START + colors[color] + str + END;
        },
        color: function(str) {

            for (var key in colors) {
                str = str.replace(new RegExp(key + '\\{([^\\}]+)\\}', 'g'), replacement(colors[key]));
            }

            return str;
        }

    };

    global.color = include.exports.color;


}());    