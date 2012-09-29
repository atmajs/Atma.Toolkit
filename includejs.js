#!/usr/bin/env node

global.window = global;


require('./script/class.js');
require('./script/include.js');


window.app = require('./node/app.js').app;
window.XMLHttpRequest = require('./node/xmlhttprequest.local.js').XMLHttpRequest;
window.document = require('./node/document.parser.js').document;


var program = require('commander');


program
   .usage('[file] [options]')
   .description('IncludeJS Application Builder')
   .version('0.3.3')
   .option('-m, --minify', 'Minify Javascript and CSS output')
   //-.option('-o, --output', 'script and style output directory, (!Relative to Application path)')
   //-.option('-t, --type', 'Solution Type (js | html)')
   
   .parse(process.argv);

var config = {
   file: program.args[0],
   minify: program.minify
}


if (!app.service('io','file/exists', config)){
   throw new Error("File doesnt exists: " + config.file);
}

var dir = process.argv[1],
	index = dir.lastIndexOf('\\'),
	dir = dir.substring(0, index + 1);

include.cfg({
   framework: '/script/{name}.js',
   formatter: '/lib/formatter/{name}.js',
   handler: '/lib/handler/{name}.js',
   parser:  '/lib/parser/{name}.js',
   path: dir
}).js({
   framework: '/net/uri',
   '': '/lib/builder.js'
   
}).done(function() {
   
   var uri = new net.URI(config.file); 
   
   if (uri.isRelative()){
      uri = (new net.URI(process.cwd())).combine(config.file);
   }
   
   Builder.process(uri, config);

   //console.log('Main Completed', process.argv, process.version);
});
