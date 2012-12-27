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
                
                if (typeof file.content == 'object'){
                    file.content = file.content.toString();
                }
                
				this.handler(file);
			}
		});


	io.File.registerHookHandler({
		register: function(regexp, name, handler) {
			_hooks.push(new Hook(regexp, name, handler));
            return this;
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