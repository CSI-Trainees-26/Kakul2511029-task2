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
    $("currentDate").textContent = today.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function renderTasks() {
    const pendingContainer = $("pendingTasks");
    const completedContainer = $("completedTasks");
    pendingContainer.innerHTML = "";
    completedContainer.innerHTML = "";
    tasks.forEach(function(task) {
        const item = document.createElement("div");
        item.className = "task-item";
        item.draggable = true;
        item.addEventListener("dragstart", function(event) {
            event.dataTransfer.setData("text/plain", task.id);
        });
        const checkButton = document.createElement("button");
        checkButton.className = "task-check";
        checkButton.type = "button";
        checkButton.textContent = task.status === "completed" ? "✓" : "";
        checkButton.addEventListener("click", function() {
            const wasCompleted = task.status === "completed";
            toggleTaskStatus(task.id);
            renderAll();
            showToast(wasCompleted ? "Task moved to pending."  : "Task completed!");
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
                renderAll();
                showToast("Task updated.");
            };
        });
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
            renderAll();
            showToast("Task deleted.");
        });
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        item.appendChild(checkButton);
        item.appendChild(title);
        item.appendChild(actions);
        if (task.status === "completed") {
            item.classList.add("completed-task");
            completedContainer.appendChild(item);
        }
         else {
            pendingContainer.appendChild(item);
        }
    });
    const pending = tasks.filter(function(task) {
        return task.status === "pending"; }).length;
    const completed = tasks.filter(function(task) {
        return task.status === "completed";
    }).length;
    $("pendingCount").textContent = pending;
    $("completedCount").textContent = completed;
    $("taskCount").textContent = tasks.length + (tasks.length === 1 ? " task" : " tasks");
    if (pending === 0) {pendingContainer.innerHTML = '<div class="empty-message">No pending tasks.</div>'; }
    if (completed === 0) {completedContainer.innerHTML = '<div class="empty-message">No completed tasks.</div>';}
    renderDashboardTasks();
}

function renderHabits() {
    const container = $("habitList");
    container.innerHTML = "";
    const today = getTodayKey();
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
        if (completed) {checkButton.classList.add("completed")}
        checkButton.addEventListener("click", function() {
            toggleHabit(habit.id, today);
            renderAll();
            showToast( completed ? "Habit marked pending." : "Habit completed!");
        });
        const info = document.createElement("div");
        info.className = "habit-info";
        const name = document.createElement("span");
        name.className = "habit-name";
        name.textContent = habit.name;
        info.appendChild(name);
        const actions = document.createElement("div");
        actions.className = "habit-actions";
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function() {
            const newName = prompt("Edit habit", habit.name);
            if (!newName || !newName.trim()) {
                return;
            }
            editHabit(habit.id, newName.trim());
            renderAll();
            showToast("Habit updated.");
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            deleteHabit(habit.id);
            renderAll();
            showToast("Habit deleted.");
        });
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        item.appendChild(checkButton);
        item.appendChild(info);
        item.appendChild(actions);
        container.appendChild(item);
    });

    $("habitCount").textContent = habits.length + (habits.length === 1 ? " habit" : " habits");

    if (habits.length === 0) { container.innerHTML = '<div class="empty-message">No habits yet.</div>' };
    renderDashboardHabits();
}

