include.load('todoTask.mask').done(function(response) {

	var ENTER_KEY = 13,
		ESCAPE_KEY = 2,
		taskTemplate = response.load.todoTask;


	mask.registerHandler(':todoTask', Compo({
		constructor: function(model) {
			this.attr = {
				template: taskTemplate
			};
		},
		pipes: {
			action: {
				changed: function(action) {
					task_isVisible(this.model, (this.action = action));
				}
			}
		},
		slots: {
			edit: function(){
				this.$.addClass('editing');
			},
			inputBlur: 'editEnd',
			inputChar: function(event){
				if (ENTER_KEY === event.which) {
					this.editSave(event.currentTarget.value);
					this.editEnd();
				}
				if (ESCAPE_KEY === event.which) {
					this.editEnd();
				}

				// signal stopPropagation
				return false;
			},
			taskRemove: function(){
				this.$.trigger('task-removed', this);
				this.remove();
			},
			taskState: function(){
				this.$.trigger('task-changed', this);

			}
		},
		onRenderStart: function(model) {

			task_isVisible(model, (this.action = this.closest(':todoApp').action));
		},

		editSave: function(label) {
			label = label && label.trim();
			if (label && label !== this.model.label) {
				this.model.label = label;
				this.$.trigger('task-changed', this);
			}
		},
		editEnd: function(){
			this.$.removeClass('editing');
		},

		updateVisible: function(){
			return task_isVisible(this.model, this.action);
		}
	}));


	function task_isVisible(taskModel, action) {
		var completed = taskModel.completed;

		if (action === 'completed' && !completed) {
			return taskModel.visible = false;
		}

		if (action === 'active' && completed) {
			return taskModel.visible = false;
		}

		return taskModel.visible = true;
	}

});
