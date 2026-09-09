let timerSeconds = 25 * 60;
let timerInterval = null;
let selectedPomodoroTask = null;

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    $("timerDisplay").textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function loadPomodoroTasks() {
    const select = $("pomodoroTaskSelect");
    select.innerHTML = '<option value="">Select a task</option>';
    tasks.forEach(function(task) {
        if (task.status !== "completed") {
            const option = document.createElement("option");
            option.value = task.id;
            option.textContent = task.title;
            select.appendChild(option);
        }
    });
}

function startTimer() {
    const selectedTask = $("pomodoroTaskSelect").value;
    if (!selectedTask) {
        $("timerStatus").textContent = "Select a task first";
        return;
    }
    if (timerInterval !== null) {
        return;
    }

    selectedPomodoroTask = Number(selectedTask);
    $("timerStatus").textContent = "Focusing...";
    timerInterval = setInterval(function() {
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            $("timerStatus").textContent = "Focus session complete";
            completePomodoroTask(selectedPomodoroTask);
            return;
        }
        timerSeconds--;
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    if (timerInterval === null) {
        return;
    }
    clearInterval(timerInterval);
    timerInterval = null;
    $("timerStatus").textContent = "Paused";
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 25 * 60;
    selectedPomodoroTask = null;
    $("timerStatus").textContent = "Ready to focus";
    updateTimerDisplay();
}

function completePomodoroTask(taskId) {
    const task = tasks.find(function(task) {
        return task.id === taskId;
    });
    if (!task) return;
    task.pomodoros++;
    saveTasks();
    renderTasks();
    loadPomodoroTasks();
}