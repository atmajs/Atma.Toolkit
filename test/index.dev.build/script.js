;
(function(w) {

	var helper = {
		each: function(arr, fn) {
			if (arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					fn(arr[i]);
				}
				return;
			}
			fn(arr);
		},
		extendProto: function(proto, x) {
			var prototype;
			if (x == null) return;
			switch (typeof x) {
			case 'function':
				prototype = x.prototype;
				break;
			case 'object':
				prototype = x;
				break;
			default:
				return;
			}
			for (var key in prototype) {
				proto[key] = prototype[key];
			}
		},

		extendClass: function(_class, _base, _extends, original) {
			
			if (typeof original !== 'object') return;

			this.extendPrototype = original.__proto__ == null ? this.protoLess : this.proto;
			this.extendPrototype(_class, _base, _extends, original);
		},
		proto: function(_class, _base, _extends, original) {
			var prototype = original,
				proto = original;
			
			if (_extends != null) {
				proto.__proto__ = {};
				helper.each(_extends, function(x) {
					helper.extendProto(proto.__proto__, x);
				});
				proto = proto.__proto__;
			}
			
			if (_base != null) {
				proto.__proto__ = _base.prototype;
			}

			_class.prototype = prototype;
		},
		/** browser that doesnt support __proto__ */
		protoLess: function(_class, _base, _extends, original) {
			
			if (_base != null) {
				var proto = {},
					tmp = new Function;
					
				tmp.prototype = _base.prototype;
				_class.prototype = new tmp();
				_class.constructor = _base;
			}
			
			helper.extendProto(_class.prototype, original);
			if (_extends != null) {				
				helper.each(_extends, function(x){
					helper.extendProto(_class.prototype, x);
				});				
			}
		}
	}

	w.Class = function(data) {
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null;
			
		if (_base != null) delete data.Base;
		if (_extends != null) delete data.Extends;
		if (_static != null) delete data.Static;
		if (_construct != null) delete data.Construct;
		
		
		if (_base == null && _extends == null) {
			if (_construct == null)   _class = function() {};
			else _class = _construct;				
			
			if (_static != null) {
				for (var key in _static) _class[key] = _static[key];				
			}

			_class.prototype = data;
			return _class;

		}
		
		_class = function() {
			
			if (_extends != null){				
				var isarray = _extends instanceof Array,
					length = isarray ? _extends.length : 1,
					x = null;
				for (var i = 0; x = isarray ? _extends[i] : _extends, isarray ? i < length : i < 1; i++) {
					if (typeof x === 'function') x.apply(this, arguments);
				}				
			}
			
			if (_base != null) {								
				_base.apply(this, arguments);			
			}
			
			if (_construct != null) {
				var r = _construct.apply(this, arguments);
				if (r != null) return r;
			}
			return this;
		}
		
		if (_static != null)  for (var key in _static) _class[key] = _static[key]; 			
		
		
		helper.extendClass(_class, _base, _extends, data);
		
		
		data = null;
		_static = null;
		
		return _class;
	}



})(window);

;;
void

