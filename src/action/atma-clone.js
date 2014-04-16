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
            
            logger.log(
                'Cloning.. %d/%d'.bold
                , this.index + 1
                , this.list
                , repo.path.yellow.bold
                );

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
            if (atmaDir[atmaDir.length - 1] != '/') 
                atmaDir = atmaDir + '/';
            
            
            app.config.$write({
                projects: {
                    atma: {
                        path: "file:///" + atmaDir
                    }
                }
            });
            
        }
    });
    
    var Repos = (function(){
        var primary = [
            'ClassJS',
            'IncludeJS',
            'MaskJS',
            'RuqqJS',
            'Compos',
            'mask-animation'
        ];
        var all = [
            'assertion',
            'utest',
            'atma-io',
            'atma-server',
            'atma-logger',
            'util-format',
            'mask-j',
            'mask-node',
            'mask-binding',
            'mask-compo',
            'atma-loader-traceur',
            'appcfg',
            'mask-minify',
            'atma-chrome-ext',
            'i18n',
            'Ruta',
            'web-page'
        ];
        return function(config){
            var arr = primary;
            if (config.all) {
                arr = arr.concat(all);
            }
            
            return arr.map(function(name){
                return {
                    path: 'git://github.com/atmajs/' + name + '.git'
                };
            });
        };
    }());

    var Git = {
        clone: function(done, config) {
            
            var dir = new io.Directory(io.env.currentDir);

            dir.uri = dir.uri.combine('atma/');
            if (dir.exists()) {
                done('Atma Directory Already Exists');
                return;
            }
            dir.ensure();

            var list = Repos(config);

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
            Git.clone(done, config);
        }
    }

}());
