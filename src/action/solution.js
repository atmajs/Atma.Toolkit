

include.exports = {
    process: function(config, done){

        include
            .js('/src/solution/solutionWorker.js')
            .done(function(resp){
                resp.solutionWorker.process(config, done);
            });
    }
};


