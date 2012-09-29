var jsdom = require('jsdom').jsdom;

global.window = global;

require('../script/class.js');


exports.document = jsdom('<!DOCTYPE html><html></html>');

exports.document.implementation.createHTMLDocument = function(html) {
    return jsdom(html || '<html></html>');
}




////
////
////
////var Document = Class({
////    Construct: function(){
////        
////        this.name = 'asdasd';
////        this.__defineSetter__('innerHTML', function(value){
////            this.dom = jsdom(value)
////            
////            console.log('createElement', this.dom.createElement);;
////        });
////    }
////});
////
////
////
////var d = new Document;
////d.innerHTML = '<!DOCTYPE html><html><body><div></div></body></html>'
////