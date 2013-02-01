


var program = require('commander'),
    currentIndent;


function write(message, indent) {
    if (indent != null){
        currentIndent = indent;
    }
    var _ = '';
    if (currentIndent) {
        for (var i = 0; i < currentIndent; i++) _ += '   ';
    }
    console.log(_ + message);
}


program.usage('[action | *.config | *.js] [arg] [...] -KEY VALUE [...]') //
.description('IncludeJS Application Builder') //
.version('0.5.6') //


program.on('--help', function() {
    var help = [];

    write('Actions - ', 1);
    write('\r');

    write('build\t collect and combine all includes starting from main html', 2);
    write('shell\t run shell command/-s');
    write('custom\t run custom script/-s');
    write('server\t start local server from current woring dir');
    write('git-clone\t clone all LibJS libraries');
    write('globals\t open includejs.builder routes file');
    write('template\t create template project in current dir');
    write('reference\t create symbolic link to a folder in current dir');

    write('\r',1);

    write('Options - ', 1);

    write('build - ', 2);
    write('"minify" - {Boolean} - available only with action == "build"',3);
    write('"outputMain" - output name of a built html',3);
    write('"outputSources" - directory of built resources',3);
    write('"uglify" - {Object} - UglifyJS settings. Example, {global_defs:{DEBUG:false}}',3);
    write('"jshint" - {Object} - Hint settings',3);
    write('"options" - {Object} - JSHINT options',4);
    write('"global" - {Object} - JSHINT global variables',4);
    write('"ignore" - {Object} - Filenames hash to ignore',4);

    write('\r',1);


    write('Further options at http://libjs.it/#/includeBuilder/commands')

});


program.parse(process.argv);


exports.program = program;
