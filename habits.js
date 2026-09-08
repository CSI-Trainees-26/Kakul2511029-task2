let habits = [];

function loadHabits() {
    const savedHabits = localStorage.getItem("fitness_habits");
    habits = savedHabits ? JSON.parse(savedHabits) : [];
}

function saveHabits() {
    localStorage.setItem("fitness_habits", JSON.stringify(habits));
}

function addHabit(name, category) {
    const habit = {
        id: Date.now(),
        name: name,
        category: category,
        completedDates: []
    };
    habits.push(habit);
    saveHabits();
}

function deleteHabit(id) {
    habits = habits.filter(function(habit) {
        return habit.id !== id;
    });
    saveHabits();
}

function toggleHabit(id, date) {
    const habit = habits.find(function(habit) {
        return habit.id === id;
    });

    if (!habit) return;

    if (habit.completedDates.includes(date)) {
        habit.completedDates = habit.completedDates.filter(function(item) {
            return item !== date;
        });
    } else {
        habit.completedDates.push(date);
    }

    saveHabits();
}