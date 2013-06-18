

String.prototype.format = function(){
	var fn = String.format;
	switch (arguments.length) {
		case 1:
			return fn(this, arguments[0]);
		case 2:
			return fn(this, arguments[0], arguments[1]);
		case 3:
			return fn(this, arguments[0], arguments[1], arguments[2]);
		case 4:
			return fn(this, arguments[0], arguments[1], arguments[2], arguments[3]);
		default:
			var args = Array.prototype.slice.call(arguments);
			args.unshift(this);
			return fn.apply(null, args);
	}
};