(function(){

    include.exports = {
        process: function(config, idfr){
            
            include.js('/src/project/solutionWorker.js').done(function(resp){
                resp.solutionWorker.process(config, idfr);
            }); 
        }
    }
    
}());
