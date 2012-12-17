var traverse = {
	isInComment: function(textParser) {
		var islinecomment, isblockcomment;
		for (var i = textParser.index - 1; i > 1; i--) {
			var c = textParser.text[i];
			if (islinecomment == null) {
				if (c == '/' && textParser.text[i - 1] == '/') return true;
				if (c == '\r' || c == '\n') islinecomment = false;
			}

			if (isblockcomment == null) {
				if (c == '/' && textParser.text[i - 1] == '*') isblockcomment = false;
				if (c == '*' && textParser.text[i - 1] == '/') return true;
			}

			if (islinecomment == false && isblockcomment == false) return false;
		}
		return false;
	},
	nameEnd: function(textParser) {
		textParser.skipTo(/[^\w]/g);
		return textParser.index;
	},
	commentEnd: function(textParser) {
		switch (textParser.next().Char()) {
		case '*':
			textParser.skipTo(/(\*\/)/g);
			textParser.index += 1;
			break;
		case '/':
			textParser.skipToAny('\n\r');
			break;
		default:
			return;
		}
	},
	blockEnd: function(textParser) {
		var start = textParser.Char(),
			counter = 1;

		var end = {
			'(': ')',
			'{': '}'
		}[start];

		if (end == null) {
            throw new Error('Unknown Block Char %s at %d', start, textParser.index);
        }

		textParser.next();
		for (; textParser.index < textParser.length; textParser.index++) {
			var c = textParser.Char();
			switch (c) {
			case '/':
				traverse.commentEnd(textParser);
				continue;
			case "'":
			case '"':
				textParser.next().skipToChar(c);
				continue;
			case end:
				if (--counter == 0) return;
				continue;
			case start:
				++counter;
				continue;
			}
		}
	}
};

include.exports  = traverse;