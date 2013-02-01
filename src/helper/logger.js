(function(global){


    var _currentLevel = 1,
        _log = console.log,
        _output;




    console.log = function(){
        if (arguments.length > 0){
            arguments[0] = '  ' + arguments[0];
        }

        _log.apply(console, arguments);
    }
    console.warn = function(){
        var args = Array.prototype.slice.call(arguments);
        args.unshift('  \u001b[33m');
        args.push('\u001b[0m');

        _log.apply(console, args);
    }

    console.error = function(){
        var args = Array.prototype.slice.call(arguments);
        args.unshift('  \u001b[1m\u001b[31m');
        args.push('\u001b[0m');

        _log.apply(console, args);
    }


    function log(){
        var args = Array.prototype.slice.call(arguments),
            type = args.shift(),
            level = ruqq.arr.last(args);

        if (typeof level === 'number'){
            args.splice(args.length - 1);
        }else{
            level = 1;
        }

        if (level > _currentLevel){
            return;
        }

        if (type in console === false){
            type = 'log';
        }

        console[type].apply(console, args);
    }

    var Log = log.bind(this, 'log');
    Log.warn = log.bind(this, 'warn');
    Log.error = log.bind(this, 'error');

    global.Log = Log;


    (function(){

        var args = require('commander').rawArgs;


        for(var i = 0, x, length = args.length; i < length; i++){
			x = args[i];
            if (x == '-o'){
                _output = args[i+1];
                args.splice(i,2);
                i-=2;
                length -=2;
                continue;
            }
            if (x == '-level'){
                _currentLevel = args[i+1] << 0;
                args.splice(i,2);
                i-=2;
                length -=2;
                continue;
            }
		}


    }());


}(global));
