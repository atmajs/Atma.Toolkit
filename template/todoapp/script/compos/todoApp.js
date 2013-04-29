include.js('todoTask.js').load('todoApp.mask').done(function(response) {

	var w = window,
		r = ruqq,
		ENTER_KEY = 13;


	mask.registerHandler(':todoApp', Compo({
		constructor: function(collection) {
			this.collection = collection;

			this.filters = [{
				title: 'All',
				action: ''
			}, {
				title: 'Active',
				action: 'active'
			}, {
				title: 'Completed',
				action: 'completed'
			}];

			w.routes.add('/?:action', this.applyFilter.bind(this));

			this.applyFilter(w.routes.current());
		},
		onRenderStart: function(model) {
			this.model = this;
			this.status = model.status;
		},

		attr: {
			template: response.load.todoApp
		},
		slots: {
			inputChar: function(event) {
				if (ENTER_KEY === event.which) {
					this.createTask(event.currentTarget.value);
					event.currentTarget.value = '';
				}

				return false;
			},
			removeCompleted: function() {
				var tasks = jmask(this).find(':todoTask'),
					collection = this.collection;

				r.arr(tasks).where('model.completed', '==', true).each(function(task){
					collection.remove(task.model);
					task.remove();
				});

				collection.save();
			},
			toggleAll: function(event) {

				var completed = event.currentTarget.checked;

				r.arr.each(this.collection.tasks, function(task){
					task.completed = completed;
				});

				this.collection.save();
			}
		},
		events: {
			'task-changed: li': function(e, todoTask) {
				this.collection.save();
			},
			'task-removed: li': function(e, todoTask) {
				this.collection.remove(todoTask.model).save();
			}
		},

		createTask: function(label) {
			if (!(label = label.trim())){
				return;
			}

			this.collection.createNew(label);
		},

		applyFilter: function(current) {

			var action = this.action = (current && current.action || '');

			r.arr.each(this.filters, function(filter) {
				filter.selected = action === filter.action ? 'selected' : '';
			});

			Compo.pipe('action').emit('changed', [action]);

		}
	}));



});