function updateStatistics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(function(task) {
        return task.status === "completed";
    }).length;
    $("statTasks").textContent = completedTasks + "/" + totalTasks;

    if (totalTasks === 0) {
        $("statTasksText").textContent = "No tasks yet";
    } 
    else if (completedTasks === totalTasks) {
        $("statTasksText").textContent = "All tasks completed";
    }
     else {
        $("statTasksText").textContent =
            totalTasks - completedTasks + " remaining";
    }
    const totalHabits = habits.length;
    const completedHabits = habits.filter(function(habit) {
        return habit.completedDates.includes(getTodayKey());
    }).length;

    $("statHabits").textContent =completedHabits + "/" + totalHabits;

    if (totalHabits === 0) {
        $("statHabitsText").textContent = "No habits yet";
    }
     else {
        $("statHabitsText").textContent =
            completedHabits + " completed today";
    }
    $("statWater").textContent = getWater() + " ml";
    const sleep = getSleep();
    $("statSleep").textContent = sleep ? sleep + "h" : "—";
    let taskScore = 0;
    let habitScore = 0;
    if (totalTasks > 0) {
        taskScore = completedTasks / totalTasks;
    }

    if (totalHabits > 0) {
        habitScore = completedHabits / totalHabits;
    }

    let score = 0;
    if (totalTasks > 0 && totalHabits > 0) {
        score = ((taskScore + habitScore) / 2) * 100;
    } 
    else if (totalTasks > 0) {
        score = taskScore * 100;
    } 
    else if (totalHabits > 0) {
        score = habitScore * 100;
    }

    $("dailyScore").textContent =
        Math.round(score) + "%";
}

function renderDashboardTasks() {
    const container = $("dashboardTasks");
    container.innerHTML = "";
    const recentTasks = tasks.slice(0, 4);
    if (recentTasks.length === 0) {
        container.innerHTML =
            '<div class="empty-message">No tasks yet.</div>';
        return;
    }

    recentTasks.forEach(function(task) {
        const item = document.createElement("div");
        item.className = "mini-task";
        item.textContent = task.status === "completed" ? "✓ " + task.title : task.title;
        container.appendChild(item);
    });
}

function renderDashboardHabits() {
    const container = $("dashboardHabits");
    container.innerHTML = "";
    if (habits.length === 0) {
        container.innerHTML =
            '<div class="empty-message">No habits yet.</div>';
        return;
    }
    const today = getTodayKey();
    habits.slice(0, 4).forEach(function(habit) {
        const item = document.createElement("div");
        item.className = "mini-habit";
        item.textContent = habit.completedDates.includes(today)  ? "✓ " + habit.name: habit.name;
        container.appendChild(item);
    });
}

function updateHealthTrackers() {
    $("waterValue").textContent =getWater() + " ml";
    const sleep = getSleep();
    $("sleepValue").textContent = sleep ? sleep + " hours" : "—";
    const calories = getCalories();
    $("calorieValue").textContent =calories ? calories + " kcal" : "—";
}

function renderHabitActivity() {
    const container = $("habitActivity");
    container.innerHTML = "";
    if (habits.length === 0) {
        container.innerHTML = '<div class="empty-message">No habit activity yet.</div>';
        return;
    }

    const today = new Date();
    habits.forEach(function(habit) {
        const row = document.createElement("div");
        row.className = "activity-row";
        const name = document.createElement("div");
        name.className = "activity-name";
        name.textContent = habit.name;
        const cells = document.createElement("div");
        cells.className = "activity-cells";
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const key = getDateKey(date);
            const cell = document.createElement("div");
            cell.className = "activity-cell";
            if (habit.completedDates.includes(key)) {
                cell.classList.add("active");
            }
            cells.appendChild(cell);
        }
        row.appendChild(name);
        row.appendChild(cells);
        container.appendChild(row);
    });
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
        renderAll();
        showToast("Task moved to pending.");
    });
    completedContainer.addEventListener("drop", function(event) {
        event.preventDefault();
        const id = Number(event.dataTransfer.getData("text/plain"));
        moveTask(id, "completed");
        renderAll();
        showToast("Task completed!");
    });
}

function renderWeeklySummary() {
    const daysContainer = $("weeklyDays");
    const gridContainer = $("weeklyGrid");
    daysContainer.innerHTML = "";
    gridContainer.innerHTML = "";
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const day = document.createElement("div");
        day.textContent = date.toLocaleDateString("en-US", {
            weekday: "short"
        });
        daysContainer.appendChild(day);
        let active = false;
        habits.forEach(function(habit) {
            if (habit.completedDates.includes(getDateKey(date))) {
                active = true;
            }
        });
        const cell = document.createElement("div");
        cell.className = "weekly-cell";
        if (active) {
            cell.classList.add("active");
        }
        gridContainer.appendChild(cell);
    }
}

