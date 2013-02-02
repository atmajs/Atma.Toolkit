(function(){

    include.exports = {
        process: function(config, done){

            include.js('/src/project/solutionWorker.js').done(function(resp){
                resp.solutionWorker.process(config, {
                    resolve: function(){
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(null);

                        done.apply(this, args);
                    },
                    reject: done
                });
            });
        }
    }

}());
