(function(){

    include.exports = {
        process: function(config, done){

            include.js('/src/project/solutionWorker.js').done(function(resp){
                resp.solutionWorker.process(config, done);
            });
        }
    }

}());
