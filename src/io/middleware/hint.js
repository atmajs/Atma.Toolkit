include.js({
    script: 'helper/stdout::stdout'
}).done(function(resp) {
    
    if (!global.config.jshint) {
        return;
    }
    
    

    var jshint = require('jshint').JSHINT,
        config = global.config.jshint,
        globals = config.globals,
        options = config.options,
        ignore = config.ignore,
        
        color = resp.stdout.color;
        
    
	include.exports = function(file) {
        
            /**
             *  DO not apply jshint on minimized scripts
             */
            if (file.uri.file.indexOf('.min.') > -1){
                return;
            }
            
            if (ignore && ignore.hasOwnProperty(file.uri.file)){
                return;
            }
			
            
			
            var start = Date.now(),
                result = jshint(file.content, options, globals);
            
            
            console.log('JSHINT...[%sms] %s', Date.now() - start, file.uri.file, result ? color('green{Success}') : color('red{'+jshint.errors.length+'}'));
                
            if (!result){
                jshint.errors.forEach(function(e) {
                    if (!e){
                        return;
                    }
                    var evidence = e.evidence,
                        character = e.character,
                        pos;
                  
                    if (evidence){
                            
                            var msg = String.format(color('[yellow{%1}:yellow{%2}] bold{%3}'),
                                'L' + e.line,
                                'C' + character,
                                e.reason);
                            
                            
                            console.log(msg);
                    }else{
                        console.log(e.reason);
                    }
                });
            }			
	};
});
