var r = global.ruqq,
	jsdom = require('jsdom').jsdom;

var Document = Class({
	Construct: function(html) {
		var dom = jsdom('<!DOCTYPE html><html>' + html + '</html>');
        
        Object.extend(dom.__proto__, this.__proto__);
        
        return dom;
	},	
    removeAll: function(tagName, ifattr, value) {
		var elements = this.getElementsByTagName(tagName);
		for (var i = 0; i < elements.length; i++) {

			if (ifattr && !elements[i].getAttribute(ifattr)) {
                continue;
            }
			if (value && elements[i].getAttribute(ifattr) != value) {
                continue;
            }
            
			elements[i].parentNode.removeChild(elements[i]);
		}
		return this;
	},
	createTag: function(tagName, attr) {
		var tag = this.createElement(tagName);
		for (var key in attr) {
			switch (key) {
			case 'innerHTML':
				tag[key] = attr[key];
				continue;
			}

			tag.setAttribute(key, attr[key]);
		}
		return tag;
	},
	appendResource: function(tagName, attr) {
		var tag = this.createTag(tagName, attr);
		this.first('head').appendChild(tag)
		return tag;
	},

	getAllAttributes: function(tagName, attr) {
		return r.arr(this.getElementsByTagName(tagName)).where(function(x) {
			return !!x.getAttribute(attr) && /:\/\/|^\/\//.test(x.getAttribute(attr)) == false;
		}).map(function(x) {
			return x.getAttribute(attr);
		});
	},
	first: function(tagName, arg) {
		var elements = this.getElementsByTagName(tagName);

		if (typeof arg == 'function') {
			for (var i = 0, x, length = elements.length; x = elements[i], i < length; i++) {
				if (arg(x)) return x;
			}
		}

		return elements[0];
	}
});


include.exports = Document;