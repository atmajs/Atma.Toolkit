include.js({
    framework: ['utils', 'arr', 'net/uri'],
    handler: 'io',
    '': '/lib/helpers.js'
}).done(function() {

    var program = require('commander');

    var TemplateProject = Class({
        process: function(includeJSDir, path) {
            var targetUri = new net.URI(process.cwd() + '/'),
                sourceDir = new net.URI(includeJSDir).combine('/template/').combine(path),
                files = app.service('io', 'file/allSync', {
                    dir: sourceDir.toLocalDir()
                });


            this.files = ruqq.arr.map(files, function(x) {
                return {
                    copyTo: targetUri.combine(x),
                    copyFrom: sourceDir.combine(x)
                }
            });
            

            for (var i = 0, x, length = this.files.length; x = this.files[i], i < length; i++) {
                if (app.service('io', 'file/exists', {
                    file: x.copyTo.toLocalFile()
                })) {
                    program.prompt('Some Files already exists in target Directory. Replace(y/n)? ', this.copy.bind(this));
                    return;

                }
            }

            this.copy('y');
        },
        copy: function(r) {

            if (r == 'y') {
                new window.handler.io.FileCopier().copySync(this.files);
            } else {
                console.log('Canceled');
            }
            process.exit();

        }
    });
    
    return new TemplateProject;
});
