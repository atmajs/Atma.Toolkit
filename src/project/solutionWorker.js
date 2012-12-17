include.js({
    parser: ['js', 'css', 'html', 'config'],
    handler: ['files/javascript', 'files/style'],
    script: ['project/solution']
}).done(function() {
    var config = global.config;
    
    
    if (!(config && config.state === 4)){
        console.error('>>> Config was not loaded');
        return null;
    }
    
    
    new Solution(config.type, config.uri, config, {
        resolve: function(solution){
            switch (solution.config.action) {
            case 'import':
            case 'reference':
                include.js({
                    action: 'resourceRoutes::resourceRoutes'    
                }).done(function(resp){
                    resp.resourceRoutes.action(solution.config.action);
                });                
                break;
            case 'build':
                include.js({
                    script: 'builder/build::builder'
                }).done(function(resp){
                    resp.builder.build(solution);
                });                
                break;
            }
        }
    }).process();
    
    
    return null;
});