

include.exports = {
    
    help: {
        description: '<internal> Is used in build command'  
    },
    process: function(config, done){

        include
            .js('/src/solution/solutionWorker.js')
            .done(function(resp){
                resp.solutionWorker.process(config, done);
            });
    }
};


