let tasks = [];

function loadTasks() {
    const savedTasks = localStorage.getItem("fitness_tasks");
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
}

function saveTasks() {
    localStorage.setItem("fitness_tasks", JSON.stringify(tasks));
}

function addTask(title) {
    const task = {
        id: Date.now(),
        title: title,
        status: "pending",
        pomodoros: 0
    };
    tasks.push(task);
    saveTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });
    saveTasks();
}

function editTask(id, newTitle) {
    const task = tasks.find(function(task) {
        return task.id === id;
    });
    if (!task) return;
    task.title = newTitle;
    saveTasks();
}

function toggleTaskStatus(id) {
    const task = tasks.find(function(task) {
        return task.id === id;
    });
    if (!task) return;
    task.status = task.status === "pending" ? "completed" : "pending";
    saveTasks();
}

function moveTask(id, status) {
    const task = tasks.find(function(task) {
        return task.id === id;
    });
    if (!task) return;
    task.status = status;
    saveTasks();
}