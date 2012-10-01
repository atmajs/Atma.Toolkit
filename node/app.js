var fs = require('fs'),
    fsextra = require('fs.extra'),
    copyFileSync = function(srcFile, destFile) {
        var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
        BUF_LENGTH = 64 * 1024;
        buff = new Buffer(BUF_LENGTH);
        fdr = fs.openSync(srcFile, 'r');
        fdw = fs.openSync(destFile, 'w');
        bytesRead = 1;
        pos = 0;
        while (bytesRead > 0) {
            bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
            fs.writeSync(fdw, buff, 0, bytesRead);
            pos += bytesRead;
        }
        fs.closeSync(fdr);
        return fs.closeSync(fdw);
    };

var services = {
    io: {
        'file/save': function(data) {
            console.log('saving', data.path);

            var folder = urlhelper.getDir(data.path);
            if (folder && fs.existsSync(folder) == false) {
                try {
                    fs.mkdirSync(folder);
                } catch (e) {};
            }


            fs.writeFile(data.path, data.content);
        },
        'file/copy': function(data, callback) {
            console.assert(data.from, 'file/copy - invalid copyFrom');
            console.assert(data.to, 'file/copy - invalid copyTo');


            if (fs.existsSync(data.from) == false) {
                console.error('file/copy - 404 Error', data.from);

                callback && callback(404);
            }
            var folder = urlhelper.getDir(data.to);
            if (fs.existsSync(folder) == false) fs.mkdirSync(folder);

            fs.copy(data.from, data.to, callback);
        },
        'file/copySync': function(data) {
            if (fs.existsSync(data.from) == false) {
                console.error('file/copy - 404 Error', data.from);

            }
            var folder = urlhelper.getDir(data.to);
            if (fs.existsSync(folder) == false) fs.mkdirSync(folder);
            
            copyFileSync(data.from, data.to);
        },
        'file/exists': function(data) {
            return fs.existsSync(data.file);
        },
        'file/readSync': function(data) {
            return fs.readFileSync(data.file, 'utf-8');
        }
    }
}

exports.app = {
    service: function(name, method, data) {
        return services[name][method](data);
    }
}