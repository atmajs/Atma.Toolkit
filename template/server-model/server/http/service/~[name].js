
include
	.js('/server/model/~[name].js::Model')
	.done(function(resp){

		var ~[name]  = resp.Model.~[name],
			~[name]s = resp.Model.~[name]s
			;

		include.exports = atma.server.HttpService({

			'$get /~[name.toLowerCase()]s': function(req, res, params){

				var that = this;
				
				~[name]s
					.fetch({})
					.done(function(collection){

						that.resolve(collection);
					})
					.fail(function(error){

						that.reject(error);
					})
			},

			'$get /~[name.toLowerCase()]/:id': function(req, res, params){

				var that = this;

				~[name]
					.fetch({ _id: params.id })
					.done(function(instance){
						if (instance._id !== params.id)
							return that.reject({ error: 'Not found' }, 404);

						that.resolve(instance);
					})
					.fail(function(error){

						that.reject(error);
					});
			},

			'$post /~[name.toLowerCase()]': function(req, res, params){
				var json = req.body,
					that = this;

				var ~[name.toLowerCase()] = new ~[name](json),
					err;

				if ((err = Class.validate(~[name])))
					return this.reject({ error: err });

				~[name]
					.save()
					.done(function(instance){

						that.resolve(instance);
					})
					.fail(function(error){

						that.reject(error);
					});
			},

			'$put /~[name.toLowerCase()]/:id': function(req, res, params){
				var json = req.body,
					that = this;

				if (!json._id)
					return this.reject({ error: 'ID should be present' });

				var ~[name.toLowerCase()] = new ~[name](json),
					err;

				if ((err = Class.validate(~[name])))
					return this.reject({ error: err });

				~[name]
					.save()
					.done(function(instance){

						that.resolve(instance);
					})
					.fail(function(error){

						that.reject(error);
					})
					;
			},

			'$delete /~[name.toLowerCase()]/:id': function(req, res, params){

				var that = this;

				new ~[name]({_id: params.id})
					.del()
					.done(function(){

						that.resolve({ success: 'Deleted' });
					})
					.fail(function(error){

						that.reject(error)
					});
			}
		})

	});
