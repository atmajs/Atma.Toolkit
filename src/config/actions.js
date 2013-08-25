

include
    .js(
        '/globals/actions.js'
    )
    .done(function(resp){
        
        include.exports = function(app, done){
            done({
                actions: resp.actions.actions
            });
        };
    });