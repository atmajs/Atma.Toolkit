void
function() {
    var exec = require('child_process').exec;


    var CloneFactory = Class({
        Construct: function(dir, list, idfr) {
            this.list = list;
            this.index = -1;
            this.idfr = idfr;
            this.dir = dir;
        },
        process: function() {
            if (++this.index > this.list.length - 1) {
                this.idfr && this.idfr.resolve && this.idfr.resolve();
                return;
            }

            var repo = this.list[this.index];
            exec('git clone ' + repo.path, {
                cwd: this.dir
            }, function(error, stdout, stderr) {                
                if (error) {
                    console.log('error', error, stderr);
                    return;
                }
                
                if (repo.name) {
                    var dirname = repo.path.replace(/.+\/([^\/]+)\.git/g, '$1');

                    var dir;
                    dir = new io.Directory(this.dir);
                    dir.uri = dir.uri.combine(dirname);
                    dir.rename(repo.name);
                }

                this.process();

            }.bind(this))
        }
    });

    var RoutesJob = Class({
        Construct: function(libjsDir) {
            if (libjsDir[libjsDir.length - 1] != '/') libjsDir = libjsDir + '/';
            
            var file = new io.File(new net.URI(io.env.applicationDir).combine('globals.txt'));
            var globals = {
                projects: {
                    libjs: {
                        path: "file:///" + libjsDir
                    }
                },
                defaultRoutes: {
                    lib: "{libjs}/{0}/lib/{1}.js",
                    framework: "{libjs}/ruqq/lib/{0}.js",
                    compo: "{libjs}/compos/{0}/lib/{1}.js"
                }
            }
            file.write(JSON.stringify(globals, null, 4));
        }
    })

    var Git = {
        clone: function(list) {
            var dir = new io.Directory(io.env.currentDir);
            
            dir.uri = dir.uri.combine('libjs/');
            if (dir.exists()) {
                console.error('LibJS Directory Already Exists');
                return;
            }
            dir.ensure();
            
            list = [{
                path: 'git://github.com/tenbits/ClassJS.git',
                name: 'class'
            }, {
                path: 'git://github.com/tenbits/IncludeJS.git',
                name: 'include'
            }, {
                path: 'git://github.com/tenbits/MaskJS.git',
                name: 'mask'
            }, {
                path: 'git://github.com/tenbits/RuqqJS.git',
                name: 'ruqq'
            }, {
                path: 'git://github.com/tenbits/CompoJS.git',
                name: 'compo'
            }, {
                path: 'git://github.com/tenbits/Compos.git',
                name: 'compos'
            }];

            new CloneFactory(dir.uri.toLocalDir(), list, {
                resolve: function(){
                    new RoutesJob(dir.uri.toLocalDir());
                }
            }).process();
        }
    }

    // run it
    Git.clone('');

}();