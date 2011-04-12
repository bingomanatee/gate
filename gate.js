/**
 * This module allows you to track aggregate activity and
 * execute one or more callbacks when your tasks clear.
 * It is not necessary to identify individual tasks as
 * the only thing this class cares about is the quantity of tasks in the queue.
 *
 * However for future proofing, tasks are identified and optionally removed by name. 
 */

module.exports = function(callbacks, params) {
    this._params = params ? params : {};
    this._tasks = [];
    this.start = false;
    this.interval = 100;
    this._callbacks = typeof(callbacks) == 'function' ? [callbacks] : _.isArray(callbacks) ? callbacks : [];
}

module.exports.prototype.start = function() {
    this.start = true;
    var self = this;
    
    var i = setInterval(this.interval,function(){
        if (!self.start){
            clearInterval(i);
        } else {
            self._check_status();
        }
    })
}

module.exports.prototype.task_start = function(task) {
    if (!task) {
        task = {
            id: this._tasks.length
        };
    } else if (typeof task != 'object') {
        task = {
            id: task
        };
    }

    if (!task.hasOwnProperty('id')) {
        task.id = this._tasks.length;
    }
    this._tasks.push(task);
    return task.id;
}

/**
 * @id scalar (optional)
 * returns either the designated task
 * or the last task in the queue. 
 */
module.exports.prototype.task_done = function(id) {
    if (typeof id == 'undefined') {
        var done_task = this._tasks.pop();
    } else {
        var new_tasks = [];
        var found = false;
        this._tasks.forEach(function(task, i) {
            if (found) {
                new_tasks.push(task);
            } else if (i == (this._tasks.length - 1)) {
                var done_task = task;
                // pop the last item, by implication if no specific task has been found
            } else if (task.id == id) {
                var done_task = task;
                found = true;
            } else { // save every other task - not including the last - 
                new_tasks.push(task);
            }
        })
    }

    this._check_status();
    return done_task;
}

module.exports.prototype._check_status = function() {
    var self = this;
    
    if ((!this._tasks.length) && this.start) {
        this.start = false;
        this._callbacks.forEach(function(callback) {
            callback(self);
        });
    }
}

module.exports.prototype.run_callacks = function() {
    this._callbacks.forEach(function(err, callback) {
        callback(null, this);
    })
}
