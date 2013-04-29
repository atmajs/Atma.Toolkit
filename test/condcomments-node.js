require('../src/libjs/include.node.js');




include //
.load([ //
'test/cond/source.js', //
'test/cond/expect_1.js', //
'test/cond/expect_2.js']) //

.js([ //
'src/libjs/utils.js', //
'src/io/middleware/condcomments.js']).done(function(resp) {


	var buster = require('buster');


	buster.testCase('Condcomments: ', {
		'loaded': function() {
			assert.equals(typeof resp.condcomments, 'function');
			assert.equals(typeof resp.load.source, 'string');
			assert.equals(typeof resp.load.expect_1, 'string');
		},
		'debug': function() {

			var file = {
				content: resp.load.source
			};

			resp.condcomments(file, {
				DEBUG: true
			});


			assert.equals(file.content, resp.load.expect_1);


			file.content = resp.load.source;
			resp.condcomments(file, {
				DEBUG: false
			});

			assert.equals(file.content, resp.load.expect_2);

		}
	});

})
