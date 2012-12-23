
(function(resp) {

	var fs = require('fs'),
		_watchers = {};

	io.File.watcher = {
		
        watch: function(file, callback) {
            if (file == null || file.uri == null){
                console.error('File is undefined', file);
            }
            
            var path = file.uri.toLocalFile();
            
            if (_watchers[path]){                
                return;
            }
            
			_watchers[path] = new FileWatcher(file, callback);
		},
        unwatch: function(path){
            var watcher = _watchers[path];
            
            if (watcher){
                watcher.close();                
            }else{
                console.warn('Watcher not found:', path);
            }
            
            delete  _watchers[path];            
        }
        
	}


	var FileWatcher = Class({
		Construct: function(file, callback) {
            
            if (file == null || file.uri == null){
                console.error('File is undefined', file);
            }
            
            this.listeners = [callback];            
            this.path = file.uri.toLocalFile();
            this.fswatcher = fs.watch(this.path, this.changed.bind(this));
            this.trigger = this.trigger.bind(this);            
        },
        changed: function(){
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            
            this.timeout = setTimeout(this.trigger, 100);
        },
        trigger: function(){
            for(var i = 0, x, length = this.listeners.length; i<length; i++){
				x = this.listeners[i];
				x(this.path);
			}
        },
        bind: function(callback){
            this.listeners.push(callback);
        },
        close: function(){
            this.fswatcher.close();
            this.listeners = [];
        }
	});
    

}());