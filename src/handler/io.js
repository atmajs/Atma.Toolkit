include.js('io.utils.js::IOUtils').done(function(resp){

	var utils = resp.IOUtils,
        G = global,
        program = require('commander'),
        fs = require('fs');

    G.include.promise('io').File = Class({
        Construct: function(path, data) {
            this.uri = new net.URI(path);
            
            if (this.__proto__ == io.File.prototype){
                var handler = io.fileFactory.resolveHandler(this.uri);
                if (handler) return new handler(this.uri, data);
            }
            
            return this;
        },
        read: function() {
            return utils.file.readSync(this.uri.toLocalFile());
        },
        write: function(content) {
            utils.file.save(this.uri.toLocalFile(),content);
            return this;
        },
        copyTo: function(targetUri) {
            console.log('Copy:', this.uri.toLocalFile(), targetUri.toLocalFile());
			
			utils.file.copySync(this.uri.toLocalFile(),targetUri.toLocalFile());
            return this;
        },
        exists: function() {
            return utils.file.exists(this.uri.toLocalFile());
        }
    });

    G.include.promise('io').fileFactory = new(Class({
        handlers: [],
        registerHandler: function(regexp,handler){
            this.handlers.push({
                handler: handler,
                regexp: regexp
            });
        },
        resolveHandler: function(uri){
            var str = uri.toString();
            
            
            var handler = ruqq.arr.first(this.handlers, function(item){
                var isarray = item.regexp instanceof Array,
                    length = isarray ? item.regexp.length : 1,
                    x = null;
                    
                for (var i = 0; x = isarray ? item.regexp[i] : item.regexp, isarray ? i < length : i < 1; i++) {
                    if (x.test(str)) return true;
                }
                return false;
            });
            
            return handler && handler.handler || null;
        }
    }))();

    G.include.promise('io').Directory = Class({
        Construct: function(directory) {
            this.uri = new net.URI(directory);
            delete this.uri.file;
        },
        exists: function(){
            return  fs.existsSync(this.uri.toLocalDir());  
        },
        ensure: function(){
            utils.dir.ensure(this.uri.toLocalDir());
            return this;
        },
        readFiles: function() {
            
            this.files = ruqq.arr.map(utils.dir.filesSync(this.uri.toLocalDir()), function(x) {
                return new io.File(this.uri.combine(x));
            }.bind(this));

            return this;
        },
        copyTo: function(targetUri, options, index, idfr) {
            if (this.files instanceof Array === false) return this;

            for (var i = index || 0, x, length = this.files.length; x = this.files[i], i < length; i++) {
                var relative = x.uri.toRelativeString(this.uri),
                    file = new io.File(this.uri.combine(relative));

                if (options && options.indexOf('-v') == -1 && file.exists()) {
                    program.prompt(String.format('File already exists: #{file}. Replace(y/n)? ', {
                        file: file.uri.toLocalFile()
                    }), this.copy.bind(this, targetUri, options, i, idfr));

                    return this;
                }

                x.copyTo(targetUri.combine(relative));
            }

            idfr && idfr.resolve && idfr.resolve();
            return this;
        },
        getName: function(){
            return this.uri.path.replace(/^.*\/([^\/]+)\/?$/,'$1');            
        },
        rename: function(name){
            if (!name) {
                console.error('New Name is not defined');
                return;
            }
            var oldpath = this.uri.toLocalFile();
            var newpath = oldpath.replace(/[^\/]+\/?$/g, name);
            console.log('rename', oldpath, newpath);
            fs.renameSync(oldpath, newpath);
        }
    });

    G.include.promise('io').env = new (Class({
        Construct: function(){
            var path = process.argv[1].replace(/\\/g,'/');
                
            this.applicationDir = new net.URI(path);
            
            if (this.applicationDir.file == null){
                this.applicationDir.path = G.urlhelper.getDir(this.applicationDir.path);
            }
            
            this.currentDir = new net.URI(process.cwd());
            
        }
    }))

});