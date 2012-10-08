var program = require('commander');


function write(message, indent) {
    var _ = '';
    if (indent) for (var i = 0; i < indent; i++) _ += '   ';
    console.log(_ + message);
}


program.usage('[command] [options]') //
.description('IncludeJS Application Builder') //
.version('0.3.4') //
.option('-m, --minify', 'Minify Javascript and CSS output');


program.on('--help', function() {
    var help = [];

    write('[command] - ', 1);
    write('\r');

    write('[*.hml] [options]', 2);
    write('Parse HTML and build all resources', 3);
    write('[options] @see program options', 4);
    
    write('');
    write('[*.config]', 2);
    write('{JSON}', 3);
    write('');
    
    write('"file" - *.html input',3);
    
    write('"vars" - {Object} - Variables used when parsing includes',3);
    
    write('"action" - ',3);
    write('"build" - @default - combine resources',4);
    write('"import" - copy outer resources to projects directory',4);
    
    write('"minify" - {Boolean} - available only with action == "build"',3);
    write('"outputMain" - output name of a built html',3);
    write('"outputSources" - directory of built resources',3);
    
    
    write('');
    write('template [name]',2)
    write('Create empty project in {current} directory',3);
    write('Available: "starter"',4);
    
});


program.parse(process.argv);


exports.program = program;
