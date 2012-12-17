var regexp = {
    '\n\r': /[\n\r]/g
}

include.exports = Class({
	Construct: function(text) {
		this.text = text;
		this.index = 0;
		this.length = text.length;
		return this;
	},
	next: function() {
		this.index++;
		return this;
	},
	skipWhitespace: function() {
		for (; this.index < this.length; this.index++) {
			var code = this.text.charCodeAt(this.index);
			if (code !== 32 /*' '*/ && code !== 10 && code !== 13 && code !== 9) {
				return this;
			}
		}

		return this;
	},
	skipToChar: function(c) {
		var index = this.text.indexOf(c, this.index);
		if (index > -1) {
			this.index = index;
			if (this.text.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
				return this;
			}
			this.next().skipToChar(c);
		}
		return this;

	},
	skipToAny: function(chars) {
		var r = regexp[chars];
		if (r == null) {
			console.error('Unknown regexp %s: Create', chars);
			r = (regexp[chars] = new RegExp('[' + chars + ']', 'g'));
		}

		r.lastIndex = this.index;
		var result = r.exec(this.text);
		if (result != null) {
			this.index = result.index;
		}
		return this;
	},
	skipTo: function(regexp) {
		regexp.lastIndex = this.index;
		var result = regexp.exec(this.text);
		if (result != null) {
			this.index = result.index;
		} else {
			this.index = this.length;
		}
		return this;
	},
	sliceToChar: function(c) {
		var start = this.index,
			isEscaped, index;

		while ((index = this.text.indexOf(c, this.index)) > -1) {
			this.index = index;
			if (this.text.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
				break;
			}
			isEscaped = true;
			this.index++;
		}

		var value = this.text.substring(start, this.index);
		return isEscaped ? value.replace(regexp.escapedChar[c], c) : value;

		//-return this.skipToChar(c).template.substring(start, this.index);
	},
	sliceToAny: function(chars) {
		var start = this.index;
		return this.skipToAny(chars).text.substring(start, this.index);
	},
	sliceTo: function(regexp) {
		var start = this.index;
		return this.skipTo(regexp).text.substring(start, this.index);
	},
	eof: function() {
		return this.index > this.length - 1;
	},
	Char: function() {
		return this.text[this.index];
	}
});