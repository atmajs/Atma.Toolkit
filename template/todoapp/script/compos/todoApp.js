include.js('todoTask.js').load('todoApp.mask').done(function(response) {

    var w = window,
        r = ruqq,
        ENTER_KEY = 13;

    var FilterAdapter = Class({
        Construct: function() {
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
        },
        isVisible: function(taskModel) {
            if (this.action == 'completed' && taskModel.completed == false) {
                return false;
            }
            if (this.action == 'active' && taskModel.completed) {
                return false;
            }
            return true;
        }
    });

    mask.registerHandler(':todoApp', Class({
        Base: Compo,
		Extends: FilterAdapter,
        Construct: function(collection) {
            this.collection = collection;

			w.routes.add('/?:action', this.applyFilter.bind(this));

            this.applyFilter(w.routes.current());
            this.refreshStatus();

        },
        onRenderStart: function(){
            this.model = this;
        },

        attr: {
            template: response.load.todoApp
        },
		compos: {
			list: 'compo: .tasksList'
		},
        events: {
            'keypress: #new-todo': function(e) {
                e.which == ENTER_KEY && this.createTask(e.target.value) && (e.target.value = '');
            },
            'task-changed: li': function(e, todoTask) {
                todoTask.visible(this.isVisible(todoTask.model));
                this.refreshStatus();
                this.collection.save();
            },
            'task-removed: li': function(e, todoTask) {
                this.collection.remove(todoTask.model).save();
                this.refreshStatus();
            },
            'click: #filters > li:not(.selected) > a': function(e) {
                //$(e.currentTarget).closest('ul').find('.selected').removeClass('selected').end().end().addClass('selected');
            },
            'click: #toggle-all': function(e) {

                jmask(this).find(':todoTask').each(function(x) {
                    x.status(e.currentTarget.checked);
                });

                this.applyFilter();
                this.refreshStatus();
                this.collection.save();
            },
            'click: #clear-completed': 'removeCompleted'
        },

        createTask: function(label) {
            label = label.trim();
            if (!label) {
				return 0;
			}


            var taskModel;
            taskModel = this.collection.createNew(label);
            taskModel.visible = this.isVisible(taskModel);

            this.compos.list.append(taskModel);
            this.refreshStatus();

            return 1;
        },

        refreshStatus: function() {
            Object.extend(this.status || (this.status = {}), {
                completed: this.collection.completedCount,
                count: this.collection.tasks.length,
                todos: String.format('<strong>%1</strong> item%2 left', this.collection.todoCount, this.collection.todoCount == 1 ? '' : 's'),
                allCompleted: (this.collection.tasks.length && r.arr.any(this.collection.tasks,'completed','==',false) == false) || ''
            });
        },

        applyFilter: function(current) {

			this.action = current && current.action || '';


            var that = this;

            r.arr.each(this.collection.tasks, function(x){
                x.visible = that.isVisible(x);
            });

            r.arr.each(this.filters, function(x){
                x.selected = that.action == x.action ? 'selected' : '';
            });

        },

        removeCompleted: function(){

            r.arr(jmask(this).find(':todoTask')).where('model.completed','==',true).each(function(task){
                this.collection.remove(task.model);
                task.remove();
            }.bind(this));

            this.collection.save();
            this.refreshStatus();
        }
    }));



});
