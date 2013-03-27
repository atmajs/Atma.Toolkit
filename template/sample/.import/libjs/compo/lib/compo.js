
// source ../src/umd-head.js
(function (root, factory) {
    'use strict';

    if (root == null && typeof global !== 'undefined'){
        root = global;
    }

    var doc = typeof document === 'undefined' ? null : document,
        construct = function(){
            return factory(root, mask);
        };

    //if (typeof mask === 'undefined'){
    //    console.error('CompoJS - mask should be loaded/defined before');
    //    return;
    //}

    if (typeof exports === 'object') {
        module.exports = construct();
    } else if (typeof define === 'function' && define.amd) {
        define(construct);
    } else {
        var lib = construct();

        // define jmask, Compo

        for(var key in lib){
            root[key] = lib[key];
        }

    }
}(this, function (global, mask) {
    'use strict';


// source ../src/scope-vars.js
var domLib = global.jQuery || global.Zepto || global.$;

if (!domLib){
	console.warn('jQuery / Zepto etc. was not loaded before compo.js, please use Compo.config.setDOMLibrary to define dom engine');
}

/* Utils */
// source ../src/utils/util.js

if (typeof Array.prototype.indexOf === 'undefined'){
	Array.prototype.indexOf = function(value){
		var i = -1,
		    length = this.length;
		while(++i < length){
			if (this[i] === value){
				return i;
			}
		}
		return -1;
	}
}


function arr_each(array, fn){
	for(var i = 0, length = array.length; i < length; i++){
		fn(array[i], i);
	}
}

function arr_remove(array, child){
	if (array == null){
		console.error('Can not remove myself from parent', child);
		return;
	}

	var index = array.indexOf(child);

	if (index === -1){
		console.error('Can not remove myself from parent', child, index);
		return;
	}

	array.splice(index, 1);
}


function util_extend(target, source){
	if (target == null){
		target = {};
	}
	if (source == null){
		return target;
	}

	for(var key in source){
		target[key] = source[key];
	}

	return target;
}

// source ../src/utils/dom.js
var Dom = mask.Dom;


//////
///////** obsolete - use jmask to handle this */
//////function dom_find(nodes, matcher){
//////
//////	var r;
//////
//////	if (typeof matcher === 'string'){
//////
//////	}
//////
//////	if (mix instanceof Array){
//////		for(var i = 0, length = mix.length; i < length; i++){
//////			r = dom_find(mix[i], matcher, output);
//////			if (r){
//////				return ;
//////			}
//////		}
//////		return null;
//////	}
//////
//////	if (selector_match(mix, matcher)){
//////		output.push(mix);
//////	}
//////
//////	var next = mix[matcher.nextKey];
//////
//////	if (next != null){
//////		jmask_find(next, matcher, output);
//////	}
//////
//////	return output;
//////
//////}

// source ../src/utils/selector.js
function selector_parse(selector, type, direction) {
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
			key = type == Dom.SET ? 'tagName' : 'compoName';
			break;
		}
	}

	if (direction == 'up') {
		nextKey = 'parent';
	} else {
		nextKey = type == Dom.SET ? 'nodes' : 'components';
	}

	return {
		key: key,
		prop: prop,
		selector: selector,
		nextKey: nextKey
	};
}

function selector_match(node, selector, type) {
	if (typeof selector === 'string') {
		if (type == null) {
			type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
		}
		selector = parseSelector(selector, type);
	}

	var obj = selector.prop ? node[selector.prop] : node;
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
}

// source ../src/utils/traverse.js
function find_findSingle(node, matcher) {
	if (node instanceof Array) {
		for (var i = 0, x, length = node.length; i < length; i++) {
			x = node[i];
			var r = find_findSingle(x, matcher);
			if (r != null) {
				return r;
			}
		}
		return null;
	}

	if (selector_match(node, matcher) === true) {
		return node;
	}
	return (node = node[matcher.nextKey]) && find_findSingle(node, matcher);
}


/* jMask */
// source ../src/jmask/jmask.lib.js

var jMask = (function(){

	var _mask_parse = mask.parse,
		_mask_render = mask.render;


	// source jmask.js
function jMask(mix) {


	if (this instanceof jMask === false) {
		return new jMask(mix);
	}

	if (mix == null) {
		return this;
	}
	if (mix.type === Dom.SET) {
		return mix;
	}

	return this.add(mix);
}

jMask.prototype = {
	constructor: jMask,
	type: Dom.SET,
	length: 0,
	components: null,
	add: function(mix) {
		if (typeof mix === 'string') {
			mix = _mask_parse(mix);
		}

		if (mix instanceof Array) {
			for (var i = 0, length = mix.length; i < length; i++) {
				this.add(mix[i]);
			}
			return this;
		}

		if (typeof mix === 'function' && mix.prototype.type != null) {
			// assume this is a controller
			mix = {
				controller: mix,
				type: Dom.COMPONENT
			};
		}


		var type = mix.type;

		if (!type) {
			// @TODO extend to any type?
			console.error('Only Mask Node/Component/NodeText/Fragment can be added to jmask set', mix);
			return this;
		}

		if (type === Dom.FRAGMENT) {
			var nodes = mix.nodes,
				i = 0,
				length = nodes.length;
			while (i < length) {
				this[this.length++] = nodes[i++];
			}
			return this;
		}

		if (type === Dom.CONTROLLER && mix.nodes != null) {
			var i = mix.nodes.length;
			while (i !== 0, --i) {
				// set controller as parent, as parent is mask dom node
				mix.nodes[i].parent = mix;
			}
		}

		this[this.length++] = mix;
		return this;
	},
	toArray: function() {
		return Array.prototype.slice.call(this);
	},
	/**
	 *	render([model, cntx, container]) -> HTMLNode
	 * - model (Object)
	 * - cntx (Object)
	 * - container (Object)
	 * - returns (HTMLNode)
	 *
	 **/
	render: function(model, cntx, container) {

		//jmask_initHandlers(this);

		this.components = [];
		if (this.length === 1) {
			return _mask_render(this[0], model, cntx, container, this);
		}

		if (container == null) {
			container = document.createDocumentFragment();
		}

		for (var i = 0, x, length = this.length; i < length; i++) {
			_mask_render(this[i], model, cntx, container, this);
		}
		return container;
	},
	prevObject: null,
	end: function() {
		return this.prevObject || this;
	},
	pushStack: function(nodes) {
		var next;
		next = jMask(nodes);
		next.prevObject = this;
		return next;
	},
	controllers: function(selector) {
		if (this.components == null) {
			console.warn('Set was not rendered');
		}

		return this.pushStack(this.components || []);
	},
	mask: function(template) {
		if (template != null) {
			return this.empty().append(template);
		}

		if (arguments.length){
			return this;
		}

		var node;

		if (this.length === 0) {
			node = new Dom.Node();
		} else if (this.length === 1) {
			node = this[0];
		} else {
			node = new Dom.Fragment();
			for (var i = 0, x, length = this.length; i < length; i++) {
				node.nodes[i] = this[i];
			}
		}

		return mask.stringify(node);
	}
}

arr_each(['append', 'prepend'], function(method) {

	jMask.prototype[method] = function(mix) {
		var $mix = jMask(mix),
			i = 0,
			length = this.length,
			arr, node;

		for (; i < length; i++) {
			node = this[i];
			// we create each iteration a new array to prevent collisions in future manipulations
			arr = $mix.toArray();

			for (var j = 0, jmax = arr.length; j < jmax; j++) {
				arr[j].parent = node;
			}

			if (node.nodes == null) {
				node.nodes = arr;
				continue;
			}

			node.nodes = method === 'append' ? node.nodes.concat(arr) : arr.concat(node.nodes);
		}

		return this;
	}

});

arr_each(['appendTo'], function(method) {

	jMask.prototype[method] = function(mix, model, cntx) {

		if (mix.nodeType != null && typeof mix.appendChild === 'function') {

			mix.appendChild(this.render(model, cntx));

			Compo.shots.emit(this, 'DOMInsert');
			return this;
		}

		jMask(mix).append(this);
		return this;
	}

});

	// source jmask.utils.js

function jmask_filter(arr, matcher) {
	if (matcher == null) {
		return arr;
	}

	var result = [];
	for (var i = 0, x, length = arr.length; i < length; i++) {
		x = arr[i];
		if (selector_match(x, matcher)) {
			result.push(x);
		}
	}
	return result;
}

/**
 * - mix (Node | Array[Node])
 */
function jmask_find(mix, matcher, output) {
	if (output == null) {
		output = [];
	}

	if (mix instanceof Array){
		for(var i = 0, length = mix.length; i < length; i++){
			jmask_find(mix[i], matcher, output);
		}
		return output;
	}

	if (selector_match(mix, matcher)){
		output.push(mix);
	}

	var next = mix[matcher.nextKey];

	if (next != null){
		jmask_find(next, matcher, output);
	}

	return output;
}

function jmask_clone(node, parent){

	var copy = {
		'type': 1,
		'tagName': 1,
		'compoName': 1,
		'controller': 1
	};

	var clone = {
		parent: parent
	};

	for(var key in node){
		if (copy[key] === 1){
			clone[key] = node[key];
		}
	}

	if (node.attr){
		clone.attr = util_extend({}, node.attr);
	}

	var nodes = node.nodes;
	if (nodes != null && nodes.length > 0){
		clone.nodes = [];

		var isarray = nodes instanceof Array,
			length = isarray === true ? nodes.length : 1,
			i = 0,
			x;
		for(; i< length; i++){
			clone.nodes[i] = jmask_clone(isarray === true ? nodes[i] : nodes, clone);
		}
	}

	return clone;
}


function jmask_deepest(node){
	var current = node,
		prev;
	while(current != null){
		prev = current;
		current = current.nodes && current.nodes[0];
	}
	return prev;
}

function jmask_initHandlers($$, parent){
	var instance;

	for(var i = 0, x, length = $$.length; i < length; i++){
		x = $$[i];
		if (x.type === Dom.COMPONENT){
			if (typeof x.controller === 'function'){
				instance = new x.controller();
				instance.nodes = x.nodes;
				instance.attr = util_extend(instance.attr, x.attr);
				instance.compoName = x.compoName;
				instance.parent = parent;

				x = $$[i] = instance;
			}
		}
		if (x.nodes != null){
			jmask_initHandlers(x.nodes, x);
		}
	}
}


	// source manip.attr.js
(function() {
	arr_each(['add', 'remove', 'toggle', 'has'], function(method) {

		jMask.prototype[method + 'Class'] = function(klass) {
			var length = this.length,
				i = 0,
				classNames, j, jmax, node, current;

			if (typeof klass !== 'string') {
				if (method === 'remove') {
					for (; i < length; i++) {
						this[0].attr['class'] = null;
					}
				}
				return this;
			}


			for (; i < length; i++) {
				node = this[i];

				if (node.attr == null) {
					continue;
				}

				current = node.attr['class'];

				if (current == null) {
					current = klass;
				} else {
					current = ' ' + current + ' ';

					if (classNames == null) {
						classNames = klass.split(' ');
						jmax = classNames.length;
					}
					for (j = 0; j < jmax; j++) {
						if (!classNames[j]) {
							continue;
						}

						var hasClass = current.indexOf(' ' + classNames[j] + ' ') > -1;

						if (method === 'has') {
							if (hasClass) {
								return true;
							} else {
								continue;
							}
						}

						if (hasClass === false && (method === 'add' || method === 'toggle')) {
							current += classNames[j] + ' ';
						} else if (hasClass === true && (method === 'remove' || method === 'toggle')) {
							current = current.replace(' ' + classNames[j] + ' ', ' ');
						}
					}
					current = current.trim();
				}

				if (method !== 'has') {
					node.attr['class'] = current;
				}
			}

			if (method === 'has') {
				return false
			}

			return this;
		}

	});


	arr_each(['attr', 'removeAttr', 'prop', 'removeProp'], function(method) {
		jMask.prototype[method] = function(key, value) {
			if (!key) {
				return this;
			}

			var length = this.length,
				i = 0,
				args = arguments.length,
				node;

			for (; i < length; i++) {
				node = this[i];

				switch (method) {
				case 'attr':
				case 'prop':
					if (args === 1) {
						if (typeof key === 'string') {
							return node.attr[key];
						} else {
							for (var x in key) {
								node.attr[x] = key[x];
							}
						}
					} else if (args === 2) {
						node.attr[key] = value;
					}
					break;
				case 'removeAttr':
				case 'removeProp':
					node.attr[key] = null;
					break;
				}
			}

			return this;
		}
	})

	util_extend(jMask.prototype, {
		tag: function(arg){
			if (typeof arg === 'string'){
				for(var i = 0, length = this.length; i < length; i++){
					this[i].tagName = arg;
				}
				return this;
			}
			return this[0] && this[0].tagName;
		},
		css: function(mix, value) {
			var args = arguments.length,
				length = this.length,
				i = 0,
				node, css, j, jmax, index, key, style;

			if (args === 1 && typeof mix === 'string') {
				if (length === 0) {
					return null;
				}
				if (typeof this[0].attr.style === 'string') {
					return css_toObject(this[0].attr.style)[mix];
				} else {
					return null;
				}
			}

			for (; i < length; i++) {
				style = this[i].attr.style;

				if (typeof style === 'function') {
					continue;
				}
				if (args === 1 && typeof mix === 'object') {
					if (style == null) {
						this[i].attr.style = css_toString(mix);
						continue;
					}
					css = css_toObject(style);
					for (key in mix) {
						css[key] = mix[key];
					}
					this[i].attr.style = css_toString(css);
				}

				if (args === 2) {
					if (style == null) {
						this[i].attr.style = mix + ':' + value;
						continue;
					}
					css = css_toObject(style);
					css[mix] = value;
					this[i].attr.style = css_toString(css);

				}
			}

			return this;
		}
	});

	// TODO: val(...)?

	function css_toObject(style) {
		var arr = style.split(';'),
			obj = {},
			index;
		for (var i = 0, x, length = arr.length; i < length; i++) {
			x = arr[i];
			index = x.indexOf(':');
			obj[x.substring(0, index).trim()] = x.substring(index + 1).trim();
		}
		return obj;
	}

	function css_toString(css) {
		var output = [],
			i = 0;
		for (var key in css) {
			output[i++] = key + ':' + css[key];
		}
		return output.join(';');
	}

	}());

	// source manip.dom.js


util_extend(jMask.prototype, {
	clone: function(){
		var result = [];
		for(var i = 0, length = this.length; i < length; i++){
			result[i] = jmask_clone(this[0]);
		}
		return jMask(result);
	},

	// @TODO - wrap also in maskdom (modify parents)
	wrap: function(wrapper){
		var $mask = jMask(wrapper),
			result = [],
			$wrapper,
			deepest;

		if ($mask.length === 0){
			console.log('Not valid wrapper', wrapper);
			return this;
		}

		for(var i = 0, x, length = this.length; i < length; i++){
			$wrapper = length > 0 ? $mask.clone() : $mask;
			jmask_deepest($wrapper[0]).nodes = [this[i]];

			result[i] = $wrapper[0];

			if (this[i].parent != null){
				this[i].parent.nodes = result[i];
			}
		}

		return jMask(result);
	},
	wrapAll: function(wrapper){
		var $wrapper = jMask(wrapper);
		if ($wrapper.length === 0){
			console.error('Not valid wrapper', wrapper);
			return this;
		}


		this.parent().mask($wrapper);

		jmask_deepest($wrapper[0]).nodes = this.toArray();
		return this.pushStack($wrapper);
	}
})

arr_each(['empty', 'remove'], function(method) {
	jMask.prototype[method] = function(mix) {
		var i = 0,
			length = this.length,
			arr, node;

		for (; i < length; i++) {
			node = this[i];

			if (method === 'empty') {
				node.nodes = null;
				continue;
			}
			if (method === 'remove') {
				if (node.parent != null) {
					arr_remove(node.parent.nodes, node);
				}
				continue;
			}

		}

		return this;
	}
});

	// source traverse.js
util_extend(jMask.prototype, {
	each: function(fn) {
		for (var i = 0, x, length = this.length; i < length; i++) {
			fn(this[i], i);
		}
		return this;
	},
	eq: function(i) {
		return i === -1 ? this.slice(i) : this.slice(i, i + 1);
	},
	get: function(i){
		return i < 0 ? this[this.length - i] : this[i];
	},
	slice: function() {
		return this.pushStack(Array.prototype.slice.apply(this, arguments));
	}
});


arr_each(['filter', 'children', 'closest', 'parent', 'find', 'first', 'last'], function(method) {

	jMask.prototype[method] = function(selector) {
		var result = [],
			matcher = selector == null ? null : selector_parse(selector, this.type, method === 'closest' ? 'up' : 'down');

		switch (method) {
		case 'filter':
			return jMask(jmask_filter(this, matcher));
		case 'children':
			for (var i = 0, x, length = this.length; i < length; i++) {
				x = this[i];
				if (x.nodes == null) {
					continue;
				}
				result = result.concat(matcher == null ? x.nodes : jmask_filter(x.nodes, matcher));
			}
			break;
		case 'parent':
			for (var i = 0, x, length = this.length; i < length; i++) {
				x = this[i].parent;
				if (!x || x.type === Dom.FRAGMENT || (matcher && selector_match(x, matcher))) {
					continue;
				}
				result.push(x);
			}
			break;
		case 'closest':
		case 'find':
			if (matcher == null) {
				break;
			}
			for (var i = 0, length = this.length; i < length; i++) {
				jmask_find(this[i][matcher.nextKey], matcher, result);
			}
			break;
		case 'first':
		case 'last':
			var index;
			for(var i = 0, x, length = this.length; i < length; i++){
				index = method === 'first' ? i : length - i - 1;
				x = this[index];
				if (matcher == null || selector_match(x, matcher)){
					result[0] = x;
					break;
				}
			}
			break;
		}

		return this.pushStack(result);
	}

});


	return jMask;
}());


/* Compo */
// source ../src/compo/children.js
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
// source ../src/compo/events.js
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
// source ../src/compo/anchor.js

/**
 *	Get component that owns an element
 **/

var Anchor = (function(){

	var _cache = {},
		_counter = 0;
	return {
		create: function(compo, elements){
			_cache[++_counter] = compo;

			for(var i = 0, x, length = elements.length; i < length; i++){
				elements[i].setAttribute('x-compo-id', _counter);
			}
		},
		resolveCompo: function(element){
			do {

				var id = element.getAttribute('x-compo-id');
				if (id != null){
					var compo = _cache[id];
					if (compo == null){
						console.warn('No component in cache for id', id);
					}
					return compo;
				}

				element = element.parentNode;

			}while(element && element.nodeType === 1);

			return null;
		},
		removeCompo: function(compo){
			for(var key in _cache){
				if (_cache[key] === compo){
					delete _cache[key];
					return;
				}
			}
		}
	}

}());

// source ../src/compo/Compo.js
var Compo = (function() {



	function Compo(controller) {
		var klass;

		if (controller == null){
			controller = {};
		}

		if (controller.hasOwnProperty('constructor')){
			klass = controller.constructor;
		}

		if (klass == null){
			klass = function CompoBase(){};
		}

		for(var key in Proto){
			if (controller[key] == null){
				controller[key] = Proto[key];
			}
			controller['base_' + key] = Proto[key];
		}


		klass.prototype = controller;


		return klass;
	}

	// source Compo.util.js
function compo_dispose(compo) {
	if (compo.dispose != null) {
		compo.dispose();
	}

	Anchor.removeCompo(compo);

	var i = 0,
		compos = compo.components,
		length = compos && compos.length;

	if (length) {
		for (; i < length; i++) {
			compo_dispose(compos[i]);
		}
	}
}

function compo_ensureTemplate(compo) {
	if (compo.nodes != null) {
		return;
	}

	var template = compo.attr.template;

	if (typeof template === 'string') {
		if (template[0] === '#') {
			var node = document.getElementById(template.substring(1));
			if (node == null) {
				console.error('Template holder not found by id:', template);
				return;
			}
			template = node.innerHTML;
		}
		template = mask.compile(template);
	}

	if (typeof template !== 'undefined') {
		compo.nodes = template;

		delete compo.attr.template;
	}
}

function compo_containerArray() {
	var arr = [];
	arr.appendChild = function(child) {
		this.push(child);
	};
	return arr;
}

	// source Compo.static.js
util_extend(Compo, {
	render: function(compo, model, cntx, container) {

		compo_ensureTemplate(compo);

		var elements = [];

		mask.render(compo.tagName == null ? compo.nodes : compo, model, cntx, container, compo, elements);

		compo.$ = domLib(elements);

		if (compo.events != null) {
			Events_.on(compo, compo.events);
		}
		if (compo.compos != null) {
			Children_.select(compo, compo.compos);
		}

		return compo;
	},

	initialize: function(compo, model, cntx, container, parent) {

		if (container == null){
			if (cntx && cntx.nodeType != null){
				cntx = null;
				container = cntx;
			}else if (model && model.nodeType != null){
				model = null;
				container = cntx;
			}
		}

		if (typeof compo === 'string'){
			compo = mask.getHandler(compo);
			if (!compo){
				console.error('Compo not found:', compo);
			}
		}

		var node = {
			controller: compo,
			type: Dom.COMPONENT
		};

		if (parent == null && container != null){
			parent = Anchor.resolveCompo(container);
		}

		if (parent == null){
			parent = {};
		}

		var dom = mask.render(node, model, cntx, null, parent),
			instance = parent.components[parent.components.length - 1];

		if (container != null){
			container.appendChild(dom);

			Compo.shots.emit(instance, 'DOMInsert');
		}

		return instance;
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

	find: function(compo, selector){
		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
	},
	closest: function(compo, selector){
		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
	},

	ensureTemplate: compo_ensureTemplate,

	config: {
		selectors: {
			'$': function(compo, selector) {
				var r = compo.$.find(selector);
				if (r.length > 0) {
					return r;
				}
				r = compo.$.filter(selector);

				// if debug
				if (r.length === 0) {
					console.error('Compo Selector - element not found -', selector, compo);
				}
				// endif

				return r;
			},
			'compo': function(compo, selector) {
				var r = Compo.find(compo, selector);
				if (r == null) {
					console.error('Compo Selector - component not found -', selector, compo)
				}
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




	var Proto = {
		type: Dom.CONTROLLER,
		tagName: null,
		compoName: null,
		nodes: null,
		attr: null,
		onRenderStart: null,
		onRenderEnd: null,
		render: null,
		renderStart: function(model, cntx, container){

			if (arguments.length === 1 && model instanceof Array === false && model[0] != null){
				model = arguments[0][0];
				cntx = arguments[0][1];
				container = arguments[0][2];
			}


			if (typeof this.onRenderStart === 'function'){
				this.onRenderStart(model, cntx, container);
			}

			if (this.model == null){
				this.model = model;
			}

			if (this.nodes == null){
				compo_ensureTemplate(this);
			}

		},
		renderEnd: function(elements, model, cntx, container){
			if (arguments.length === 1 && elements instanceof Array === false){
				elements = arguments[0][0];
				model = arguments[0][1];
				cntx = arguments[0][2];
				container = arguments[0][3];
			}

			Anchor.create(this, elements);

			this.$ = domLib(elements);

			if (this.events != null) {
				Events_.on(this, this.events);
			}

			if (this.compos != null) {
				Children_.select(this, this.compos);
			}

			if (typeof this.onRenderEnd === 'function'){
				this.onRenderEnd(elements, model, cntx, container);
			}
		},
		appendTo: function(arg, cntx) {
			var element;

			if (typeof arg === 'string') {
				element = document.querySelector(arg)
			} else {
				element = arg;
			}

			if (element == null) {
				console.warn('Compo.appendTo: parent is undefined. Args:', arguments);
				return this;
			}

			for (var i = 0; i < this.$.length; i++) {
				element.appendChild(this.$[i]);
			}

			Shots.emit(this, 'DOMInsert');
			return this;
		},
		append: function(template, model, selector) {
			var parent;

			if (this.$ == null) {
				var dom = typeof template == 'string' ? mask.compile(template) : template;

				parent = selector ? jmask(this).find(selector).get(0) : this;
				if (parent.nodes == null) {
					this.nodes = dom;
					return this;
				}

				parent.nodes = [this.nodes, dom];

				return this;
			}
			var array = mask.render(template, model, null, compo_containerArray(), this);

			parent = selector ? this.$.find(selector) : this.$;
			for (var i = 0; i < array.length; i++) {
				parent.append(array[i]);
			}

			Shots.emit(this, 'DOMInsert');
			return this;
		},
		find: function(selector){
			return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'));
		},
		closest: function(selector){
			return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'up'));
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
			if (this.$ != null){
				this.$.remove();
				this.$ = null;
			}

			compo_dispose(this);

			var components = this.parent && this.parent.components;
			if (components != null) {
				var i = components.indexOf(this);

				if (i === -1){
					console.warn('Compo::remove - parent doesnt contains me', this);
					return this;
				}

				components.splice(i, 1);
			}

			return this;
		}
	};

	Compo.prototype = Proto;




	return Compo;
}());

// source ../src/jcompo/jCompo.js
(function(){

	if (domLib == null || domLib.fn == null){
		return;
	}


	domLib.fn.compo = function(selector){
		if (this.length === 0){
			return null;
		}
		var compo = Anchor.resolveCompo(this[0]);

		if (selector == null){
			return compo;
		}

		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
	}

	domLib.fn.model = function(selector){
		var compo = this.compo(selector);
		if (compo == null){
			return null;
		}
		var model = compo.model;
		while(model == null && compo.parent){
			compo = compo.parent;
			model = compo.model;
		}
		return model;
	}

}());


	return {
		jmask: jMask,
		Compo: Compo
	};

}));
