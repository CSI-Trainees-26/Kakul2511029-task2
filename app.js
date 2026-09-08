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

    const date = today.toLocaleDateString("en-IN", {
        weekday: "long",
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
    const pendingTasks = tasks.filter(function(task) {
        return task.status === "pending";
    });
    const completedTasks = tasks.filter(function(task) {
        return task.status === "completed";
    });
    pendingTasks.forEach(function(task) {
        pendingContainer.appendChild(createTaskElement(task));
    });
    completedTasks.forEach(function(task) {
        completedContainer.appendChild(createTaskElement(task));
    });
    $("pendingCount").textContent = pendingTasks.length;
    $("completedCount").textContent = completedTasks.length;
}

function createTaskElement(task) {
    const item = document.createElement("div");

    item.className = "task-item";
    item.draggable = true;

    if (task.status === "completed") {
        item.classList.add("completed-task");
    }

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    const actions = document.createElement("div");
    actions.className = "task-actions";
    const toggleButton = document.createElement("button");

    toggleButton.textContent =
        task.status === "pending" ? "Done" : "Undo";

    toggleButton.addEventListener("click", function() {
        toggleTaskStatus(task.id);
        renderTasks();
        updateStatistics();
        showToast("Task updated.");
    });

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function() {
        const newTitle = prompt("Edit task", task.title);
        if (newTitle && newTitle.trim() !== "") {
            editTask(task.id, newTitle.trim());
            renderTasks();
            showToast("Task updated.");
        }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function() {
        deleteTask(task.id);
        renderTasks();
        updateStatistics();
        showToast("Task deleted.");
    });

    actions.appendChild(toggleButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    item.appendChild(title);
    item.appendChild(actions);
    item.addEventListener("dragstart", function(event) {
        event.dataTransfer.setData("text/plain", task.id);
    });
    return item;
}

function renderHabits() {
    const container = $("habitList");
    container.innerHTML = "";

    habits.forEach(function(habit) {
        const item = document.createElement("div");
        item.className = "habit-item";
        const info = document.createElement("div");
        info.className = "habit-info";
        const name = document.createElement("strong");
        name.textContent = habit.name;
        const category = document.createElement("span");
        category.textContent = habit.category;
        info.appendChild(name);
        info.appendChild(category);
        const actions = document.createElement("div");
        actions.className = "habit-actions";
        const todayButton = document.createElement("button");
        const today = getTodayKey();
        todayButton.textContent =
            habit.completedDates.includes(today)
                ? "Completed"
                : "Complete";
        todayButton.addEventListener("click", function() {
            toggleHabit(habit.id, today);
            renderHabits();
            renderHabitActivity();
            updateStatistics();
            renderWeeklySummary();
            renderMonthlySummary();
        });
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            deleteHabit(habit.id);
            renderHabits();
            renderHabitActivity();
            updateStatistics();
            renderWeeklySummary();
            renderMonthlySummary();
            showToast("Habit deleted.");
        });

        actions.appendChild(todayButton);
        actions.appendChild(deleteButton);
        item.appendChild(info);
        item.appendChild(actions);
        container.appendChild(item);
    });
}

function renderHabitActivity() {
    const container = $("habitActivity");
    container.innerHTML = "";
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const dayNumber = String(date.getDate()).padStart(2, "0");
        const dateKey = year + "-" + month + "-" + dayNumber;
        const item = document.createElement("div");
        item.className = "activity-day";
        const name = document.createElement("span");
        name.textContent = date.toLocaleDateString("en-IN", {
            weekday: "short"
        });

        const number = document.createElement("strong");
        number.textContent = date.getDate();
        const dot = document.createElement("div");
        dot.className = "activity-dot";
        let completed = false;c
        habits.forEach(function(habit) {
            if (habit.completedDates.includes(dateKey)) {
                completed = true;
            }
        });

        if (completed) {
            dot.classList.add("completed");
        }

        item.appendChild(name);
        item.appendChild(number);
        item.appendChild(dot);

        container.appendChild(item);
    }
}

function updateStatistics() {
    const completedTasks = tasks.filter(function(task) {
        return task.status === "completed";
    }).length;

    const completedHabits = habits.filter(function(habit) {
        return habit.completedDates.includes(getTodayKey());
    }).length;

    $("taskCount").textContent = tasks.length;
    $("habitCount").textContent = habits.length;
    $("waterCount").textContent = getWater() + " ml";
    $("sleepCount").textContent = (getSleep() || 0) + " hrs";

    let score = 0;

    if (tasks.length > 0) {
        score += (completedTasks / tasks.length) * 40;
    }

    if (habits.length > 0) {
        score += (completedHabits / habits.length) * 40;
    }

    if (getWater() > 0) {
        score += 10;
    }

    if (getSleep() > 0) {
        score += 10;
    }

    $("dailyScore").textContent = Math.round(score) + "%";
}

