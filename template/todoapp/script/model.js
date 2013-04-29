void
function() {

    var w = window,
        r = ruqq;

    w.tasksDB = new (Class({
        Construct: function() {
            this.tasks = [];
            this.restore();

        },

        createNew: function(label, completed){
            var data = {
                label: label || '',
                completed: !!completed
            };
            this.tasks.push(data);
            this.save();
            return data;
        },

        restore: function() {
            var tasks = localStorage && localStorage.getItem('todo-libjs');
            if (tasks) {
                calc_status(this.tasks = JSON.parse(tasks), this.status);
            }
        },

        save: function() {
            calc_status(this.tasks, this.status);
            localStorage && localStorage.setItem('todo-libjs', JSON.stringify(r.arr.select(this.tasks, ['label','completed'])));
            return this;
        },

        remove: function(model){
            this.tasks.splice(r.arr.indexOf(this.tasks, model), 1);
            return this;
        },

        status: {
            count: 0,
            todoCount: 0,
            completedCount: 0
        }
    }));


    function calc_status(tasks, status) {
        status.completedCount = r.arr.count(tasks, 'completed', '==', true);
        status.todoCount = r.arr.count(tasks, 'completed', '==', false);
        status.count = tasks.length;
    }
}();
