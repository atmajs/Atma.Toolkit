global.window = global;


require('./script/class.js');
require('./script/include.js');


window.app = require('./node/app.js').app;
window.XMLHttpRequest = require('./node/xmlhttprequest.local.js').XMLHttpRequest;
window.document = require('./node/document.parser.js').document;




include.cfg({
   framework: '/script/{name}.js',
   formatter: '/lib/formatter/{name}.js',
   handler: '/lib/handler/{name}.js',
   parser:  '/lib/parser/{name}.js'
}).js({
   framework: '/net/uri',
   '': '/lib/builder.js'
   
}).done(function() {

   //var uri = new net.URI('c:\\Development\\libjs\\compo\\index.html');
   //Builder.process(uri.extension, uri.toString());

   console.log('Main Completed', process.argv);
});

//
//
//window.main = function(action) {
//
//   dfr.done(function() {
//      if (action.args.length) {
//         var uri = new window.net.URI(action.args[0]);
//         Builder.process(uri.extension, uri.toString());
//         return;
//      }
//
//      terminal.promt('Enter the file to be minified:', function(data) {
//         console.log('>>data', data);
//      });
//
//   });
//}
//
//