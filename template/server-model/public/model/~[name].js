(function(){

	var ~[name];

	include.exports = {
		~[name]: ~[name] = Class({
			Base: Class.Serializable,
			Store: Class.Remote('/rest/~[name.toLowerCase()]/:id'),
			
			// Validate: {
			// 	key: function(value){ 
			// 		if (!value) return 'Key must be defined'
			// 	}
			// }
			
			/* class members */

		}),

		~[name]s: Class.Collection(~[name], {
			Base: Class.Serializable,
			Store: Class.Remote('/rest/~[name.toLowerCase()]s'),

			/* class members */
		});
	};

}());