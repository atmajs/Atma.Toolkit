include.js({
    helper: 'referenceHelper::refHelper'
}).done(function(resp) {
    
    var program = require('commander');;

    if (!program.args[1]) {
        return console.error('Path not defined.');
    }
    
    resp.refHelper.create(io.env.currentDir, program.args[2], program.args[1]);
    return null;
});