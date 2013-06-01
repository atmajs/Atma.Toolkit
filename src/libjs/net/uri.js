
(function(global) {
    'use strict';
	
	var rgx_protocol = /^([a-zA-Z]+):\/\//,
		rgx_fileWithExt = /([^\/]+(\.[\w\d]+)?)$/i,
		rgx_extension = /\.[\w\d]+$/i,
		rgx_win32Drive = /(^\/?\w+:)\/[^\/]/
		
		;

	function util_isUri(object) {
		return object && typeof object === 'object' && typeof object.combine === 'function';
	}
	
	function util_combinePathes(/*args*/) {
		var args = arguments,
			str = '';
		for (var i = 0, x, imax = arguments.length; i < imax; i++){
			x = arguments[i];
			if (!x) 
				continue;
		
			if (!str) {
				str = x;
				continue;
			}
			
			if (str[str.length - 1] !== '/') 
				str += '/';
			
			str += x[0] === '/' ? x.substring(1) : x;
		}
		return str;
	}
	
	function normalize_pathsSlashes(str) {
		
		if (str[str.length - 1] === '/') {
			return str.substring(0, str.length - 1);
		}
		return str;
	}
	
	function util_clone(source) {
		var uri = new URI(),
			key;
		for (key in source) {
			if (typeof source[key] === 'string') {
				uri[key] = source[key];
			}
		}
		return uri;
	}
	
	function normalize_uri(str) {
		 return str
					.replace(/\\/g,'/')
					.replace(/^\.\//,'')
                    
                    // win32 drive path
                    .replace(/^(\w+):\/([^\/])/, '/$1:/$2') 
					
					;
	}
	
	function util_win32Path(path) {
		if (rgx_win32Drive.test(path) && path[0] === '/') {
			return path.substring(1);
		}
		return path;
	}
	
	function parse_protocol(obj) {
		var match = rgx_protocol.exec(obj.value); 

        if (match == null && obj.value[0] === '/'){
            obj.protocol = 'file';
        }

		if (match == null) 
			return;
		
		
		obj.protocol = match[1];
		obj.value = obj.value.substring(match[0].length);
	}
	
	function parse_host(obj) {
		if (obj.protocol == null)
			return;
		
		if (obj.protocol === 'file') {
			var match = rgx_win32Drive.exec(obj.value);
			if (match) {
				obj.host = match[1];
				obj.value = obj.value.substring(obj.host.length);
			}
			return;
		}
		  
		var pathStart = obj.value.indexOf('/', 2);
		
		obj.host = ~pathStart
				? obj.value.substring(0, pathStart)
				: obj.value;
				
		
		obj.value = obj.value.replace(obj.host,'');
	}
	
	function parse_search(obj) {
		var question = obj.value.indexOf('?');
		if (question === -1)
			return;
		
		obj.search = obj.value.substring(question);
		obj.value = obj.value.substring(0, question);
	}
	
	function parse_file(obj) {
		var match = rgx_fileWithExt.exec(obj.value),
			file = match == null ? null : match[1];
		
		
		if (file == null) 
			return
		
		
		obj.file = file;
		obj.value = obj.value.replace(file, '');
		obj.value = normalize_pathsSlashes(obj.value);
		
		
		match = rgx_extension.exec(file);
		
		
		obj.extension = match == null ? null : match[0];
	
	}
	



    var URI = function(uri) {
        if (uri == null) 
            return this;
        
        if (util_isUri(uri)) 
            return uri.combine('');
        

        uri = normalize_uri(uri);
		

        this.value = uri;
		
        parse_protocol(this);
        parse_host(this);

        parse_search(this);
        parse_file(this);

		
        // normilize path - "/some/path"
        this.path = normalize_pathsSlashes(this.value);

        if (/^[\w]+:\//.test(this.path)){
            this.path = '/' + this.path;
        }

        return this;
    }
 

    URI.prototype = {
        cdUp: function() {
			if (!this.path)
				return this;
			
			if (this.path === '/')
				return this;
			
			// win32 - is base drive
            if (/^\/?[a-zA-Z]+:\/?$/.test(this.path)) 
                return this;
            
			
            this.path = this.path.replace(/\/?[^\/]+\/?$/i, '');
            return this;
        },
        /**
         * '/path' - relative to host
         * '../path', 'path','./path' - relative to current path
         */
        combine: function(path) {
			
			if (util_isUri(path)) 
				path = path.toString();
			
			
			if (!path) 
				return util_clone(this);
			
			if (rgx_win32Drive.test(path)) {
				return new URI(path);
			}
			
            var uri = util_clone(this);
			
            uri.value = path;
			
            parse_search(uri);
            parse_file(uri);
			
			if (!uri.value) 
				return uri;
			

            
			path = uri.value.replace(/^\.\//i, '');

			if (path[0] === '/') {
				uri.path = path;
				return uri;
			}
			
			
			
			while (/^(\.\.\/?)/ig.test(path)) {
				uri.cdUp();
				path = path.substring(3);
			}

			uri.path = normalize_pathsSlashes(util_combinePathes(uri.path, path));
		
            return uri;
        },
        toString: function() {

            var str = this.protocol ? this.protocol + '://' : '';
            
            return str + util_combinePathes(this.host, this.path, this.file) + (this.search || '');
        },
        toPathAndQuery: function(){
            return util_combinePathes(this.path, this.file) + (this.search || '');
        },
        /**
         * @return Current URI Path{String} that is relative to @arg1 URI
         */
        toRelativeString: function(uri) {
            if (typeof uri === 'string') 
                uri = new URI(uri);
            
            //if (uri.protocol !== this.protocol || uri.host !== this.host) 
            //    return this.toString();
            

            if (this.path.indexOf(uri.path) === 0) {
				// host folder 
                var p = this.path ? this.path.replace(uri.path, '') : '';
                if (p[0] === '/') 
                    p = p.substring(1);
                
				
                return util_combinePathes(p, this.file) + (this.search || '');
            }

            // sub folder 
            var current = this.path.split('/'),
				relative = uri.path.split('/'),
            	commonpath = '',
            	i = 0,
                length = Math.min(current.length, relative.length);
				
            for (; i < length; i++) {
                if (current[i] === relative[i]) 
                    continue;
                
                break;
            }
			
            if (i > 0) 
                commonpath = current.splice(0, i).join('/');
            
            if (commonpath) {
                var sub = '',
                    path = uri.path,
                    forward;
                while (path) {
                    if (this.path.indexOf(path) == 0) {
                        forward = this.path.replace(path, '');
                        break;
                    }
                    path = path.replace(/\/?[^\/]+\/?$/i, '');
                    sub += '../';
                }
                return util_combinePathes(sub, forward, this.file);
            }


            return this.toString();
        },

        toLocalFile: function() {
			var path = util_combinePathes(this.host, this.path, this.file);
            
			return util_win32Path(path);
        },
        toLocalDir: function() {
            var path = util_combinePathes(this.host, this.path, '/');
			
			return util_win32Path(path);
        },
        toDir: function(){
            var str = this.toString();

            return this.file ? str.substring(0, str.lastIndexOf('/') + 1) : str;
        },
        isRelative: function() {
            return !(this.host || this.path[0] === '/');
        },
        getName: function(){
            return this.file.replace('.' + this.extension,'');
        }
    }

    URI.combinePathes = util_combinePathes;
	URI.combine = util_combinePathes;


    if (global.net == null) {
        global.net = {};
    }

    global.net.URI = URI;


}(typeof window === 'undefined' ? global : window));
