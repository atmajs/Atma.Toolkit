
include.js({
	lib: 'mask'
}).done(function(global, document) {

	"use strict";

	
var domLib = typeof $ == 'undefined' ? null : $;
var extend = function(target, source) {
	for (var key in source) {
		target[key] = source[key];
	}
	return target;
},
	containerArray = function() {
		var arr = [];
		arr.appendChild = function(child) {
			this.push(child);
		};
		return arr;
	};
var Children_ = {
	
	/**
	 *	Component children. Example:
	 *
	 *	Class({
	 *		Base: Compo,
	 *		Construct: function(){
	 *			this.compos = {
	 *				panel: '$: .container',  // querying with DOMLib
	 *				timePicker: 'compo: timePicker', // querying with Compo selector
	 *				button: '#button' // querying with querySelector***
	 *			}
	 *		}
	 *	});
	 *
	 */
	select: function(component, compos) {
		for (var name in compos) {
			var data = compos[name],
				events = null,
				selector = null;

			if (data instanceof Array) {
				selector = data[0];
				events = data.splice(1);
			}
			if (typeof data == 'string') {
				selector = data;
			}
			if (data == null) {
				console.error('Unknown component child', name, compos[name]);
				return;
			}

			var index = selector.indexOf(':'),
				engine = selector.substring(0, index);

			engine = Compo.config.selectors[engine];

			if (engine == null) {
				component.compos[name] = component.$[0].querySelector(selector);
			} else {
				selector = selector.substring(++index).trim();
				component.compos[name] = engine(component, selector);
			}

			var element = component.compos[name];

			if (events != null) {
				if (element instanceof Compo) {
					element = element.$;
				}
				Events_.on(component, events, element);
			}
		}
	}
};
var Shots = {
	// from parent to childs 
	emit: function(component, event, args) {
		if (component.listeners != null && event in component.listeners) {
			component.listeners[event].apply(component, args);
			delete component.listeners[event];
		}
		if (component.components instanceof Array) {
			for (var i = 0; i < component.components.length; i++) {
				Shots.emit(component.components[i], event, args);
			}
		}
	},
	on: function(component, event, fn) {
		if (component.listeners == null) {
			component.listeners = {};
		}
		component.listeners[event] = fn;
	}
},
	Events_ = {
		on: function(component, events, $element) {
			if ($element == null) {
				$element = component.$;
			}

			var isarray = events instanceof Array,
				length = isarray ? events.length : 1;

			for (var i = 0, x; isarray ? i < length : i < 1; i++) {
				x = isarray ? events[i] : events;

				if (x instanceof Array) {
					$element.on.apply($element, x);
					continue;
				}


				for (var key in x) {
					var fn = typeof x[key] === 'string' ? component[x[key]] : x[key],
						parts = key.split(':');

					$element.on(parts[0] || 'click', parts.splice(1).join(':').trim() || null, fn.bind(component));
				}
			}
		}
	};
var Compo = (function() {

	return function(arg) {
		if (typeof arg === 'string') {
			this.nodes = mask.compile(arg);
		}
	};

}());
(function() {

	var parseSelector = function(selector, type, direction) {
		var key, prop, nextKey;

		if (key == null) {
			switch (selector[0]) {
			case '#':
				key = 'id';
				selector = selector.substring(1);
				prop = 'attr';
				break;
			case '.':
				key = 'class';
				selector = new RegExp('\\b' + selector.substring(1) + '\\b');
				prop = 'attr';
				break;
			default:
				key = type == 'node' ? 'tagName' : 'compoName';
				break;
			}
		}

		if (direction == 'up') {
			nextKey = 'parent';
		} else {
			nextKey = type == 'node' ? 'nodes' : 'components';
		}

		return {
			key: key,
			prop: prop,
			selector: selector,
			nextKey: nextKey
		};
	},
		match = function(compo, selector, type) {
			if (typeof selector === 'string') {
				if (type == null) {
					type = compo.compoName ? 'compo' : 'node';
				}
				selector = parseSelector(selector, type);
			}

			var obj = selector.prop ? compo[selector.prop] : compo;
			if (obj == null) {
				return false;
			}

			if (selector.selector.test != null) {
				if (selector.selector.test(obj[selector.key])) {
					return true;
				}
			} else {
				if (obj[selector.key] == selector.selector) {
					return true;
				}
			}

			return false;
		},
		find = function(compo, selector, direction, type) {
			if (typeof compo !== 'object') {
				console.warn('Invalid Compo', arguments);
				return null;
			}

			if (typeof selector === 'string') {
				if (type == null) {
					type = compo.compoName ? 'compo' : 'node';
				}
				selector = parseSelector(selector, type, direction);
			}

			if (compo instanceof Array) {
				for (var i = 0, x, length = compo.length; i < length; i++) {
					x = compo[i];
					var r = find(x, selector);
					if (r != null) {
						return r;
					}
				}
				return null;
			}

			if (match(compo, selector) === true) {
				return compo;
			}
			return (compo = compo[selector.nextKey]) && find(compo, selector);
		},
		findAll = function(compo, selector, type, out) {
			if (out == null){
				out = [];
			}

			if (typeof selector === 'string') {
				selector = parseSelector(selector, type);
			}


			if (match(compo, selector)) {
				out.push(compo);
			}

			var childs = compo[selector.nextKey];

			if (childs != null) {
				for (var i = 0; i < childs.length; i++) {
					findAll(childs[i], selector, null, out);
				}
			}

			return out;
		};


	extend(Compo, {
		find: find,
		findAll: findAll,
		findCompo: function(compo, selector, direction) {
			return find(compo, selector, direction, 'compo');
		},
		findNode: function(compo, selector, direction) {
			return find(compo, selector, direction, 'node');
		},
		closest: function(compo, selector, type){
			return find(compo, selector, 'up', type);
		}
	});

}());
(function(){
	
	function addClass(compo, _class){
		compo.attr['class'] = (compo.attr['class'] ? compo.attr['class'] + ' ' : '') + _class;
	}
	
	extend(Compo, {
		addClass: addClass
	});
	
}());
(function() {
	
	var ensureTemplate = function(compo) {
		if (compo.nodes != null) {
			return;
		}

		var template;
		if (compo.attr.template != null) {
			if (compo.attr.template[0] === '#') {
				var node = document.getElementById(compo.attr.template.substring(1));

				template = node.innerHTML;
			} else {
				template = compo.attr.template;
			}

			delete compo.attr.template;
		}
		if (typeof template == 'string') {
			template = mask.compile(template);
		}

		if (template != null) {
			compo.nodes = template;
			return;
		}

		return;
	};
	
	extend(Compo, {
		render: function(compo, model, container, cntx) {
			if (cntx == null) {
				cntx = compo;
			}


			ensureTemplate(compo);

			var elements = mask.render(compo.tagName == null ? compo.nodes : compo, model, containerArray(), cntx);

			compo.$ = domLib(elements);

			if (compo.events != null) {
				Events_.on(compo, compo.events);
			}
			if (compo.compos != null) {
				Children_.select(compo, compo.compos);
			}

			if (container != null) {
				for (var i = 0; i < elements.length; i++) {
					container.appendChild(elements[i]);
				}
			}
			return this;
		},

		dispose: function(compo) {
			compo.dispose && compo.dispose();

			var i = 0,
				compos = compo.components,
				length = compos && compos.length;

			if (length) {
				for (; i < length; i++) {
					Compo.dispose(compos[i]);
				}
			}
		},

		config: {
			selectors: {
				'$': function(compo, selector) {
					var r = compo.$.find(selector);
					return r.length > 0 ? r : compo.$.filter(selector);
				},
				'compo': function(compo, selector) {
					var r = Compo.findCompo(compo, selector);
					return r;
				}
			},
			/**
			 @default, global $ is used
			 IDOMLibrary = {
			 {fn}(elements) - create dom-elements wrapper,
			 on(event, selector, fn) - @see jQuery 'on'
			 }
			 */
			setDOMLibrary: function(lib) {
				domLib = lib;
			}
		},
		shots: Shots
	});

}());


Compo.prototype = {
	render: function(model, container, cntx) {
		Compo.render(this, model, container, cntx);
		return this;
	},
	insert: function(parent) {
		for (var i = 0; i < this.$.length; i++) {
			parent.appendChild(this.$[i]);
		}

		Shots.emit(this, 'DOMInsert');
		return this;
	},
	append: function(template, values, selector) {
		var parent;

		if (this.$ == null) {
			var dom = typeof template == 'string' ? mask.compile(template) : template;

			parent = selector ? Compo.findNode(this, selector) : this;
			if (parent.nodes == null) {
				this.nodes = dom;
			} else if (parent.nodes instanceof Array) {
				parent.nodes.push(dom);
			} else {
				parent.nodes = [this.nodes, dom];
			}

			return this;
		}
		var array = mask.render(template, values, containerArray(), this);

		parent = selector ? this.$.find(selector) : this.$;
		for (var i = 0; i < array.length; i++) {
			parent.append(array[i]);
		}

		Shots.emit(this, 'DOMInsert');
		return this;
	},
	on: function() {
		var x = Array.prototype.slice.call(arguments);
		if (arguments.length < 3) {
			console.error('Invalid Arguments Exception @use .on(type,selector,fn)');
			return this;
		}

		if (this.$ != null) {
			Events_.on(this, [x]);
		}


		if (this.events == null) {
			this.events = [x];
		} else if (this.events instanceof Array) {
			this.events.push(x);
		} else {
			this.events = [x, this.events];
		}
		return this;
	},
	remove: function() {
		this.$ && this.$.remove();
		Compo.dispose(this);

		if (this.parent != null) {
			var i = this.parent.components.indexOf(this);
			this.parent.components.splice(i, 1);
		}

		return this;
	}
};

var CompoUtils = function(){};

(function(){
	
	function extendClass(method){
		CompoUtils.prototype[method] = function(){
			 var l = arguments.length;
			 
             return Compo[method](this, //
                l > 0 ? arguments[0] : null, //
                l > 1 ? arguments[1] : null, //
                l > 2 ? arguments[2] : null, //
                l > 3 ? arguments[3] : null);
		};
	}
	
	
	for(var key in Compo){
		if (Compo.hasOwnProperty(key) === false){
			continue;
		}
		if (typeof Compo[key] === 'function'){
			extendClass(key);
		}
	}
	
}());


global.Compo = Compo;
global.CompoUtils = CompoUtils;

}.bind(this, this, typeof document === 'undefined' ? null : document));