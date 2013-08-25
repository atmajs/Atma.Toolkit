
require('atma-libs/globals-dev')


global.doo = true;
include
	.js('./utest.node.js')
	.done(function(resp){
		
	})

console.log('done')