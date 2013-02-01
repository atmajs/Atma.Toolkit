(function() {

	/**

	 ToComment Block ->
	 condition derective is commented in line and needs endif comment:
	 example: /* if (DEBUG) */
	/* endif */

	/**

	 ToUncomment Block ->
	 commented condition derective
	 */




	include.exports = function(file) {
        var code = file.content,
            defines;

        if (defines == null){
            return;
        }


        if (typeof code !== 'string'){
            code = code.toString();
        }

		file.content = process(code, 0, defines);

	};




	var condition = /\/\*[\s]*if/g,
		commentEnd = /\*\//g,
		inlineEnd = /\/\*[\s]*if[^\n\r]+\*\//g,
		endIf = /\/\*[\t ]*endif[\t ]*\*\//g;

	function process(code, index, defines) {

		condition.lastIndex = index || 0;
		var match = condition.exec(code);

		if (match == null) {
			return code;
		}

		inlineEnd.lastIndex = match.index;

		var derectiveEnd = code.indexOf(')', match.index) + 1,
			derective = code.substring(code.indexOf('(', match.index), derectiveEnd),
			doAction = null;



		try {
			doAction = !! (eval(stringifyDefines(defines) + ';' + derective));
		} catch (error) {
			console.warn('Conditional derective: ', error.toString());
		}

		var inlineEndMatch = inlineEnd.exec(code),
			area = inlineEndMatch && inlineEndMatch.index == match.index ? 'uncommented' : 'commented',
			out = {
				index: derectiveEnd,
				derectiveStart: match.index
			};

		if (area === 'commented' && doAction === true) {
			code = uncomment(code, out);
		} else if (area === 'uncommented' && doAction === false) {
			code = comment(code, out);
		} else {
			out.index = match.index + 1;
		}

		return process(code, out.index, defines);
	}

	function uncomment(code, from) {
		commentEnd.lastIndex = from.index;

		var match = commentEnd.exec(code),
			end = match.index + match[0].length,
			value = code.substring(0, from.derectiveStart) + code.substring(from.index, match.index) + code.substring(end);


		from.index = from.derectiveStart + (match.index - from.index);
		return value;

	}

	function comment(code, from) {
		endIf.lastIndex = from.index;
		var match = endIf.exec(code);

		var value = code.substring(0, from.derectiveStart) + code.substring(match.index + match[0].length);

		from.index = from.derectiveStart;
		return value;
	}


	function stringifyDefines(defines) {
		if (!defines) {
			return '';
		}

		var arr = [];
		for (var key in defines) {
			switch (typeof defines[key]) {
			case 'string':
				arr.push(String.format('var %1="%2"', key, defines[key]));
				continue;
			case 'number':
			case 'boolean':
                arr.push(String.format("var %1=%2", key, defines[key]));
				continue;
			case 'object':
				arr.push(String.format("var %1=%2", key, JSON.stringify(defines[key])));
				continue;
			}
		}

		return arr.join(';');

	}


}());
