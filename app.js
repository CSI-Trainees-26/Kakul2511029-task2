function $(id) {
    return document.getElementById(id);
}

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function() {
        toast.classList.remove("show");
    }, 2000);
}

function displayCurrentDate() {
    const today = new Date();
    const date = today.toLocaleDateString({
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    $("currentDate").textContent = date;
}

function renderTasks() {
    const pendingContainer = $("pendingTasks");
    const completedContainer = $("completedTasks");

    pendingContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    tasks.forEach(function(task) {
        const element = createTaskElement(task);
        if (task.status === "completed") {
            completedContainer.appendChild(element);
        } 
        else {
            pendingContainer.appendChild(element);
        }
    });

    const pending = tasks.filter(function(task) {
        return task.status === "pending";
    }).length;

    const completed = tasks.filter(function(task) {
        return task.status === "completed";
    }).length;

    $("pendingCount").textContent = pending;
    $("completedCount").textContent = completed;
    $("taskCount").textContent = tasks.length + (tasks.length === 1 ? " task" : " tasks");

    if (pending === 0) {
        pendingContainer.innerHTML = '<div class="empty-message">No pending tasks.</div>';
    }

    if (completed === 0) {
        completedContainer.innerHTML = '<div class="empty-message">No completed tasks.</div>';
    }

    updateStatistics();
}

function createTaskElement(task) {
    const item = document.createElement("div");
    item.className = "task-item";
    item.draggable = true;

    item.addEventListener("dragstart", function(event) {
        event.dataTransfer.setData("text/plain", task.id);
    });

    if (task.status === "completed") {
        item.classList.add("completed-task");
    }

    const checkButton = document.createElement("button");
    checkButton.className = "task-check";
    checkButton.type = "button";
    checkButton.textContent = task.status === "completed" ? "✓" : "";

    checkButton.addEventListener("click", function() {
        toggleTaskStatus(task.id);
        renderTasks();

        showToast(
            task.status === "completed"
                ? "Task completed!"
                : "Task moved to pending."
        );
    });

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function() {
        const input = document.createElement("input");

        input.type = "text";
        input.value = task.title;
        input.className = "edit-input";

        title.replaceWith(input);
        editButton.textContent = "Save";
        input.focus();

        editButton.onclick = function() {
            const newTitle = input.value.trim();

            if (!newTitle) {
                showToast("Task cannot be empty.");
                return;
            }

            editTask(task.id, newTitle);
            renderTasks();
            showToast("Task updated.");
        };
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function() {
        deleteTask(task.id);
        renderTasks();
        showToast("Task deleted.");
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    item.appendChild(checkButton);
    item.appendChild(title);
    item.appendChild(actions);

    return item;
}

function renderHabits() {
    const container = $("habitList");
    const today = getTodayKey();
    container.innerHTML = "";
    habits.forEach(function(habit) {
        const item = document.createElement("div");
        item.className = "habit-item";
        const completed = habit.completedDates.includes(today);
        if (completed) {
            item.classList.add("habit-completed");
        }
        const checkButton = document.createElement("button");
        checkButton.type = "button";
        checkButton.className = "habit-check";
        checkButton.textContent = completed ? "✓" : "";
        if (completed) {
            checkButton.classList.add("completed");
        }
        checkButton.addEventListener("click", function() {
            toggleHabit(habit.id, today);
            renderHabits();
            updateStatistics();
            showToast(
                completed
                    ? "Habit marked pending."
                    : "Habit completed!"
            );
        });
        const info = document.createElement("div");
        info.className = "habit-info";

        const name = document.createElement("span");
        name.className = "habit-name";
        name.textContent = habit.name;

        const category = document.createElement("span");
        category.className = "habit-category";
        category.textContent = habit.category;

        info.appendChild(name);
        info.appendChild(category);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "habit-delete";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteHabit(habit.id);
            renderHabits();
            updateStatistics();
            showToast("Habit deleted.");
        });
        item.appendChild(checkButton);
        item.appendChild(info);
        item.appendChild(deleteButton);
        container.appendChild(item);
    });
    $("habitCount").textContent =
        habits.length + (habits.length === 1 ? " habit" : " habits");

    if (habits.length === 0) {
        container.innerHTML = '<div class="empty-message">No habits yet.</div>';
    }
}

function updateStatistics() {
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(function(task) {
        return task.status === "completed";
    }).length;
    $("statTasks").textContent = completedTasks + "/" + totalTasks;
    if (totalTasks === 0) {
        $("statTasksText").textContent = "No tasks yet";
    } else if (completedTasks === totalTasks) {
        $("statTasksText").textContent = "All tasks completed";
    } else {
        $("statTasksText").textContent =
            totalTasks - completedTasks + " remaining";
    }

    const totalHabits = habits.length;

    const completedHabits = habits.filter(function(habit) {
        return habit.completedDates.includes(getTodayKey());
    }).length;

    $("statHabits").textContent = completedHabits + "/" + totalHabits;

    if (totalHabits === 0) {
        $("statHabitsText").textContent = "No habits yet";
    } else {
        $("statHabitsText").textContent =
            completedHabits + " completed today";
    }

    $("statWater").textContent = getWater() + " ml";

    const sleep = getSleep();

    $("statSleep").textContent =
        sleep ? sleep + "h" : "—";

    const taskScore =
        totalTasks === 0 ? 0: completedTasks / totalTasks;

    const habitScore =
        totalHabits === 0 ? 0 : completedHabits / totalHabits;

    let score;

    if (totalTasks === 0 && totalHabits === 0) {
        score = 0;
    }
     else if (totalTasks === 0) {
        score = habitScore * 100;
    } 
    else if (totalHabits === 0) {
        score = taskScore * 100;
    } 
    else {
        score = ((taskScore + habitScore) / 2) * 100;
    }
    $("dailyScore").textContent = Math.round(score) + "%";
}

function setupDragAndDrop() {
    const pendingContainer = $("pendingTasks");
    const completedContainer = $("completedTasks");
    pendingContainer.addEventListener("dragover", function(event) {
        event.preventDefault();
    });
    completedContainer.addEventListener("dragover", function(event) {
        event.preventDefault();
    });
    pendingContainer.addEventListener("drop", function(event) {
        event.preventDefault();
        const id = Number(event.dataTransfer.getData("text/plain"));
        moveTask(id, "pending");
        renderTasks();
        showToast("Task moved to pending.");
    });

    completedContainer.addEventListener("drop", function(event) {
        event.preventDefault();
        const id = Number(event.dataTransfer.getData("text/plain"));
        moveTask(id, "completed");
        renderTasks();
        showToast("Task completed!");
    });
}

$("taskForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const input = $("taskInput");
    const title = input.value.trim();

    if (!title) {
        showToast("Please enter a task.");
        return;
    }
    addTask(title);
    input.value = "";
    renderTasks();
    input.focus();
    showToast("Task added.");
});

$("habitForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const input = $("habitInput");
    const category = $("habitCategory");
    const name = input.value.trim();
    if (!name) {
        showToast("Please enter a habit.");
        return;
    }
    addHabit(name, category.value);
    input.value = "";
    renderHabits();
    updateStatistics();
    input.focus();
    showToast("Habit added.");
});

$("waterButton").addEventListener("click", function() {
    addWater();
    updateHealthTrackers();
    updateStatistics();
    showToast("250 ml added.");
});

$("sleepButton").addEventListener("click", function() {
    const input = $("sleepInput");
    const value = input.value;
    if (!value) {
        showToast("Enter your sleep hours.");
        return;
    }
    saveSleep(Number(value));
    updateHealthTrackers();
    updateStatistics();
    input.value = "";
    showToast("Sleep saved.");
});

$("calorieButton").addEventListener("click", function() {
    const input = $("calorieInput");
    const value = input.value;
    if (!value) {
        showToast("Enter your calories.");
        return;
    }
    saveCalories(Number(value));
    updateHealthTrackers();
    input.value = "";
    showToast("Calories saved.");
});

function updateHealthTrackers() {
    $("waterValue").textContent = getWater() + " ml";
    const sleep = getSleep();
    $("sleepValue").textContent =  sleep ? sleep + " hours" : "—";
    const calories = getCalories();
    $("calorieValue").textContent =  calories ? calories + " kcal" : "—";
}

displayCurrentDate();
loadTasks();
loadHabits();
renderTasks();
renderHabits();
updateHealthTrackers();
updateStatistics();
setupDragAndDrop();