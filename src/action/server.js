(function(){
    
    include.exports = {
        process: function(config, idfr){
            include.js('/src/server/server.js').done(function(resp){
                
                resp.server.start(config);
                
                idfr && idfr.resolve();
            });
        }
    }
    
}());