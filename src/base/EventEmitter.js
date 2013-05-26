(function(){
 
 
    var Emitter = Class({
        Construct: function(){
            this.listeners = {};
        },
        on: function(event, callback) {
            (this.listeners[event] || (this.listeners[event] = [])).push(callback);
            return this;
        },
        once: function(event, callback){
            callback.once = true;
            (this.listeners[event] || (this.listeners[event] = [])).push(callback);
            return this;
        },
		
		pipe: function(event){
			var that = this,
				slice = Array.prototype.slice, 
				args;
			return function(){
				Log('EventEmitter:pipe', event, 95);
				
				args = slice.call(arguments);
				args.unshift(event);
				that.trigger.apply(that, args);
			};
		},
        
        trigger: function() {
            var args = Array.prototype.slice.call(arguments),
                event = args.shift(),
                fns = this.listeners[event],
                fn, length, i = 0;
                
            if (fns != null) {
                for (length = fns.length; i < length; i++) {
                    fn = fns[i];
                    fn.apply(null, args);
                    if (fn.once === true){
                        fns.splice(i,1);
                        i--;
                        length--;
                    }
                }
            }
            return this;
        },
        off: function(event, callback) {
            if (event in this.listeners) {
				
				var arr = this.listeners[event];
				
                for (var item, i = 0, length = arr.length; i < length; i++) {
                    item = arr[i];
                    
                    if (item == callback) {
                        arr.splice(i, 1);
                    };
                    i--;
					length--;
                }
            }
            return this;
        }
    });
    
    include.exports = Emitter;
    
}());
