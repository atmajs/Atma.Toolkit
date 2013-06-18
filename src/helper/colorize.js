(function() {
	
	/**
	 *	String.prototype
	 *			.red
	 *			.green
	 *			.yellow
	 *			.blue
	 *			.magento
	 *			.cyan
	 *			.bold
	 *			.italic
	 *			.underline
	 *			.inverse
	 *
	 *			.colorize()
	 */

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
            magenta: '35m',
            cyan: '36m',
            
    
            bold: '1m',
            italic: '3m',
            underline: '4m',
            inverse: '7m'
        };
    
	function color(str) {

		for (var key in colors) {
			str = str.replace(new RegExp(key + '\\{([^\\}]+)\\}', 'g'), replacement(colors[key]));
		}

		return str;
    }

	
	Object.keys(colors).forEach(function(key){
		
		Object.defineProperty(String.prototype, key, {
			get: function(){
				return START + colors[key] + this + END
			},
			enumerable: false
		});
		
	});
	
	String.prototype.colorize = function(){
		return color(this);
	};

    
}());    