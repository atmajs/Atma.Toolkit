var jsdom = require('jsdom').jsdom;




var document = jsdom('<!DOCTYPE html><html></html>');

document.implementation.createHTMLDocument = function(html) {
    return jsdom(html || '<html></html>');
}

global.document = document;