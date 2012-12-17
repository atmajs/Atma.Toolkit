
var fs = require('fs'),
 	XMLHttpRequest = function(){}


XMLHttpRequest.prototype = {
	open: function(method, url){
		this.url = url;
	},
	send: function(){
		
		if (this.url.indexOf('file:///') > -1){
			this.url = this.url.replace('file:///','');
		}
		
		fs.readFile(this.url, 'utf-8', function(err, data){
			if (err) throw err;			
			this.readyState = 4;
			this.responseText = data;
			this.onreadystatechange();
			
		}.bind(this));
	}
};


global.XMLHttpRequest = XMLHttpRequest;