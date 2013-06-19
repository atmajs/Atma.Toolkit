include.js([ //
'util/textParser.js::TextParser', //
'util/includeMock.js::Include', //
'util/codeTraverser.js::traverse', //
]).done(function(resp) {


	var fns = {
		cfg: 1,
		js: 1,
		load: 1,
		css: 1,
		lazy: 1,
		routes: 1
	}


	var Parser = {
		include: function(textParser, stream) {
			if (stream == null) {
                stream = [];
            }


			var buffer = [];
			buffer.push('include');
			out: for (; textParser.index < textParser.length; textParser.index++) {
				textParser.skipWhitespace();


				switch (textParser.Char()) {
				case '/':
					resp.traverse.commentEnd(textParser);
					break;
				case '.':
					textParser.next().skipWhitespace();

					var fnName = textParser.sliceTo(/[^\w]/g);

					textParser.skipWhitespace();

					if (textParser.Char() != '(') {
						//throw new Error('ParseError at ' + textParser.index+  '. "(" expected, but ' + textParser.Char() + ' seen');
						break out;
					}

					var start = textParser.index,
						args;
					resp.traverse.blockEnd(textParser);

					if (start + 1 == textParser.index) {
                        args = '';
                    }
					else {
                        args = textParser.text.substring(start + 1, textParser.index);
                    }


					//-console.log('args',fnName, args, textParser.text[textParser.index + 1]);
					if (fns[fnName] != null) {

						buffer.push('.');
						buffer.push(fnName);
						buffer.push('(');
						buffer.push(args);
						buffer.push(')');

					}

					break;
				case ';':
					break out;
				default:
					if (/[\w]/.test(textParser.Char())) {
						--textParser.index;
						break out;
					}
					break;
				}
			}

			if (buffer.length > 1) {
				var args = [stream.length - 1, 0]
				Array.prototype.splice.apply(stream, args.concat(buffer));
			}

			return stream;
		}
	};



	global.include.promise('parser').js = {
		extractIncludes: function(code, directory, variables) {
			var regexp = new RegExp(/(^include)|(([\s;\}]{1})include)/g),
				textParser = new resp.TextParser(code),
				js = '';


			var includes = [];
			while (textParser.index < textParser.length) {
				if (textParser.skipTo(regexp).eof()) {
                    break;
                }

                if (resp.traverse.isInComment(textParser)) {
					textParser.next();
					continue;
				}

				textParser.next();
				resp.traverse.nameEnd(textParser);

				includes.push(';');
				Parser.include(textParser, includes);
			}

			var javascriptCode = includes.join('');
			if (!javascriptCode) {
                return [];
            }


			/**
			 *  In Some Cases variables can be used in arguments,
			 *  for now that variables must be before speciefied in build.config file.
			 *
			 *  But using http://esprima.org/ variables can be handled inline
			 */

			var include = new resp.Include();
			try {

				if (variables) {
					javascriptCode = variables + ';' + javascriptCode;
				}

				eval(javascriptCode);
			} catch (e) {
				console.log('Javascript Include Eval Error:'.red.bold, javascriptCode, e);
				return [];
			}

			return include.includes;
		}
	};

});
