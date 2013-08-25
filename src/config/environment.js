 include
    .js('/globals/environments.js')
    .done(function(resp){
        
        include.exports = function(app, done){
            
            return done({
                environments: resp.environments.environments
            });
        }
    });
