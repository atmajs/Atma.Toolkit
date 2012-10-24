include.js({
    parser: ['js', 'css', 'html', 'config'],
    action: ['build', 'res.routes'],
    handler: ['css', 'files/javascript', 'files/style'],
    '': ['/lib/htmlDocument.js']

}).wait().js('/lib/project/solution.js').done(function() {
    var w = window;
    
    w.SolutionWorker = Class({
        process: function(config) {
            new Solution(config.type, config.uri, config, this).process();
        },
        resolve: function() {
            switch (w.solution.config.action) {
            case 'import':
            case 'reference':
                w.resroutes.action(w.solution.config.action);
                break;
            case 'build':
                w.action.builder.build(w.solution);
                break;
            }
        }
    });

    return null;
});