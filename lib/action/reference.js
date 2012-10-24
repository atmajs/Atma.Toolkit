void
function() {
    var fs = require('fs'),
        w = global,
        p = w.program;

    if (!p.args[1]) return console.error('Path not defined.');
    
    w.referenceHelper.create(io.env.currentDir, p.args[2], program.args[1]);
    return null;
}();