function updateHealthTrackers() {
    $("waterAmount").textContent = getWater() + " ml";
    $("sleepAmount").textContent = (getSleep() || 0) + " hrs";
    $("calorieAmount").textContent = (getCalories() || 0) + " kcal";
}

function setupDragAndDrop() {
    const pending = $("pendingTasks");
    const completed = $("completedTasks");

    [pending, completed].forEach(function(container) {
        container.addEventListener("dragover", function(event) {
            event.preventDefault();
        });

        container.addEventListener("drop", function(event) {
            event.preventDefault();

            const id = Number(
                event.dataTransfer.getData("text/plain")
            );

            const status =
                container === pending
                    ? "pending"
                    : "completed";

            moveTask(id, status);

            renderTasks();
            updateStatistics();
            renderWeeklySummary();
            renderMonthlySummary();
        });
    });
}

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function renderWeeklySummary() {
    const daysContainer = $("weeklyDays");
    const gridContainer = $("weeklyGrid");

    daysContainer.innerHTML = "";
    gridContainer.innerHTML = "";

    for (let i = 6; i >= 0; i--) {
        const date = new Date();

        date.setDate(date.getDate() - i);

        const day = document.createElement("span");

        day.textContent = date.toLocaleDateString("en-IN", {
            weekday: "short"
        });

        daysContainer.appendChild(day);
    }

    for (let row = 0; row < 3; row++) {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();

            date.setDate(date.getDate() - i);

            const dateKey = getDateKey(date);

            const cell = document.createElement("div");

            cell.className = "weekly-cell";

            if (row === 0) {
                const completed = tasks.some(function(task) {
                    return task.status === "completed";
                });

                if (completed) {
                    cell.classList.add("medium");
                }
            }

            if (row === 1) {
                const completedHabits = habits.filter(function(habit) {
                    return habit.completedDates.includes(dateKey);
                }).length;

                if (completedHabits > 0) {
                    cell.classList.add("high");
                }
            }

            if (row === 2) {
                const savedWater = localStorage.getItem("fitness_water");
                const waterData = savedWater
                    ? JSON.parse(savedWater)
                    : {};

                const water = waterData[dateKey] || 0;

                if (water >= 500) {
                    cell.classList.add("high");
                } else if (water > 0) {
                    cell.classList.add("medium");
                } else {
                    cell.classList.add("low");
                }
            }

            gridContainer.appendChild(cell);
        }
    }
}

function renderMonthlySummary() {
    const container = $("monthlyGrid");

    container.innerHTML = "";

    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
        const date = new Date(
            year,
            month,
            dayNumber
        );

        const dateKey = getDateKey(date);

        const cell = document.createElement("div");

        cell.className = "monthly-cell";

        const activeHabit = habits.some(function(habit) {
            return habit.completedDates.includes(dateKey);
        });

        const savedWater = localStorage.getItem("fitness_water");
        const waterData = savedWater
            ? JSON.parse(savedWater)
            : {};

        const activeWater = waterData[dateKey] > 0;

        if (activeHabit || activeWater) {
            cell.classList.add("active");
        }

        container.appendChild(cell);
    }
}

$("taskForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const input = $("taskInput");
    const title = input.value.trim();

    if (title === "") return;

    addTask(title);

    input.value = "";

    renderTasks();
    updateStatistics();
    renderWeeklySummary();
    renderMonthlySummary();

    showToast("Task added.");
});

$("habitForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const input = $("habitInput");
    const category = $("habitCategory");

    const name = input.value.trim();

    if (name === "") return;

    addHabit(name, category.value);

    input.value = "";

    renderHabits();
    renderHabitActivity();
    updateStatistics();
    renderWeeklySummary();
    renderMonthlySummary();

    showToast("Habit added.");
});

$("waterButton").addEventListener("click", function() {
    addWater();

    updateHealthTrackers();
    updateStatistics();
    renderWeeklySummary();
    renderMonthlySummary();

    showToast("250 ml added.");
});

$("sleepForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const value = $("sleepInput").value;

    if (value === "") return;

    saveSleep(value);

    $("sleepInput").value = "";

    updateHealthTrackers();
    updateStatistics();

    showToast("Sleep saved.");
});

$("calorieForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const value = $("calorieInput").value;

    if (value === "") return;

    saveCalories(value);

    $("calorieInput").value = "";

    updateHealthTrackers();

    showToast("Calories saved.");
});

displayCurrentDate();

loadTasks();
loadHabits();

renderTasks();
renderHabits();
renderHabitActivity();
updateHealthTrackers();
updateStatistics();
setupDragAndDrop();
renderWeeklySummary();
renderMonthlySummary();