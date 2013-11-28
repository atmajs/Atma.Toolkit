var resource = include;

var Worker = Class({
    Extends: Class.Deferred,
    Construct: function(name) {

        this.name = name;
    },

    process: function(app) {
        
        if (app.config == null) 
            app.config = {};
        
        app.config.extend = cfg_extendDelegate(app.config);
    
        var self = this;

        resource
            .js('/src/config/' + this.name + '.js::Cfg')
            .done(function(resp) {
                
                if (typeof resp.Cfg !== 'function') {
                    logger.error('%s does not export worker function', self.name, resp.Cfg);
                }
                    
                resp.Cfg(app, function(obj) {
                    
                    cfgObj_extend(app.config, obj);
                    self.resolve();
                }); 
            });
            
        return self;
    }
});


function cfg_extendDelegate(config) {
    return function(object){
        cfg_extend(config, object);  
    };
}

function cfg_extend(config, object) {
    /*
     *	Actions = {action: String (path to handler)}
     */
    if ('actions' in object) {
    
        Object.extend(config.actions, object.actions);
        
    }
    
    /**
     *	Server = {
     *		controllers: Array[String (path to handler or Handler Constructor)]
     *		websockets: {
     *			namespace: String (path to Constructor(socket, io))
     *		}
     *	}
     */
    if ('server' in object) {
        var server = config.server || (config.server = {}),
            serverEx = object.server,
            
            handlers = serverEx['handlers'],
            websockets = serverEx['websockets'],
            subapps = serverEx['subapps']
            ;
            
        
        
        handlers &&
            (server.handlers = Object.extend(server.handlers, handlers))
            ;
            
        websockets &&
            (server.websockets = Object.extend(server.websockets, websockets))
            ;
            
        subapps &&
            (server.subapps = Object.extend(server.subapps, subapps))
            ;
        
    }
}


var CollectionWorker = Class.Collection(Worker, {
    Extends: Class.Deferred,
    Self: {
        process: function(app){
            
            var self = this,
                worker = self.shift();
                
            if (worker == null){
                self.resolve();
                return this;
            }
            
            worker
                .process(app)
                .done(function(){
                    self.process(app);
                });
                
            return this;
        }
    }
});

module.exports = new CollectionWorker;






/*
 *       UTILS
*/





function cfgObj_extend(target, source) {


    for (var key in source) {
        if (target[key] != null && typeof target[key] === 'object') {
            
            cfgObj_extend(target[key], source[key]);
            continue;
        }
        
        target[key] = source[key];
    }
}