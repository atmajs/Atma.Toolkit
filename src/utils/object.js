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