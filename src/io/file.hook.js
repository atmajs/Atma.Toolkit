(function() {
	var _hooks = [],
		Hook = Class({
			Construct: function(regexp, name, handler) {
				this.regexp = regexp;
				this.name = name;
				this.handler = handler;
			},
			run: function(functionName, file) {
				if (functionName != this.name) {
					return;
				}
				if (this.regexp.test(file.uri.toString()) === false) {
					return;
				}

				this.handler(file);
			}
		});


	io.File.registerHookHandler({
		register: function(regexp, name, handler) {
            if (this.contains(name, handler) === false){
                _hooks.push(new Hook(regexp, name, handler));
            }
            return this;
		},
        contains: function(name, handler){
            return ruqq.arr.first(_hooks, function(hook){
                return hook.name === name && hook.handler === handler;
            }) != null;
        },
        unregister: function(name, handler){
            ruqq.arr.remove(_hooks, function(hook){
                return hook.name === name && hook.handler === handler;
            });
        },
		trigger: function(funcName, file) {
			_hooks.forEach(function(x) {
				x.run(funcName, file);
			});
            return this;
		},
        clear: function(){
            _hooks = [];
            return this;
        }
	});
}());
