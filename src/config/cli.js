

include.exports = function(app, done){
	done({
		cli: parse()
	});
};



function parse() {
	var array = process.argv.slice(2),
		i = 0,
		imax = array.length,
		key,
        value,
        x;

    var params = {},
        args = [];

	for (; i < imax; i++) {
		x = array[i];

		if (x[0] === '-') {
			key = x.replace(/^\-+/, '');

            
            value = i < imax - 1
                ? array[i + 1]
                : null;
                
            if (value && value[0] !== '-') {
                var c = value[0];

                if (c === '"' || c === "'") 
                    value = value.substring(1, value.length - 1);
                

                params[key] = value;
                i++
                continue;
            }
        

			params[key] = true;
			continue;
		}
        
        args.push(x);
	}

    
    return {
        args: args,
        params: params
    };
}
