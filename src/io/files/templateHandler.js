(function(){


    io.File.getFactory().registerHandler(/\/\.handler\/.+$/g, Class({
        Base: io.File,
        copyTo: function(uri){
            return this;
        },
        write: function(){
            return this;
        },
        read: function(){
            return '';
        }
    }));


}());
