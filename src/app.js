

var Configs = require('./config/WorkerCollection.js')
	;
    
include
    .cfg({
		path: io.env.applicationDir.toString() + '/',
		loader: {
			coffee: '/node_modules/atma-libs/include/loader/coffee/loader.js'
		}
	})

var Application = Class({
    Extends: [Class.EventEmitter, Class.Deferred],
    
    config: null,
    settings: null,
    
    Construct: function(){
        
        global.app = this;
        
        
        Configs
            .push('cli')
            .push('actions')
            .push('globals')
            .push('environment')
            .push('tasks')
            
            .process(app)
            .done(function(){
                
                if (app.config.cli.params.help) {
                    app.run({action: 'help'});
                    return;
                }
                
                app.resolve(app);
            });
        
    },
    
    run: function(taskConfigs){
        
        app.worker = new Class.Deferred();
        app.errors = [];
        
        if (taskConfigs != null) {
            if (Array.isArray(taskConfigs) === false) {
                taskConfigs = [taskConfigs];
            }
            
            this.config.tasks = taskConfigs;
        } else{
            
            taskConfigs = this.config.tasks;
        }
        
        if (Array.isArray(taskConfigs) === false || taskConfigs.length === 0) {
            
            return app
                .worker
                .reject('<app:run> tasks are invalid');
        }
        
        this.process(taskConfigs.shift());
        
        return app.worker;
    },
    
    
    
    process: function(taskConfig){
        
        
        var app = this;
        
        this.current = taskConfig;
        this
            .findAction(taskConfig.action)
            .fail(function(error){
                logger.error('<app.action>', error);
                
                next();
            })
            .done(function(handler){
                
                handler.process(taskConfig, function(error){
                    
                    if (error) 
                        app.errors.push('<fail> ' + taskConfig.action + ':'+ error);
                    
                    next();
                });
            });
            
        function next() {
            var taskConfig = app.config.tasks.shift();
                    
            if (taskConfig == null) {
                app
                    .worker
                    .resolve();
                return;
            }
            
            app.process(taskConfig);
        }
        
        return this;
    },
    
    findAction: function(action){
        var dfr = new Class.Deferred(),
            path = this.config.actions[action];
            
        if (path == null) 
            path = '/src/action/' + action + '.js';
        
        
        include
            .instance()
            .js(path + '::Action')
            .done(function(resp){
                
                
                if (resp == null || resp.Action == null) {
                    dfr.reject('Action not found: ' + action);
                    return;
                }
                
                dfr.resolve(resp.Action);
            });
            
        return dfr;
    }
});



module.exports = new Application;