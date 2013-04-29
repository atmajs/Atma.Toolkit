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




	include.exports = function(file, defines) {
        var code = file.content;

        if (defines == null){
            return;
        }


        if (typeof code !== 'string'){
            code = code.toString();
        }

		file.content = process(code, 0, defines);

	};




	var reg_commentEnd = /\*\//g,
		reg_inlineEnd = /\/\*[ \t]*if[^\n\r]+\*\//g,
		reg_endIf = /(\/\*[\t ]*endif[\t ]*\*\/)|([ \t]*\/\/[ \t]*endif[ \t]*$)/gm,
		reg_expression = /^[ \t]*((\/\/)|(\/\*))[ \t]*if[ \t]*(([^\s]+$)|(\([^)\n\r]+\)))/gm;

	function process(code, index, defines) {

		reg_expression.lastIndex = index || 0;


		var match = reg_expression.exec(code);

		if (match == null) {
			return code;
		}


		var expression = match[4],
			expressionEnd = match.index + match[0].length,
			doAction = null;

		try {
			doAction = !! (eval(stringifyDefines(defines) + ';' + expression));
		} catch (error) {
			console.warn('Conditional derective: ', error.toString());
		}

		console.warn('>', expression, doAction);

		reg_inlineEnd.lastIndex = match.index;

		var reg_inlineEndMatch = reg_inlineEnd.exec(code),
			area = match[1] === '//' || (reg_inlineEndMatch && reg_inlineEndMatch.index == match.index) ? 'uncommented' : 'commented',
			out = {
				index: expressionEnd,
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
		reg_commentEnd.lastIndex = from.index;

		var match = reg_commentEnd.exec(code),
			end = match.index + match[0].length,
			value = code.substring(0, from.derectiveStart) + code.substring(from.index, match.index) + code.substring(end);


		from.index = from.derectiveStart + (match.index - from.index);
		return value;

	}

	function comment(code, from) {
		reg_endIf.lastIndex = from.index;
		var match = reg_endIf.exec(code);

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
