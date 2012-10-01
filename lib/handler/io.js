void function(w) {

    w.include.promise('handler').io = {
        FileCopier: Class({
            Construct: function(list, idfr){
                this.list = list;
                this.idfr = idfr;
                this.index = -1;
            },
            process: function(){
                
                if (++this.index > this.list.length){
                    this.idfr.resolve(this);
                    return this;
                }
                
                var current = this.list[this.index],
                    from = current.copyFrom.toLocalFile(),
                    to = current.copyTo.toLocalFile();
                
                
                this.idfr.progress && this.idfr.progress(this, String.format('Copy: %1 to %2', from, to));                
                w.app.service('io','file/copy',{
                    from: from,
                    to: to
                }, this.process.bind(this));                
                return this;
            },
            
            copySync: function(files){
                for(var i = 0, x, length = files.length; x = files[i], i<length; i++){
                    
                    var from = x.copyFrom.toLocalFile(),
                        to = x.copyTo.toLocalFile();
                    
                    console.log("Copy: %s to %s", from, to);
                    w.app.service('io','file/copySync',{
                        from: from,
                        to: to
                    });
                }
            },
            
            Static: {
                copySync: function(fromURI, toURI){
                    var from = fromURI.toLocalFile(),
                        to = toURI.toLocalFile();
                    
                    console.log("Copy: %s to %s", from, to);
                    w.app.service('io','file/copySync',{
                        from: from,
                        to: to
                    });
                }
            }
        })
    }


}(window);