(function(){
    
    include.exports = {
        process: function(config, idfr){
            include.js('/src/server/server.js').done(function(){
                idfr && idfr.resolve();
            });
        }
    }
    
}());