function(w, d) {

	var cfg = {},
		bin = {},
		isWeb = !! (w.location && w.location.protocol && /^https?:/.test(w.location.protocol)),
		handler = {},
		regexp = {
			name: new RegExp('\\{name\\}', 'g')
		},
		helper = { /** TODO: improve url handling*/
			uri: {
				getDir: function(url) {
					var index = url.lastIndexOf('/');
					return index == -1 ? '' : url.substring(index + 1, -index);
				},
				/** @obsolete */
				resolveCurrent: function() {
					var scripts = d.querySelectorAll('script');
					return scripts[scripts.length - 1].getAttribute('src');
				},
				resolveUrl: function(url, parent) {
					if (cfg.path && url[0] == '/') {
						url = cfg.path + url.substring(1);
					}
					if (url[0] == '/') {
						if (isWeb == false || cfg.lockedToFolder == true) return url.substring(1);
						return url;
					}
					switch (url.substring(0, 4)) {
					case 'file':
					case 'http':
						return url;
					}

					if (parent != null && parent.location != null) return parent.location + url;
					return url;
				}
			},
			extend: function(target, source) {
				for (var key in source) target[key] = source[key];
				return target;
			},
			/**
			 *	@arg x :
			 *	1. string - URL to resource
			 *	2. array - URLs to resources
			 *	3. object - {route: x} - route defines the route template to resource,
			 *		it must be set before in include.cfg.
			 *		example:
			 *			include.cfg('net','scripts/net/{name}.js')
			 *			include.js({net: 'downloader'}) // -> will load scipts/net/downloader.js
			 *	@arg namespace - route in case of resource url template, or namespace in case of LazyModule
			 *
			 *	@arg fn - callback function, which receives namespace|route, url to resource and ?id in case of not relative url
			 *	@arg xpath - xpath string of a lazy object 'object.sub.and.othersub';
			 */
			eachIncludeItem: function(type, x, fn, namespace, xpath) {
				if (x == null) {
					console.error('Include Item has no Data', type, namespace);
					return;
				}

				if (type == 'lazy' && xpath == null) {
					for (var key in x) this.eachIncludeItem(type, x[key], fn, null, key);
					return;
				}
				if (x instanceof Array) {
					for (var i = 0; i < x.length; i++) this.eachIncludeItem(type, x[i], fn, namespace, xpath);
					return;
				}
				if (typeof x === 'object') {
					for (var key in x) this.eachIncludeItem(type, x[key], fn, key, xpath);
					return;
				}

				if (typeof x === 'string') {
					var route = namespace && cfg[namespace];
					if (route) {
						namespace += '.' + x;
						x = route.replace(regexp.name, x);
					}
					fn(namespace, x, xpath);
					return;
				}

				console.error('Include Package is invalid', arguments);
			},
			invokeEach: function(arr, args) {
				if (arr == null) return;
				if (arr instanceof Array) {
					for (var i = 0, x, length = arr.length; x = arr[i], i < length; i++) {
						if (typeof x === 'function')(args != null ? x.apply(this, args) : x());
					}
				}
			},
			doNothing: function(fn) {
				typeof fn == 'function' && fn()
			},
			reportError: function(e) {
				console.error('IncludeJS Error:', e, e.message, e.url);
				typeof handler.onerror == 'function' && handler.onerror(e);
			},
			ensureArray: function(obj, xpath) {
				if (!xpath) return obj;
				var arr = xpath.split('.');
				while (arr.length - 1) {
					var key = arr.shift();
					obj = obj[key] || (obj[key] = {});
				}
				return (obj[arr.shift()] = []);
			},
			xhr: function(url, callback) {
				var xhr = new XMLHttpRequest(),
					s = Date.now();
				xhr.onreadystatechange = function() {
					xhr.readyState == 4 && callback && callback(url, xhr.responseText);
				}
				xhr.open('GET', url, true);
				xhr.send();
			}
		},

		events = (function(w, d) {
			if (d == null) {
				return {
					ready: helper.doNothing,
					load: helper.doNothing
				};
			}
			var readycollection = [],
				loadcollection = null,
				readyqueue = null,
				timer = Date.now();

			d.onreadystatechange = function() {
				if (/complete|interactive/g.test(d.readyState) == false) return;

				if (timer) console.log('DOMContentLoader', d.readyState, Date.now() - timer, 'ms');
				events.ready = (events.readyQueue = helper.doNothing);
				
				
				helper.invokeEach(readyqueue);
				
				helper.invokeEach(readycollection);				
				readycollection = null;
				readyqueue = null;
				
				
				if (d.readyState == 'complete') {
					events.load = helper.doNothing;
					helper.invokeEach(loadcollection);
					loadcollection = null;
				}
			};

			return {
				ready: function(callback) {
					readycollection.unshift(callback);
				},
				readyQueue: function(callback){
					(readyqueue || (readyqueue = [])).push(callback);
				},
				load: function(callback) {
					(loadcollection || (loadcollection = [])).unshift(callback);
				}
			}
		})(w, d);


	var IncludeDeferred = Class({
		ready: function(callback) {
			return this.on(4, function() {
				events.ready(callback);
			});
		},
		/** assest loaded and window is loaded */
		loaded: function(callback) {
			return this.on(4, function() {
				events.load(callback);
			});
		},
		/** assest loaded */
		done: function(callback) {
			return this.on(4, this.resolve.bind(this, callback));
		},
		resolve: function(callback) {
			var r = callback(this.response);
			if (r != null) this.obj = r;
		}
	});


	var StateObservable = Class({
		Construct: function() {
			this.callbacks = [];
		},
		on: function(state, callback) {
			state <= this.state ? callback(this) : this.callbacks.unshift({
				state: state,
				callback: callback
			});
			return this;
		},
		readystatechanged: function(state) {
			this.state = state;
			for (var i = 0, x, length = this.callbacks.length; x = this.callbacks[i], i < length; i++) {
				if (x.state > this.state || x.callback == null) continue;
				x.callback(this);
				x.callback = null;
			}
		}
	});


	var currentParent;
	var Include = Class({
		setCurrent: function(data) {
			currentParent = data;
		},
		incl: function(type, pckg) {
			if (this instanceof Resource) return this.include(type, pckg);

			var r = new Resource;

			if (currentParent) {
				r.id = currentParent.id;
				//-r.url = currentParent.url;
				r.namespace = currentParent.namespace;
				//-currentParent = null;
			}
			return r.include(type, pckg);
			//-return (this instanceof Resource ? this : new Resource).include(type, pckg);
		},
		js: function(pckg) {
			return this.incl('js', pckg);
		},
		css: function(pckg) {
			return this.incl('css', pckg);
		},
		load: function(pckg) {
			return this.incl('load', pckg);
		},
		ajax: function(pckg) {
			return this.incl('ajax', pckg);
		},
		embed: function(pckg) {
			return this.incl('embed', pckg);
		},
		lazy: function(pckg) {
			return this.incl('lazy', pckg);
		},

		cfg: function(arg) {
			switch (typeof arg) {
			case 'object':
				for (var key in arg) cfg[key] = arg[key];
				break;
			case 'string':
				if (arguments.length == 1) return cfg[arg];
				if (arguments.length == 2) cfg[arg] = arguments[1];
				break;
			case 'undefined':
				return cfg;
			}
			return this;
		},
		promise: function(namespace) {
			var arr = namespace.split('.'),
				obj = w;
			while (arr.length) {
				var key = arr.shift();
				obj = obj[key] || (obj[key] = {});
			}
			return obj;
		},
		register: function(_bin) {
			var onready = [];
			for (var key in _bin) {
				for (var i = 0; i < _bin[key].length; i++) {
					var id = _bin[key][i].id,
						url = _bin[key][i].url,
						namespace = _bin[key][i].namespace,
						resource = new Resource;

					resource.state = 4;
					resource.namespace = namespace;
					resource.type = key;
					
					if (url) {
						if (url[0] == '/') url = url.substring(1);
						resource.location = helper.uri.getDir(url);
					}

					switch (key) {
					case 'load':
					case 'lazy':
						resource.state = 0;
						events.readyQueue(function(_r, _id) {
							var container = d.querySelector('script[data-id="' + _id + '"]');
							if (container == null) {
								console.error('"%s" Data was not embedded into html', _id);
								return;
							}
							_r.obj = container.innerHTML;
							_r.readystatechanged(4);
						}.bind(this, resource, id));
						break;
					};
					(bin[key] || (bin[key] = {}))[id] = resource;
				}
			}			
		}
	});


	var hasRewrites = typeof IncludeRewrites != 'undefined',
		rewrites = hasRewrites ? IncludeRewrites : null;


	var Resource = Class({
		Base: Include,
		Extends: [IncludeDeferred, StateObservable],
		Construct: function(type, url, namespace, xpath, parent, id) {

			if (type == null) {
				return this;
			}



			this.namespace = namespace;
			this.type = type;
			this.xpath = xpath;
			this.url = url;

			if (url != null) {
				this.url = helper.uri.resolveUrl(url, parent);
			}


			if (id) void(0);
			else if (namespace) id = namespace;
			else if (url[0] == '/') id = url;
			else if (parent && parent.namespace) id = parent.namespace + '/' + url;
			else if (parent && parent.location) id = '/' + parent.location.replace(/^[\/]+/, '') + url;
			else id = '/' + url;

			if (bin[type] && bin[type][id]) {
				return bin[type][id];
			}


			if (hasRewrites == true && rewrites[id] != null) {
				url = rewrites[id];
			} else {
				url = this.url;
			}

			this.location = helper.uri.getDir(url);

			//-console.log('includejs. Load Resource:', id, url);


			;
			(bin[type] || (bin[type] = {}))[id] = this;


			var tag;
			switch (type) {
			case 'js':
				helper.xhr(url, this.onload.bind(this));
				if (d != null) {
					tag = d.createElement('script');
					tag.type = "application/x-included-placeholder";
					tag.src = url;
				}
				break;
			case 'ajax':
			case 'load':
			case 'lazy':
				helper.xhr(url, this.onload.bind(this));
				break;
			case 'css':
				this.state = 4;

				tag = d.createElement('link');
				tag.href = url;
				tag.rel = "stylesheet";
				tag.type = "text/css";
				break;
			case 'embed':
				tag = d.createElement('script');
				tag.type = 'application/javascript';
				tag.src = url;
				tag.onload = function() {
					this.readystatechanged(4);
				}.bind(this);
				tag.onerror = tag.onload;
				break;
			}
			if (tag != null) {
				d.querySelector('head').appendChild(tag);
				tag = null;
			}
			return this;
		},
		include: function(type, pckg) {
			this.state = 0;
			if (this.includes == null) this.includes = [];

			helper.eachIncludeItem(type, pckg, function(namespace, url, xpath) {

				var resource = new Resource(type, url, namespace, xpath, this);


				this.includes.push(resource);

				resource.index = this.calcIndex(type, namespace);
				resource.on(4, this.resourceLoaded.bind(this));
			}.bind(this));

			return this;
		},
		calcIndex: function(type, namespace) {
			if (this.response == null) this.response = {};
			switch (type) {
			case 'js':
			case 'load':
			case 'ajax':
				if (this.response[type + 'Index'] == null) this.response[type + 'Index'] = -1;
				return ++this.response[type + 'Index'];
			}
			return -1;
		},
		wait: function() {
			if (this.waits == null) this.waits = [];
			if (this._include == null) this._include = this.include;

			var data;

			this.waits.push((data = []));
			this.include = function(type, pckg) {
				data.push({
					type: type,
					pckg: pckg
				});
				return this;
			}
			return this;
		},
		resourceLoaded: function(resource) {
			if (this.parsing) return;


			if (resource != null && resource.obj != null && resource.obj instanceof Include === false) {
				switch (resource.type) {
				case 'js':
				case 'load':
				case 'ajax':
					var obj = (this.response[resource.type] || (this.response[resource.type] = []));

					if (resource.namespace != null) {
						obj = helper.ensureArray(obj, resource.namespace);
					}
					obj[resource.index] = resource.obj;
					break;
				}
			}

			if (this.includes != null && this.includes.length) {
				for (var i = 0; i < this.includes.length; i++) if (this.includes[i].state != 4) return;
			}


			if (this.waits && this.waits.length) {

				var data = this.waits.shift();
				this.include = this._include;
				for (var i = 0; i < data.length; i++) this.include(data[i].type, data[i].pckg);
				return;
			}

			this.readystatechanged((this.state = 4));

		},

		onload: function(url, response) {
			if (!response) {
				console.warn('Resource cannt be loaded', this.url);
				this.readystatechanged(4);
				return;
			}

			switch (this.type) {
			case 'load':
			case 'ajax':
				this.obj = response;
				break;
			case 'lazy':
				LazyModule.create(this.xpath, response);
				break;
			case 'js':
				this.parsing = true;
				try {
					__includeEval(response, this);
				} catch (error) {
					error.url = this.url;
					helper.reportError(error);
				}
				break;
			};

			this.parsing = false;

			this.resourceLoaded(null);

		}

	});


	var LazyModule = {
		create: function(xpath, code) {
			var arr = xpath.split('.'),
				obj = window,
				module = arr[arr.length - 1];
			while (arr.length > 1) {
				var prop = arr.shift();
				obj = obj[prop] || (obj[prop] = {});
			}
			arr = null;
			obj.__defineGetter__(module, function() {

				delete obj[module];
				try {
					var r = __includeEval(code, window.include);
					if (r != null && r instanceof Resource == false) obj[module] = r;
				} catch (error) {
					error.xpath = xpath;
					helper.reportError(e);
				} finally {
					code = null;
					xpath = null;

					return obj[module];
				}
			});
		}
	}


	w.include = new Include();
	w.include.helper = helper;
	w.IncludeResource = Resource;


}(window, window.document);

