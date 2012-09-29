

var fs = require('fs'),
    fsextra = require('fs.extra')

var services = {
    io:{
        'file/save': function(data){
            console.log('saving', data.path);
            
            var  folder = urlhelper.getDir(data.path);            
            if (folder && fs.existsSync(folder) == false){
                try{
                    fs.mkdirSync(folder);
                }catch(e){};
            }
            
            
            fs.writeFile(data.path, data.content);
        },
        'file/copy': function(data, callback){
            console.assert(data.copyFrom, 'file/copy - invalid copyFrom');
            console.assert(data.copyTo, 'file/copy - invalid copyTo');
            
            
            if (fs.existsSync(data.copyFrom) == false){
                console.error('file/copy - 404 Error', data.copyFrom);
                
                callback && callback(404);
            }
            var folder = urlhelper.getDir(data.copyTo);
            if (fs.existsSync(folder) == false) fs.mkdirSync(folder);
            
            fs.copy(data.copyFrom, data.copyTo, callback);
        },
        'file/exists': function(data){
            return fs.existsSync(data.file);
        }
    }
}

exports.app = {
    service: function(name, method, data){
        return services[name][method](data);
    }
}