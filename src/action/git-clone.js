(function() {
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
                    logger.error('<git:clone>', error, stderr);
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
        Construct: function(atmaDir) {
            if (atmaDir[atmaDir.length - 1] != '/') {
                atmaDir = atmaDir + '/';
            }

            var file = new io.File(io.env.appdataDir.combine('config.yml')),
                globals = app.config.globals;
            
            globals.projects['atma'] = {
                path: "file:///" + atmaDir
            };
            
            
            try {
                file.write(globals);   
            } catch(e) {
                var msg = 'Access Denied - run "$ atma globals" and specify correct just installed atma path.'
                logger.error(msg, atmaDir);
            }
            
        }
    })

    var Git = {
        clone: function(done) {
            var dir = new io.Directory(io.env.currentDir);

            dir.uri = dir.uri.combine('atma/');
            if (dir.exists()) {
                done('Atma Directory Already Exists');
                return;
            }
            dir.ensure();

            var list = [{
                path: 'git://github.com/atmajs/ClassJS.git',
                name: 'class'
            }, {
                path: 'git://github.com/atmajs/IncludeJS.git',
                name: 'include'
            }, {
                path: 'git://github.com/atmajs/MaskJS.git',
                name: 'mask'
            }, {
                path: 'git://github.com/atmajs/RuqqJS.git',
                name: 'ruqq'
            },{
                path: 'git://github.com/atmajs/mask-animation.git',
                name: 'mask.animation'
            }, {
                path: 'git://github.com/atmajs/Compos.git',
                name: 'compos'
            }];

            new CloneFactory(dir.uri.toLocalDir(), list, {
                resolve: function(){
                    new RoutesJob(dir.uri.toLocalDir());

                    done()
                }
            }).process();
        }
    }

    include.exports = {
        process: function(config, done){
            Git.clone(done);
        }
    }

}());