window.__includeEval = function(source, include) {
	return eval(source);
}
;include.cfg({"lib":"/.import/libjs/{name}/lib/{name}.js","framework":"/.import/libjs/framework/lib/{name}.js","compo":"/.import/libjs/compos/{name}/lib/{name}.js"}); include.register({"css":[{"id":"/style/main.css","url":"style/main.css","namespace":""}],"js":[{"id":"/.import/libjs/class/lib/class.js","url":".import/libjs/class/lib/class.js","namespace":""},{"id":"/.import/libjs/include/lib/include.js","url":".import/libjs/include/lib/include.js","namespace":""},{"id":"/include.routes.js","url":"include.routes.js","namespace":""},{"id":"lib.mask","url":"/.import/libjs/mask/lib/mask.js","namespace":"lib.mask"},{"id":"lib.compo","url":"/.import/libjs/compo/lib/compo.js","namespace":"lib.compo"},{"id":"framework.dom/zepto","url":"/.import/libjs/framework/lib/dom/zepto.js","namespace":"framework.dom/zepto"},{"id":"/script/main.js","url":"script/main.js","namespace":""}]})
;include.setCurrent({ id: '/include.routes.js', namespace: '', url: '{url}'});
;include.cfg({
     "lib": "/.import/libjs/{name}/lib/{name}.js",
     "framework": "/.import/libjs/framework/lib/{name}.js",
     "compo": "/.import/libjs/compos/{name}/lib/{name}.js"
});
;include.setCurrent({ id: 'lib.mask', namespace: 'lib.mask', url: '{url}'});
;//include('script/ruqq/class.js', function() {


