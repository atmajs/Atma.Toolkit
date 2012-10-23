void

function() {

    var w = global,
        program = require('commander');

    w.include.promise('io').File = Class({
        Construct: function(path, data) {
            this.uri = new net.URI(path);
            
            var handler = io.fileFactory.resolveHandler(this.uri);
            if (handler) return new handler(this.uri, data);
            
            return this;
        },
        read: function() {
            return app.service('io', 'file/readSync', {
                file: this.uri.toLocalFile()
            });
        },
        write: function(content) {
            return app.service('io', 'file/save', {
                path: this.uri.toLocalFile(),
                content: content
            });
        },
        copyTo: function(targetUri) {            
            w.app.service('io', 'file/copySync', {
                from: this.uri.toLocalFile(),
                to: targetUri.toLocalFile()
            });
        },
        exists: function() {
            return w.app.service('io', 'file/exists', {
                file: this.uri.toLocalFile()
            });
        }
    });

    w.include.promise('io').fileFactory = new(Class({
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

    w.include.promise('io').Directory = Class({
        Construct: function(directory) {
            this.dir = new net.URI(directory);
        },
        readFiles: function() {
            
            var files = w.app.service('io', 'file/allSync', {
                dir: this.dir.toLocalDir()
            });
            
            this.files = ruqq.arr.map(files, function(x) {
                return new w.io.File(this.dir.combine(x));
            }.bind(this));

            return this;
        },
        copyTo: function(targetUri, options, index, idfr) {
            if (this.files instanceof Array === false) return this;

            for (var i = index || 0, x, length = this.files.length; x = this.files[i], i < length; i++) {
                var relative = x.uri.toRelativeString(this.dir),
                    file = new io.File(this.dir.combine(relative));

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
        }
    });

    w.include.promise('io').env = new (Class({
        Construct: function(){
            var application = new net.URI(process.argv[1].replace(/\\/g,'/'));
            
            this.applicationDir = new net.URI(application.toDir());
            this.currentDir = new net.URI(new net.URI(process.cwd()).toDir());
            
        }
    }))

}();