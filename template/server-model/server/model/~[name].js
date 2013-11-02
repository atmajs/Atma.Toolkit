include
	.js('/public/model/~[name].js::Model')
	.done(function(resp){

		var ~[name];

		include.exports = {
			~[name]: ~[name] = Class({
				Base: resp.Model.~[name]

				Store: Class.MongoStore.Single('~[name]s'),

				//Static: {}
			}),

			~[name]s: Class.Collection(~[name], {
				Base: res.Model.~[name]s,

				//Static: {}
			})
		};

	})