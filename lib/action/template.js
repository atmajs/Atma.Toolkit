include.js({
    framework: ['utils', 'arr', 'net/uri'],
    handler: ['io', 'files/includeLoader'],
    '': '/lib/helpers.js'
}).done(function() {

    var program = require('commander');

    var TemplateProject = Class({
        process: function(path) {
            var targetUri = new net.URI(process.cwd() + '/'),
                sourceDir = io.env.applicationDir.combine('/template/').combine(path);

            
            new io.Directory(sourceDir).readFiles().copyTo(targetUri);            
        }
    });

    return new TemplateProject;
});