(function() {
    
    var  _handlers = [];
    
	io.File.registerFactory({
		registerHandler: function(regexp, handler) {
			_handlers.push({
				handler: handler,
				regexp: regexp
			});
		},
		resolveHandler: function(uri) {
			var str = uri.toString();


			var handler = ruqq.arr.first(_handlers, function(item) {
				var isarray = item.regexp instanceof Array,
					length = isarray ? item.regexp.length : 1,
					x = null;

				for (var i = 0; isarray ? i < length : i < 1; i++) {
                    x = isarray ? item.regexp[i] : item.regexp
					if (x.test(str)) {
                        return true;
                    }
				}
				return false;
			});
			return (handler && handler.handler) || null;
		}
	});

}());