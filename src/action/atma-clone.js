(function() {
    var exec = require('child_process').exec,
        dir;


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
                , this.list.length
                , repo.path.yellow.bold
                );

            exec('git clone ' + repo.path, {
                cwd: this.dir
            }, function(error, stdout, stderr) {
                if (error) {
                    logger.error('<git:clone>', error, 'skipped'.yellow.bold);
                    this.process();
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
    
    var repos_get = (function(){
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

    function git_clone(done, config) {
            
        var repos = repos_get(config),
            count = repos.length,
            list = repos.map(function(x){
                return x.path;
            })
            ;
        
        logger
            .log('You are about to clone (%d):', count, list);
        
        app.confirm('Process? ', function(ready){
            if (!ready) {
                done('Canceled');
                return
            }
           
            new CloneFactory(dir.uri.toLocalDir(), repos, {
               resolve: function(){
                   new RoutesJob(dir.uri.toLocalDir());
                   done()
               }
           }).process(); 
        });
    }
    
    function dir_ensure(callback){
        dir = new io.Directory(io.env.currentDir.combine('atma/'));
        dir.ensure();
        callback();
    }
    

    include.exports = {
        process: function(config, done){
            
            dir_ensure(function(){
                git_clone(done, config);   
            });
            
        }
    }

}());