window.mask = (function(w, d) {


	var regexp = {
		noWhitespace: /[^\s]/g,
		whitespace: /\s/g,
		attributes: /(([\w_-]+)='([^']+))|(\.([\w-_]+)[# \.;{])|(#([\w-_]+)[ \.])/g,
		linearCondition: /([!]?[\w\.-]+)([!<>=]{1,2})?([^\|\&]+)?([\|\&]{2})?/g,
		escapedChar: {
			"'": /\\'/g,
			'"': /\\"/g,
			'{': /\\\{/g,
			'>': /\\>/g,
			';': /\\>/g
		},
		attrEnd: /[\.#>\{ ;]/g
	},
		singleTags = {
			img: 1,
			input: 1,
			br: 1,
			hr: 1,
			link: 1
		};

	var Helper = {
		extend: function(target, source) {
			if (source == null) return target;
			if (target == null) target = {};
			for (var key in source) target[key] = source[key];
			return target;
		},
		getProperty: function(o, chain) {
			if (typeof o !== 'object' || chain == null) return o;
			if (typeof chain === 'string') chain = chain.split('.');
			if (chain.length === 1) return o[chain[0]];
			return this.getProperty(o[chain.shift()], chain);
		},
		templateFunction: function(arr, o) {

			var output = '';
			for (var i = 0; i < arr.length; i++) {
				if (i % 2 === 0) {
					output += arr[i];
				} else {
					var key = arr[i],
						value = null,
						index = key.indexOf(':');

					if (index > -1) {
						var utility = index > 0 ? key.substring(0, index).replace(regexp.whitespace, '') : '';
						if (utility === '') utility = 'condition';

						key = key.substring(index + 1);
						value = typeof ValueUtilities[utility] === 'function' ? ValueUtilities[utility](key, o) : null;

					} else {
						value = Helper.getProperty(o, arr[i]);
					}
					output += value == null ? '' : value;
				}
			}
			return output;
		}
	}

	var Template = function(template) {
		this.template = template;
		this.index = 0;
		this.length = template.length;
	}
	Template.prototype = {
		next: function() {
			this.index++;
			return this;
		},
		skipWhitespace: function() {
			//regexp.noWhitespace.lastIndex = this.index;
			//var result = regexp.noWhitespace.exec(this.template);
			//if (result){                
			//    this.index = result.index;                
			//}
			//return this;

			for (; this.index < this.length; this.index++) {
				if (this.template.charCodeAt(this.index) !== 32 /*' '*/ ) return this;
			}

			return this;
		},
		skipToChar: function(c) {
			var index = this.template.indexOf(c, this.index);
			if (index > -1) {
				this.index = index;
				if (this.template.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
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
			var result = r.exec(this.template);
			if (result != null) {
				this.index = result.index;
			}
			return this;
		},
		skipToAttributeBreak: function() {

			//regexp.attrEnd.lastIndex = ++this.index;
			//var result;
			//do{
			//    result = regexp.attrEnd.exec(this.template);
			//    if (result != null){
			//        if (result[0] == '#' && this.template.charCodeAt(this.index + 1) === 123) {
			//            regexp.attrEnd.lastIndex += 2;
			//            continue;
			//        }
			//        this.index = result.index;                    
			//        break;
			//    }
			//}while(result != null)
			//return this;
			var c;
			do {
				c = this.template.charCodeAt(++this.index);
				// if c == # && next() == { - continue */
				if (c === 35 && this.template.charCodeAt(this.index + 1) === 123) {
					this.index++;
					c = null;
				}
			}
			while (c !== 46 && c !== 35 && c !== 62 && c !== 123 && c !== 32 && c !== 59 && this.index < this.length);
			//while(!== ".#>{ ;");
			return this;
		},
		sliceToChar: function(c) {
			var start = this.index,
				isEscaped, index;

			while ((index = this.template.indexOf(c, this.index)) > -1) {
				this.index = index;
				if (this.template.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
					break;
				}
				isEscaped = true;
				this.index++;
			}

			var value = this.template.substring(start, this.index);
			return isEscaped ? value.replace(regexp.escapedChar[c], c) : value;

			//-return this.skipToChar(c).template.substring(start, this.index);
		},
		sliceToAny: function(chars) {
			var start = this.index;
			return this.skipToAny(chars).template.substring(start, this.index);
		}
	}

	var ICustomTag = function() {
		if (this.attr == null) this.attr = {};
	};
	ICustomTag.prototype.render = function(values, stream) {
		return stream instanceof Array ? Builder.buildHtml(this.noes, values, stream) : Builder.buildDom(this.nodes, values, stream);
	}

	var CustomTags = (function(ICustomTag) {
		var List = function() {
			this.attr = {}
		}
		List.prototype.render = function(values, container, cntx) {

			values = Helper.getProperty(values, this.attr.value);
			if (values instanceof Array === false) return container;


			if (this.attr.template != null) {
				var template = document.querySelector(this.attr.template).innerHTML;
				this.nodes = mask.compile(template);
			}


			if (this.nodes == null) return container;

			//-var fn = container instanceof Array ? 'buildHtml' : 'buildDom';
			var fn = container.buffer != null ? 'buildHtml' : 'buildDom';

			for (var i = 0, length = values.length; i < length; i++) {
				Builder[fn](this.nodes, values[i], container, cntx);
			}
			return container;
		}
		var Visible = function() {
			this.attr = {}
		}
		Visible.prototype.render = function(values, container, cntx) {
			if (ValueUtilities.out.isCondition(this.attr.check, values) === false) return container;
			return ICustomTag.prototype.render.call(this, values, container, cntx);
		}
		var Binding = function() {
			this.attr = {}
		}
		Binding.prototype.render = function(values, container) {
			var value = values[this.attr.value];
			Object.defineProperty(values, this.attr.value, {
				get: function() {
					return value;
				},
				set: function(x) {
					container.innerHTML = (value = x);
				}
			})
			container.innerHTML = value;
			return container;
		}


		return {
			all: {
				list: List,
				visible: Visible,
				bind: Binding
			}
		}
	})(ICustomTag);


	var ValueUtilities = (function(H, regexp) {
		//condition1 == condition2 ? case1 : case2            
		var parseLinearCondition = function(line) {
			var c = {
				assertions: []
			},
				buffer = {
					data: line.replace(regexp.whitespace, '')
				};

			buffer.index = buffer.data.indexOf('?');
			if (buffer.index == -1) console.error('Invalid Linear Condition: ? - no found');



			var match, expr = buffer.data.substring(0, buffer.index);
			while ((match = regexp.linearCondition.exec(expr)) != null) {
				c.assertions.push({
					join: match[4],
					left: match[1],
					sign: match[2],
					right: match[3]
				});
			}

			buffer.index++;
			parseCase(buffer, c, 'case1');

			buffer.index++;
			parseCase(buffer, c, 'case2');

			return c;
		},
			parseCase = function(buffer, obj, key) {
				var c = buffer.data[buffer.index],
					end = null;

				if (c == null) return;
				if (c === '"' || c === "'") {
					end = buffer.data.indexOf(c, ++buffer.index);
					obj[key] = buffer.data.substring(buffer.index, end);
				} else {
					end = buffer.data.indexOf(':', buffer.index);
					if (end == -1) end = buffer.data.length;
					obj[key] = {
						value: buffer.data.substring(buffer.index, end)
					};
				}
				if (end != null) buffer.index = ++end;
			},
			isCondition = function(con, values) {
				if (typeof con === 'string') con = parseLinearCondition(con);
				var current = false;
				for (var i = 0; i < con.assertions.length; i++) {
					var a = con.assertions[i],
						value1, value2;
					if (a.right == null) {

						current = a.left.charCodeAt(0) === 33 ? !H.getProperty(values, a.left.substring(1)) : !! H.getProperty(values, a.left);

						if (current == true) {
							if (a.join == '&&') continue;
							break;
						}
						if (a.join == '||') continue;
						break;
					}
					var c = a.right.charCodeAt(0);
					if (c === 34 || c === 39) {
						value2 = a.right.substring(1, a.right.length - 1);
					} else if (c > 47 && c < 58) {
						value2 = a.right;
					} else {
						value2 = H.getProperty(values, a.right);
					}

					value1 = H.getProperty(values, a.left);
					switch (a.sign) {
					case '<':
						current = value1 < value2;
						break;
					case '<=':
						current = value1 <= value2;
						break;
					case '>':
						current = value1 > value2;
						break;
					case '>=':
						current = value1 >= value2;
						break;
					case '!=':
						current = value1 != value2;
						break;
					case '==':
						current = value1 == value2;
						break;
					}

					if (current == true) {
						if (a.join == '&&') continue;
						break;
					}
					if (a.join == '||') continue;
					break;
				}
				return current;
			};

		return {
			condition: function(line, values) {
				con = parseLinearCondition(line);
				var result = isCondition(con, values) ? con.case1 : con.case2;;

				if (result == null) return '';
				if (typeof result === 'string') return result;
				return H.getProperty(values, result.value);
			},
			out: {
				isCondition: isCondition,
				parse: parseLinearCondition
			}
		}
	})(Helper, regexp);



	var Parser = {
		toFunction: function(template) {

			var arr = template.split('#{'),
				length = arr.length;

			for (var i = 1; i < length; i++) {
				var key = arr[i],
					index = key.indexOf('}');
				arr.splice(i, 0, key.substring(0, index));
				i++;
				length++;
				arr[i] = key.substring(index + 1);
			}

			template = null;
			return function(o) {
				return Helper.templateFunction(arr, o);
			}
		},
		parseAttributes: function(T, node) {

			var key, value, _classNames, quote;
			if (node.attr == null) node.attr = {};

			for (; T.index < T.length; T.index++) {
				key = null;
				value = null;
				var c = T.template.charCodeAt(T.index);
				switch (c) {
				case 32:
					//case 9: was replaced while compiling
					//case 10: 
					continue;

					//case '{;>':
				case 123:
				case 59:
				case 62:
					if (_classNames != null) {
						node.attr['class'] = _classNames.indexOf('#{') > -1 ? (T.serialize !== true ? this.toFunction(_classNames) : {
							template: _classNames
						}) : _classNames;

					}
					return;

				case 46:
					/* '.' */

					var start = T.index + 1;
					T.skipToAttributeBreak();

					value = T.template.substring(start, T.index);

					_classNames = _classNames != null ? _classNames + ' ' + value : value;
					T.index--;
					break;
				case 35:
					/* '#' */
					key = 'id';

					var start = T.index + 1;
					T.skipToAttributeBreak();
					value = T.template.substring(start, T.index);

					T.index--;
					break;
				default:
					key = T.sliceToChar('=');

					do(quote = T.template.charAt(++T.index))
					while (quote == ' ');

					T.index++;
					value = T.sliceToChar(quote);

					break;
				}

				if (key != null) {
					//console.log('key', key, value);
					if (value.indexOf('#{') > -1) {
						value = T.serialize !== true ? this.toFunction(value) : {
							template: value
						};
					}
					node.attr[key] = value;
				}
			}

		},
		/** @out : nodes */
		parse: function(T, nodes) {
			var current = T;
			for (; T.index < T.length; T.index++) {
				var c = T.template.charCodeAt(T.index);
				switch (c) {
				case 32:
					continue;
				case 39:
					/* ' */
				case 34:
					/* " */

					T.index++;

					var content = T.sliceToChar(c == 39 ? "'" : '"');
					if (content.indexOf('#{') > -1) content = T.serialize !== true ? this.toFunction(content) : {
						template: content
					};

					var t = {
						content: content
					}
					if (current.nodes == null) current.nodes = t;
					else if (current.nodes.push == null) current.nodes = [current.nodes, t];
					else current.nodes.push(t);
					//-current.nodes.push(t);

					if (current.__single) {
						if (current == null) continue;
						current = current.parent;
						while (current != null && current.__single != null) {
							current = current.parent;
						}
					}
					continue;
				case 62:
					/* '>' */
					current.__single = true;
					continue;
				case 123:
					/* '{' */

					continue;
				case 59:
					/* ';' */
				case 125:
					/* '}' */
					if (current == null) continue;

					do(current = current.parent)
					while (current != null && current.__single != null);

					continue;
				}



				var start = T.index;
				do(c = T.template.charCodeAt(++T.index))
				while (c !== 32 && c !== 35 && c !== 46 && c !== 59 && c !== 123 && c !== 62); /** while !: ' ', # , . , ; , { <*/


				var tagName = T.template.substring(start, T.index);

				if (tagName === '') {
					console.error('Parse Error: Undefined tag Name %d/%d %s', T.index, T.length, T.template.substring(T.index, T.index + 10));
				}

				var tag = {
					tagName: tagName,
					parent: current
				};

				if (current == null) {
					console.log('T', T, 'rest', T.template.substring(T.index));
				}

				if (current.nodes == null) current.nodes = tag;
				else if (current.nodes.push == null) current.nodes = [current.nodes, tag];
				else current.nodes.push(tag);
				//-if (current.nodes == null) current.nodes = [];
				//-current.nodes.push(tag);

				current = tag;

				this.parseAttributes(T, current);

				T.index--;
			}
			return T.nodes;
		},
		cleanObject: function(obj) {
			if (obj instanceof Array) {
				for (var i = 0; i < obj.length; i++) this.cleanObject(obj[i]);
				return obj;
			}
			delete obj.parent;
			delete obj.__single;

			if (obj.nodes != null) this.cleanObject(obj.nodes);

			return obj;
		}
	};

	var Builder = {
		buildDom: function(nodes, values, container, cntx) {
			if (nodes == null) return container;

			if (container == null) {
				container = d.createDocumentFragment();
			}
			if (cntx == null) {
				cntx = {
					//events: {}
				};
			}

			var isarray = nodes instanceof Array,
				length = isarray ? nodes.length : 1,
				node = null;

			for (var i = 0; node = isarray ? nodes[i] : nodes, isarray ? i < length : i < 1; i++) {

				if (CustomTags.all[node.tagName] != null) {

					var custom = new CustomTags.all[node.tagName](values);
					custom.compoName = node.tagName;
					custom.nodes = node.nodes;

					custom.attr = custom.attr == null ? node.attr : Helper.extend(custom.attr, node.attr);

					(cntx.components || (cntx.components = [])).push(custom);
					//cntx = custom;
					custom.parent = cntx;
					custom.render(values, container, custom);


					continue;
				}
				if (node.content != null) {
					container.appendChild(d.createTextNode(typeof node.content == 'function' ? node.content(values) : node.content));
					continue;
				}

				var tag = d.createElement(node.tagName);
				for (var key in node.attr) {
					var value = typeof node.attr[key] == 'function' ? node.attr[key](values) : node.attr[key];
					if (value) tag.setAttribute(key, value);
				}

				if (node.nodes != null) {
					this.buildDom(node.nodes, values, tag, cntx);
				}
				container.appendChild(tag);

			}
			return container;
		},
		//////////buildHtml: function(node, values, stream) {
		//////////
		//////////	if (stream == null) stream = [];
		//////////	if (node instanceof Array) {
		//////////		for (var i = 0, length = node.length; i < length; i++) this.buildHtml(node[i], values, stream);
		//////////		return stream;
		//////////	}
		//////////
		//////////	if (CustomTags.all[node.tagName] != null) {
		//////////		var custom = new CustomTags.all[node.tagName]();
		//////////		for (var key in node) custom[key] = node[key];
		//////////		custom.render(values, stream);
		//////////		return stream;
		//////////	}
		//////////	if (node.content != null) {
		//////////		stream.push(typeof node.content === 'function' ? node.content(values) : node.content);
		//////////		return stream;
		//////////	}
		//////////
		//////////	stream.push('<' + node.tagName);
		//////////	for (var key in node.attr) {
		//////////		var value = typeof node.attr[key] == 'function' ? node.attr[key](values) : node.attr[key];
		//////////		if (value) {
		//////////			stream.push(' ' + key + "='");
		//////////			stream.push(value);
		//////////			stream.push("'");
		//////////		}
		//////////	}
		//////////	if (singleTags[node.tagName] != null) {
		//////////		stream.push('/>');
		//////////		if (node.nodes != null) console.error('Html could be invalid: Single Tag Contains children:', node);
		//////////	} else {
		//////////		stream.push('>');
		//////////		if (node.nodes != null) {
		//////////			this.buildHtml(node.nodes, values, stream);
		//////////		}
		//////////		stream.push('</' + node.tagName + '>');
		//////////	}
		//////////	return stream;
		//////////},
		buildHtml: function(nodes, values, writer) {
			if (writer == null) {
				writer = {
					buffer: ''
				}
			}

			var isarray = nodes instanceof Array,
				length = isarray ? nodes.length : 1,
				node = null;

			for (var i = 0; node = isarray ? nodes[i] : nodes, isarray ? i < length : i < 1; i++) {

				if (CustomTags.all[node.tagName] != null) {
					var custom = new CustomTags.all[node.tagName]();
					for (var key in node) custom[key] = node[key];
					custom.render(values, writer);
					return writer;
				}
				if (node.content != null) {
					writer.buffer += typeof node.content === 'function' ? node.content(values) : node.content;
					return writer;
				}

				writer.buffer += '<' + node.tagName;
				for (var key in node.attr) {
					var value = typeof node.attr[key] == 'function' ? node.attr[key](values) : node.attr[key];
					if (value) {
						writer.buffer += ' ' + key + "='" + value + "'";
					}
				}
				if (singleTags[node.tagName] != null) {
					writer.buffer += '/>';
					if (node.nodes != null) console.error('Html could be invalid: Single Tag Contains children:', node);
				} else {
					writer.buffer += '>';
					if (node.nodes != null) {
						this.buildHtml(node.nodes, values, writer);
					}

					writer.buffer += '</' + node.tagName + '>';
				}
			}
			return writer;
		}
	}


	return {
		/**
		 * @see renderDom
		 * @description - normally you should use renderDom, as this function is slower
		 * @return html {string} 
		 */
		renderHtml: function(template, values) {
			if (typeof template === 'string') {
				template = this.compile(template);
			}
			return Builder.buildHtml(template, values).buffer //-join('');
		},

		/**
		 * @arg template - {template{string} | maskDOM{array}}
		 * @arg values - template values
		 * @arg container - optional, - place to renderDOM, @default - DocumentFragment
		 * @return container {@default DocumentFragment}
		 */
		renderDom: function(template, values, container, cntx) {
			//////try {
				if (typeof template === 'string') {
					template = this.compile(template);					
				}
				return Builder.buildDom(template, values, container, cntx);
			//////} catch (e) {
			//////	console.error('maskJS', e.message, template);
			//////}
			//////return null;
		},
		/**
		 *@arg template - string to be parsed into maskDOM
		 *@arg serializeDOM - build raw maskDOM json, without template functions - used for storing compiled template
		 *@return maskDOM
		 */
		compile: function(template, serializeOnly) {
			/** remove unimportant whitespaces */
			template = template.replace(/[\t\n\r]|[ ]{2,}/g, ' ');
			
			var T = new Template(template);
			if (serializeOnly == true) T.serialize = true;

			return Parser.parse(T, []);
		},
		registerHandler: function(tagName, TagHandler) {
			CustomTags.all[tagName] = TagHandler;
		},
		getHandler: function(tagName) {
			return CustomTags.all[tagName]
		},
		registerUtility: function(utilityName, fn) {
			ValueUtilities[utilityName] = fn;
		},
		serialize: function(template) {
			return Parser.cleanObject(this.compile(template, true));
		},
		deserialize: function(serialized) {
			if (serialized instanceof Array) {
				for (var i = 0; i < serialized.length; i++) {
					this.deserialize(serialized[i]);
				}
				return serialized;
			}
			if (serialized.content != null) {
				if (serialized.content.template != null) {
					serialized.content = Parser.toFunction(serialized.content.template);
				}
				return serialized;
			}
			if (serialized.attr != null) {
				for (var key in serialized.attr) {
					if (serialized.attr[key].template == null) continue;
					serialized.attr[key] = Parser.toFunction(serialized.attr[key].template);
				}
			}
			if (serialized.nodes != null) {
				this.deserialize(serialized.nodes);
			}
			return serialized;
		},
		ICustomTag: ICustomTag,
		ValueUtils: ValueUtilities
	}
})(window, document);



//});
;include.setCurrent({ id: 'lib.compo', namespace: 'lib.compo', url: '{url}'});
;include.js({
	lib: 'mask'
}).done(function() {

	var w = window,
		regexp = {
			trailingSpaces: /^\s+/
		},
		Helper = {
			resolveDom: function(compo, values) {
				if (compo.nodes != null) {
					if (compo.tagName != null) return compo;

					return mask.renderDom(compo.nodes, values);
				}
				if (compo.attr.template != null) {
					var e;
					if (compo.attr.template[0] === '#') {
						e = document.getElementById(compo.attr.template.substring(1));
						if (e == null) {
							console.error('Template Element not Found:', arg);
							return null;
						}
					}
					return mask.renderDom(e != null ? e.innerHTML : compo.attr.template, values);
				}
				return null;
			},
			ensureTemplate: function(compo) {
				if (compo.nodes != null) return;

				var template;
				if (compo.attr.template != null) {
					if (compo.attr.template[0] === '#') template = this.templateById(compo.attr.template.substring(1));
					else template = compo.attr.template;

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
			},
			templateById: function(id) {
				var e = document.getElementById(id);
				if (e == null) console.error('Template Element not Found:', id);
				else
				return e.innerHTML;
				return '';
			},
			containerArray: function() {
				var arr = [];
				arr.appendChild = function(child) {
					this.push(child);
				}
				return arr;
			},
			parseSelector: function(selector, type, direction) {
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

				if (direction == 'up') nextKey = 'parent';
				else nextKey = type == 'node' ? 'nodes' : 'components';

				return {
					key: key,
					prop: prop,
					selector: selector,
					nextKey: nextKey
				}
			}
		},
		/**
		 *   Component Events. Fires only once.
		 *   Used for component Initialization.
		 *   Supported events:
		 *       DOMInsert
		 *       +custom
		 *   UI-Eevent exchange must be made over DOMLibrary
		 */
		Shots = { /** from parent to childs */
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
				if (component.listeners == null) component.listeners = {};
				component.listeners[event] = fn;
			}
		},
		Events_ = {
			on: function(component, events) {
				var isarray = events instanceof Array,
					length = isarray ? events.length : 1,
					x = null;
				for (var i = 0; x = isarray ? events[i] : events, isarray ? i < length : i < 1; i++) {

					if (x instanceof Array) {
						component.$.on.apply(component.$, x);
						continue;
					}


					for (var key in x) {
						var fn = typeof x[key] === 'string' ? component[x[key]] : x[key],
							parts = key.split(':');

						component.$.on(parts[0] || 'click', parts.splice(1).join(':'), fn.bind(component));
					}

				}

			}
		};

	w.Compo = Class({
		/**
		 * @param - arg -
		 *      1. object - model object, receive from mask.renderDom
		 *      Custom Initialization:
		 *      2. String - template
		 * @param cntx
		 *      1. maskDOM context
		 */
		Construct: function(arg) {
			if (typeof arg === 'string') {
				var template = arg;
				if (template[0] == '#') template = Helper.templateById(template.substring(1));
				this.nodes = mask.compile(template);
			}

		},
		render: function(values, container, cntx) {
			this.create(values, cntx);

			if (container != null) {
				for (var i = 0; i < this.$.length; i++) container.appendChild(this.$[i]);
			}
			return this;
		},
		insert: function(parent) {
			for (var i = 0; i < this.$.length; i++) parent.appendChild(this.$[i]);

			Shots.emit(this, 'DOMInsert');
			return this;
		},
		append: function(template, values, selector) {
			if (this.$ == null) {
				var dom = typeof template == 'string' ? mask.compile(template) : template,
					parent = selector ? Compo.findNode(this, selector) : this;

				if (parent.nodes == null) this.nodes = dom;
				else if (parent.nodes instanceof Array) parent.nodes.push(dom);
				else parent.nodes = [this.nodes, dom];

				return this;
			}
			var array = mask.renderDom(template, values, Helper.containerArray(), this),
				parent = selector ? this.$.find(selector) : this.$;

			for (var i = 0; i < array.length; i++) parent.append(array[i]);

			Shots.emit(this, 'DOMInsert');
			return this;
		},
		create: function(values, cntx) {
			if (cntx == null) cntx = this;

			Helper.ensureTemplate(this);

			var elements = mask.renderDom(this.tagName == null ? this.nodes : this, values, Helper.containerArray(), cntx);
			this.$ = $(elements);

			if (this.events != null) {
				Events_.on(this, this.events);
			}
			if (this.compos != null) {
				for (var key in this.compos) {
					if (typeof this.compos[key] !== 'string') continue;
					var selector = this.compos[key],
						index = selector.indexOf(':'),
						engine = selector.substring(0, index);

					engine = Compo.config.selectors[engine];

					if (engine == null) {
						this.compos[key] = this.$.get(0).querySelector(selector);
						continue;
					}

					selector = selector.substring(++index).replace(regexp.trailingSpaces, '');
					this.compos[key] = engine(this, selector);

				}
			}

			return this;
		},
		on: function() {
			var x = Array.prototype.slice.call(arguments)
			switch (arguments.length) {
			case 1:
			case 2:
				x.unshift('click');
				break;

			}

			if (this.events == null) this.events = [x];
			else if (this.events instanceof Array) this.events.push(x)
			else this.events = [x, this.events];
			return this;
		},
		remove: function() {
			this.$ && this.$.remove();
			Compo.dispose(this);

			if (this.parent != null) {
				var i = this.parent.components.indexOf(compo);
				this.parent.components.splice(i, 1);
			}

			return this;
		},
		Static: {
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
					$ = lib;
				}
			},
			match: function(compo, selector, type) {
				if (typeof selector === 'string') {
					if (type == null) type = compo.compoName ? 'compo' : 'node';
					selector = Helper.parseSelector(selector, type, direction);
				}

				var obj = selector.prop ? compo[selector.prop] : compo;
				if (obj == null) return false;

				if (selector.selector.test != null) {
					if (selector.selector.test(obj[selector.key])) return true;
				} else {
					if (obj[selector.key] == selector.selector) return true;
				}
				return false;
			},
			find: function(compo, selector, direction, type) {
				if (compo == null) return null;

				if (typeof selector === 'string') {
					if (type == null) type = compo.compoName ? 'compo' : 'node';
					selector = Helper.parseSelector(selector, type, direction);

				}

				if (compo instanceof Array) {
					for (var i = 0, x, length = compo.length; x = compo[i], i < length; i++) {
						var r = Compo.find(x, selector);


						if (r != null) return r;
					}
					return null;
				}

				if (Compo.match(compo, selector) == true) return compo;

				return Compo.find(compo[selector.nextKey], selector);
			},
			findCompo: function(compo, selector, direction) {
				return Compo.find(compo, selector, direction, 'compo');

			},
			findNode: function(compo, selector, direction) {
				return Compo.find(compo, selector, direction, 'node');
			},
			dispose: function(compo) {
				compo.dispose && compo.dispose();
				if (this.components == null) return;
				for (var i = 0, x, length = compo.components.length; x = compo.components[i], i < length; i++) {
					Compo.dispose(x);
				}
			},
			events: Shots
		}
	});

	/** CompoUtils */
	var Traversing = {
		find: function(selector, type) {
			return Compo.find(this, selector, null, type || 'compo');
		},
		closest: function(selector, type) {
			return Compo.find(this, selector, 'up', type || 'compo');
		},
		all: function(selector, type) {
			var current = arguments[2] || this,
				arr = arguments[3] || []

				if (typeof selector === 'string') selector = Helper.parseSelector(selector, type);


			if (Compo.match(current, selector)) {
				arr.push(current);
			}

			var childs = current[selector.nextKey];

			if (childs != null) {
				for (var i = 0; i < childs.length; i++) {
					this.all(selector, null, childs[i], arr);
				}
			}

			return arr;
		}
	}

	var Manipulate = {
		addClass: function(_class) {
			this.attr.class = this.attr.class ? this.attr.class + ' ' + _class : _class;
		}
	}

	w.CompoUtils = Class({
		Extends: [Traversing, Manipulate]
	});

});
;include.setCurrent({ id: 'framework.dom/zepto', namespace: 'framework.dom/zepto', url: '{url}'});
;/* Zepto v1.0rc1 - polyfill zepto event detect fx ajax form touch - zeptojs.com/license */
;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError()
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
       accumulator = arguments[1]
      else
        do{
          if(k in t){
            accumulator = t[k++]
            break
          }
          if(++k >= len) throw new TypeError()
        } while (true)

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()
var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,

    // Used by `$.zepto.init` to wrap elements, text/comment nodes, document,
    // and document fragment node types.
    elementTypes = [1, 3, 8, 9, 11],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]+)$/,
    tagSelectorRE = /^[\w-]+$/,
    toString = ({}).toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div')

  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function isFunction(value) { return toString.call(value) == "[object Function]" }
  function isObject(value) { return value instanceof Object }
  function isPlainObject(value) {
    var key, ctor
    if (toString.call(value) !== "[object Object]") return false
    ctor = (isFunction(value.constructor) && value.constructor.prototype)
    if (!ctor || !hasOwnProperty.call(ctor, 'isPrototypeOf')) return false
    for (key in value);
    return key === undefined || hasOwnProperty.call(value, key)
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return array.filter(function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name) {
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    if (!(name in containers)) name = '*'
    var container = containers[name]
    container.innerHTML = '' + html
    return $.each(slice.call(container.childNodes), function(){
      container.removeChild(this)
    })
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = arguments.callee.prototype
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, juts return it
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // if a JavaScript object is given, return a copy of it
      // this is a somewhat peculiar option, but supported by
      // jQuery so we'll do it, too
      else if (isPlainObject(selector))
        dom = [$.extend({}, selector)], selector = null
      // wrap stuff like `document` or `window`
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
      // create a new Zepto collection from the nodes found
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, whichs makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    slice.call(arguments, 1).forEach(function(source) {
      for (key in source)
        if (source[key] !== undefined)
          target[key] = source[key]
    })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found
    return (element === document && idSelectorRE.test(selector)) ?
      ( (found = element.getElementById(RegExp.$1)) ? [found] : emptyArray ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? emptyArray :
      slice.call(
        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
        element.querySelectorAll(selector)
      )
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }

  function funcArg(context, arg, idx, payload) {
   return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  $.isFunction = isFunction
  $.isObject = isObject
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.trim = function(str) { return str.trim() }

  // plugin compatibility
  $.uuid = 0

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $.map(this, function(el, i){ return fn.call(el, i, el) })
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      this.forEach(function(el, idx){ callback.call(el, idx, el) })
      return this
    },
    filter: function(selector){
      return $([].filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result
      if (this.length == 1) result = zepto.qsa(this[0], selector)
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return $(result)
    },
    closest: function(selector, context){
      var node = this[0]
      while (node && !zepto.matches(node, selector))
        node = node !== context && node !== document && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return slice.call(this.children) }), selector)
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return slice.call(el.parentNode.children).filter(function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return this.map(function(){ return this[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = null)
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(newContent){
      return this.each(function(){
        $(this).wrapAll($(newContent)[0].cloneNode(false))
      })
    },
    wrapAll: function(newContent){
      if (this[0]) {
        $(this[0]).before(newContent = $(newContent))
        newContent.append(this)
      }
      return this
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return $(this.map(function(){ return this.cloneNode(true) }))
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return (setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide()
    },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) this.setAttribute(key, name[key])
          else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ if (this.nodeType === 1) this.removeAttribute(name) })
    },
    prop: function(name, value){
      return (value === undefined) ?
        (this[0] ? this[0][name] : undefined) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? data : undefined
    },
    val: function(value){
      return (value === undefined) ?
        (this.length > 0 ? this[0].value : undefined) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(){
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: obj.width,
        height: obj.height
      }
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string')
        return (
          this.length == 0
            ? undefined
            : this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

      var css = ''
      for (key in property)
        if(typeof property[key] == 'string' && property[key] == '')
          this.each(function(){ this.style.removeProperty(dasherize(key)) })
        else
          css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'

      if (typeof property == 'string')
        if (value == '')
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (this.length < 1) return false
      else return classRE(name).test(this[0].className)
    },
    addClass: function(name){
      return this.each(function(idx){
        classList = []
        var cls = this.className, newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined)
          return this.className = ''
        classList = this.className
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        this.className = classList.trim()
      })
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
        var newName = funcArg(this, name, idx, this.className)
        ;(when === undefined ? !$(this).hasClass(newName) : when) ?
          $(this).addClass(newName) : $(this).removeClass(newName)
      })
    }
  }

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    $.fn[dimension] = function(value){
      var offset, Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
      if (value === undefined) return this[0] == window ? window['inner' + Dimension] :
        this[0] == document ? document.documentElement['offset' + Dimension] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        var el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function insert(operator, target, node) {
    var parent = (operator % 2) ? target : target.parentNode
    parent ? parent.insertBefore(node,
      !operator ? target.nextSibling :      // after
      operator == 1 ? parent.firstChild :   // prepend
      operator == 2 ? target :              // before
      null) :                               // append
      $(node).remove()
  }

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(key, operator) {
    $.fn[key] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var nodes = $.map(arguments, function(n){ return isObject(n) ? n : zepto.fragment(n) })
      if (nodes.length < 1) return this
      var size = this.length, copyByClone = size > 1, inReverse = operator < 2

      return this.each(function(index, target){
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[inReverse ? nodes.length-i-1 : i]
          traverseNode(node, function(node){
            if (node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT' && (!node.type || node.type === 'text/javascript'))
              window['eval'].call(window, node.innerHTML)
          })
          if (copyByClone && index < size - 1) node = node.cloneNode(true)
          insert(operator, target, node)
        }
      })
    }

    $.fn[(operator % 2) ? key+'To' : 'insert'+(operator ? 'Before' : 'After')] = function(html){
      $(html)[key](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.camelize = camelize
  zepto.uniq = uniq
  $.zepto = zepto

  return $
})()

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto
'$' in window || (window.$ = Zepto)
;(function($){
  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={}

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eachEvent(events, fn, iterator){
    if ($.isObject(events)) $.each(events, iterator)
    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
  }

  function add(element, events, fn, selector, getDelegate, capture){
    capture = !!capture
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    eachEvent(events, fn, function(event, fn){
      var delegate = getDelegate && getDelegate(fn, event),
        callback = delegate || fn
      var proxyfn = function (event) {
        var result = callback.apply(element, [event].concat(event.data))
        if (result === false) event.preventDefault()
        return result
      }
      var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length})
      set.push(handler)
      element.addEventListener(handler.e, proxyfn, capture)
    })
  }
  function remove(element, events, fn, selector){
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
        element.removeEventListener(handler.e, handler.proxy, false)
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback)
    })
  }
  $.fn.one = function(event, callback){
    return this.each(function(i, element){
      add(this, event, callback, null, function(fn, type){
        return function(){
          var result = fn.apply(element, arguments)
          remove(element, type, fn)
          return result
        }
      })
    })
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event)
    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue
        return event[name].apply(event, arguments)
      }
      proxy[predicate] = returnFalse
    })
    return proxy
  }

  // emulates the 'defaultPrevented' property for browsers that have none
  function fix(event) {
    if (!('defaultPrevented' in event)) {
      event.defaultPrevented = false
      var prevent = event.preventDefault
      event.preventDefault = function() {
        this.defaultPrevented = true
        prevent.call(this)
      }
    }
  }

  $.fn.delegate = function(selector, event, callback){
    var capture = false
    if(event == 'blur' || event == 'focus'){
      if($.iswebkit)
        event = event == 'blur' ? 'focusout' : event == 'focus' ? 'focusin' : event
      else
        capture = true
    }

    return this.each(function(i, element){
      add(element, event, callback, selector, function(fn){
        return function(e){
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match) {
            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
          }
        }
      }, capture)
    })
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.bind(event, selector) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.unbind(event, selector) : this.undelegate(selector, event, callback)
  }

  $.fn.trigger = function(event, data){
    if (typeof event == 'string') event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function(){
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback){ return this.bind(event, callback) }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else if (this.length) try { this.get(0)[name]() } catch(e){}
      return this
    }
  })

  $.Event = function(type, props) {
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    return event
  }

})(Zepto)
;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/)

    // todo clean this up with a better OS/browser
    // separation. we need to discern between multiple
    // browsers on android, and decide if kindle fire in
    // silk mode is android or not

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)
;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    clearProperties = {}

  function downcase(str) { return str.toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + downcase(vendor) + '-'
      eventPrefix = event
      return false
    }
  })

  clearProperties[prefix + 'transition-property'] =
  clearProperties[prefix + 'transition-duration'] =
  clearProperties[prefix + 'transition-timing-function'] =
  clearProperties[prefix + 'animation-name'] =
  clearProperties[prefix + 'animation-duration'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback){
    if ($.isObject(duration))
      ease = duration.easing, callback = duration.complete, duration = duration.duration
    if (duration) duration = duration / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback){
    var transforms, cssProperties = {}, key, that = this, wrappedCallback, endEvent = $.fx.transitionEnd
    if (duration === undefined) duration = 0.4
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssProperties[prefix + 'animation-name'] = properties
      cssProperties[prefix + 'animation-duration'] = duration + 's'
      endEvent = $.fx.animationEnd
    } else {
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) {
          transforms || (transforms = [])
          transforms.push(key + '(' + properties[key] + ')')
        }
        else cssProperties[key] = properties[key]

      if (transforms) cssProperties[prefix + 'transform'] = transforms.join(' ')
      if (!$.fx.off && typeof properties === 'object') {
        cssProperties[prefix + 'transition-property'] = Object.keys(properties).join(', ')
        cssProperties[prefix + 'transition-duration'] = duration + 's'
        cssProperties[prefix + 'transition-timing-function'] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, arguments.callee)
      }
      $(this).css(clearProperties)
      callback && callback.call(this)
    }
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    setTimeout(function() {
      that.css(cssProperties)
      if (duration <= 0) setTimeout(function() {
        that.each(function(){ wrappedCallback.call(this) })
      }, 0)
    }, 0)

    return this
  }

  testEl = null
})(Zepto)
;(function($){
  var jsonpID = 0,
      isObject = $.isObject,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.defaultPrevented
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options){
    var callbackName = 'jsonp' + (++jsonpID),
      script = document.createElement('script'),
      abort = function(){
        $(script).remove()
        if (callbackName in window) window[callbackName] = empty
        ajaxComplete('abort', xhr, options)
      },
      xhr = { abort: abort }, abortTimeout

    if (options.error) script.onerror = function() {
      xhr.abort()
      options.error()
    }

    window[callbackName] = function(data){
      clearTimeout(abortTimeout)
      $(script).remove()
      delete window[callbackName]
      ajaxSuccess(data, xhr, options)
    }

    serializeData(options)
    script.src = options.url.replace(/=\?/, '=' + callbackName)
    $('head').append(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.abort()
        ajaxComplete('timeout', xhr, options)
      }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0
  }

  function mimeToDataType(mime) {
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (isObject(options.data)) options.data = $.param(options.data)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {})
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
      return $.ajaxJSONP(settings)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = $.ajaxSettings.xhr(), abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(null, 'error', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  $.get = function(url, success){ return $.ajax({ url: url, success: success }) }

  $.post = function(url, data, success, dataType){
    if ($.isFunction(data)) dataType = dataType || success, success = data, data = null
    return $.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType })
  }

  $.getJSON = function(url, success){
    return $.ajax({ url: url, success: success, dataType: 'json' })
  }

  $.fn.load = function(url, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector
    if (parts.length > 1) url = parts[0], selector = parts[1]
    $.get(url, function(response){
      self.html(selector ?
        $(document.createElement('div')).html(response.replace(rscript, "")).find(selector).html()
        : response)
      success && success.call(self)
    })
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var array = $.isArray(obj)
    $.each(obj, function(key, value) {
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (traditional ? $.isArray(value) : isObject(value))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace('%20', '+')
  }
})(Zepto)
;(function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)
;(function($){
  var touch = {}, touchTimeout

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2){
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  var longTapDelay = 750, longTapTimeout

  function longTap(){
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap(){
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  $(document).ready(function(){
    var now, delta

    $(document.body).bind('touchstart', function(e){
      now = Date.now()
      delta = now - (touch.last || now)
      touch.el = $(parentIfText(e.touches[0].target))
      touchTimeout && clearTimeout(touchTimeout)
      touch.x1 = e.touches[0].pageX
      touch.y1 = e.touches[0].pageY
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true
      touch.last = now
      longTapTimeout = setTimeout(longTap, longTapDelay)
    }).bind('touchmove', function(e){
      cancelLongTap()
      touch.x2 = e.touches[0].pageX
      touch.y2 = e.touches[0].pageY
    }).bind('touchend', function(e){
       cancelLongTap()

      // double tap (tapped twice within 250ms)
      if (touch.isDoubleTap) {
        touch.el.trigger('doubleTap')
        touch = {}

      // swipe
      } else if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                 (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {
        touch.el.trigger('swipe') &&
          touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
        touch = {}

      // normal tap
      } else if ('last' in touch) {
        touch.el.trigger('tap')

        touchTimeout = setTimeout(function(){
          touchTimeout = null
          touch.el.trigger('singleTap')
          touch = {}
        }, 250)
      }
    }).bind('touchcancel', function(){
      if (touchTimeout) clearTimeout(touchTimeout)
      if (longTapTimeout) clearTimeout(longTapTimeout)
      longTapTimeout = touchTimeout = null
      touch = {}
    })
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto)

;include.setCurrent({ id: '/script/main.js', namespace: '', url: '{url}'});
;include.js({
	lib: 'compo',
	framework: 'dom/zepto'
}).ready(function(){
	
	new Compo('#layout').render().insert(document.body);
	
});