function renderMonthlySummary() {
    const container = $("monthlyGrid");
    container.innerHTML = "";
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    $("monthlyTitle").textContent =
        today.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "monthly-cell empty";
        container.appendChild(emptyCell);
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const key = getDateKey(date);
        const cell = document.createElement("div");
        cell.className = "monthly-cell";
        cell.textContent = day;
        let active = false;
        habits.forEach(function(habit) {
            if (habit.completedDates.includes(key)) {
                active = true;
            }
        });
        if (active) {
            cell.classList.add("active");
        }
        container.appendChild(cell);
    }
}

function renderSavedQuotes() {
    const container = $("savedQuotesList");
    container.innerHTML = "";
    if (savedQuotes.length === 0) {
        container.innerHTML =
            '<div class="empty-message">No saved quotes yet.</div>';
        return;
    }
    savedQuotes.forEach(function(quote) {
        const box = document.createElement("div");
        box.className = "saved-quote";
        const text = document.createElement("p");
        text.textContent = quote.text;
        const author = document.createElement("span");
        author.textContent = "— " + quote.author;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Delete";
        button.addEventListener("click", function() {
            deleteQuote(quote.id);
            renderSavedQuotes();
            showToast("Quote deleted.");
        });

        box.appendChild(text);
        box.appendChild(author);
        box.appendChild(button);
        container.appendChild(box);
    });
}

function renderAll() {
    renderTasks();
    renderHabits();
    renderHabitActivity();
    updateHealthTrackers();
    updateStatistics();
    renderWeeklySummary();
    renderMonthlySummary();
    loadPomodoroTasks();
}

function setupNavigation() {
    const buttons = document.querySelectorAll(".nav-button");
    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            const sectionId =
                button.getAttribute("data-section");
            document
                .querySelectorAll(".content-section")
                .forEach(function(section) {
                    section.classList.remove("active-section");
                });
            $(sectionId).classList.add("active-section");
            buttons.forEach(function(item) {
                item.classList.remove("active");
            });
            button.classList.add("active");
        });
    });
}

function setupEventListeners() {
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
        renderAll();
        input.focus();
        showToast("Task added.");
    });
    $("habitForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const input = $("habitInput");
        const name = input.value.trim();
        if (!name) {
            showToast("Please enter a habit.");
            return;
        }
        addHabit(name);
        input.value = "";
        renderAll();
        input.focus();
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

    $("newQuoteButton").addEventListener("click", function() {
        getQuote();
    });

    $("saveQuoteButton").addEventListener("click", function() {
        const text = $("quoteText").textContent;
        const author = $("quoteAuthor").textContent.replace("— ", "");
        if (!text || text === "Click the button to get a quote.") {
            showToast("Get a quote first.");
            return;
        }
        addQuote(text, author);
        renderSavedQuotes();
        showToast("Quote saved.");
    });

    $("pomodoroTaskSelect").addEventListener("change", function() {
        if (timerInterval !== null) {
            resetTimer();
        }
    });

    $("startTimerButton").addEventListener("click", function() {
        startTimer();
    });

    $("pauseTimerButton").addEventListener("click", function() {
        pauseTimer();
    });

    $("resetTimerButton").addEventListener("click", function() {
        resetTimer();
    });
}
document.addEventListener("DOMContentLoaded", function() {
    displayCurrentDate();
    loadTasks();
    loadHabits();
    loadQuotes();
    setupNavigation();
    setupEventListeners();
    setupDragAndDrop();
    updateTimerDisplay();
    renderAll();
    renderSavedQuotes();
});