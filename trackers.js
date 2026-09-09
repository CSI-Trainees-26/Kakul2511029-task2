function getTodayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function getWater() {
    const savedWater = localStorage.getItem("fitness_water");
    const water = savedWater ? JSON.parse(savedWater) : {};
    return water[getTodayKey()] || 0;
}

function addWater() {
    const savedWater = localStorage.getItem("fitness_water");
    const water = savedWater ? JSON.parse(savedWater) : {};
    const date = getTodayKey();
    water[date] = (water[date] || 0) + 250;
    localStorage.setItem("fitness_water", JSON.stringify(water));
}

function getWaterForDate(date) {
    const savedWater = localStorage.getItem("fitness_water");
    const water = savedWater ? JSON.parse(savedWater) : {};
    return water[date] || 0;
}

function getSleep() {
    const savedSleep = localStorage.getItem("fitness_sleep");
    const sleep = savedSleep ? JSON.parse(savedSleep) : {};
    return sleep[getTodayKey()] || "";
}

function saveSleep(hours) {
    const savedSleep = localStorage.getItem("fitness_sleep");
    const sleep = savedSleep ? JSON.parse(savedSleep) : {};
    sleep[getTodayKey()] = hours;
    localStorage.setItem("fitness_sleep", JSON.stringify(sleep));
}

function getCalories() {
    const savedCalories = localStorage.getItem("fitness_calories");
    const calories = savedCalories ? JSON.parse(savedCalories) : {};
    return calories[getTodayKey()] || "";
}

function saveCalories(value) {
    const savedCalories = localStorage.getItem("fitness_calories");
    const calories = savedCalories ? JSON.parse(savedCalories) : {};
    calories[getTodayKey()] = value;
    localStorage.setItem("fitness_calories", JSON.stringify(calories));
}