function obj_each(object, fn, cntx) {
	for (var key in object) {
		fn.call(cntx, key, object[key]);
	}
}


function obj_extend(target) {
	if (target == null) 
		target = {};
		
		
	for (var i = 1, x, imax = arguments.length; i < imax; i++){
		x = arguments[i];
		
		if (x == null || typeof x !== 'object') {
			continue;
		}
		
		for (var key in x) {
			
			if (x[key] == null)
				continue;
			
			target[key] = x[key];
		}
	}
	
	return target;
}

function obj_deepExtend(target, source){
		
	if (source == null) 
		return target;
	
	if (Array.isArray(target) && Array.isArray(source)) {
		for (var i = 0, x, imax = source.length; i < imax; i++){
			x = source[i];
			if (target.indexOf(x) === -1) {
				target.push(x);
			}
		}
		return target;
	}
	
	if (typeof source !== 'object' && typeof target !== 'object') {
		logger.log('<cfg extend> not an object or type missmatch');
		return target;
	}
	
	var key, val;
	for(key in source){
		val = source[key];
		
		if (target[key] == null) {
			target[key] = val;
			continue;
		}
		
		if (Array.isArray(val)) {
			if (Array.isArray(target[key]) === false) {
				logger.log('<cfg extend> type missmatch', key, val, target[key]);
				
				target[key] = val;
				continue;
			}
			obj_deepExtend(target[key], val);
			continue;
		}
		
		if (typeof val === 'object' && typeof target[key] === 'object') {
			target[key] = obj_deepExtend(target[key], val);
			continue;
		}
		
		target[key] = val;
	}
	
	return target;
}

function obj_defaults(target) {
	
	if (target == null)
		target = {};
	
	for (var i = 1, x, imax = arguments.length; i < imax; i++){
		x = arguments[i];
		
		if (x == null || typeof x !== 'object') {
			continue;
		}
		
		for (var key in x) {
			
			if (target[key] != null)
				continue;
			
			if (x[key] == null)
				continue;
			
			target[key] = x[key];
		}
	}
	
	return target;
}