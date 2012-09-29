include.js({
    framework: ['arr', 'utils'],
    formatter: ['cssmin', 'uglify'],
    parser: ['js', 'css', 'html'],
    handler: ['css'],
    '': ['/lib/helpers.js', '/lib/htmlDocument.js', '/lib/sys.js']
}).wait().js(['/lib/project/solution.js']).done(function() {

    var w = window,
        r = ruqq,
        include = {},
        cfg = {};




    window.Builder = (function(w) {

        return {
            process: function(uri, config) {
                var type = config.type;
                switch (uri.extension) {
                case 'js':
                    type = 'js';
                    break;
                case 'html':
                case 'htm':
                    type = 'html';
                    break;
                default:
                    if (!type) throw new Error('Unknown Solution Type');
                }
                console.log('Building solution... ', uri.toString());
                
                
                this.start = Date.now();
                w.solution = new w.Solution(type, uri, config, this);
                w.solution.process();
            },
            resolve: function(solution) {


                console.log('Solution Done. Time: ', Date.now() - this.start);
            }
        }
    })(w);






});