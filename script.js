// Warframe Reminder App JavaScript

const weeklyTasks = [
    { id: 'eda', name: 'EDA (Elite Deep Architecture)', icon: 'fas fa-brain' },
    { id: 'eta', name: 'ETA (Elite Tactical Assault)', icon: 'fas fa-crosshairs' },
    { id: 'netracell', name: 'Netracell', icon: 'fas fa-network-wired' },
    { id: 'archon_hunt', name: 'Archon Hunt', icon: 'fas fa-dragon' },
    { id: 'calendar', name: 'Calendar Check', icon: 'fas fa-calendar-alt' },
    { id: 'acrithis', name: 'Check Acrithis for Goodies', icon: 'fas fa-gem' },
    { id: 'iron_wake', name: 'Iron Wake (Kuva/Rivens)', icon: 'fas fa-skull' },
    { id: 'teshin', name: 'Check Teshin', icon: 'fas fa-fist-raised' },
    { id: 'yonta', name: 'Archimedian Yonta (Kuva)', icon: 'fas fa-flask' },
    { id: 'descendia_steel', name: 'Descendia Steel Path', icon: 'fas fa-shield-alt' },
    { id: 'descendia_base', name: 'Descendia Base Path', icon: 'fas fa-shield' },
    { id: 'ayatan_weekly', name: 'Ayatan Treasure Weekly', icon: 'fas fa-star' },
    { id: 'bird3_archon', name: 'Bird 3 Archon Shard', icon: 'fas fa-feather' },
    { id: 'kahl', name: 'Kahl Mission', icon: 'fas fa-user-ninja' },
    { id: 'clem', name: 'Clem Mission', icon: 'fas fa-user-astronaut' }
];

const dailyTasks = [
    { id: 'sorties', name: 'Sorties', icon: 'fas fa-bomb' },
    { id: 'personal_syndicates', name: 'Personal Syndicates Standing Cap', icon: 'fas fa-handshake' },
    { id: 'openworld_syndicates', name: 'Open World Syndicates Standing Cap', icon: 'fas fa-globe' },
    { id: 'daily_focus', name: 'Daily Focus Cap', icon: 'fas fa-brain' },
    { id: 'alerts', name: 'Check Alerts', icon: 'fas fa-exclamation-triangle' },
    { id: 'invasions', name: 'Check Invasions for Goodies', icon: 'fas fa-rocket' },
    { id: 'simaris', name: 'Cephalon Simaris Standing', icon: 'fas fa-eye' },
    { id: 'claim_forma', name: 'Claim Forma / Build Forma', icon: 'fas fa-cube' },
    { id: 'foundry_blueprints', name: 'Check Foundry (Catalyst/Reactor Blueprints)', icon: 'fas fa-hammer' },
    { id: 'marie_ware', name: 'Marie Browse Ware', icon: 'fas fa-shopping-cart' },
    { id: 'computer_jawns', name: 'Computer Talking to Them Jawns', icon: 'fas fa-laptop' },
    { id: 'steelpath_incursions', name: 'Steel Path Incursions', icon: 'fas fa-fire' }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderTasks();
    loadTaskStates();
    setupEventListeners();
});

function renderTasks() {
    const weeklyContainer = document.getElementById('weeklyTasks');
    const dailyContainer = document.getElementById('dailyTasks');

    // Render weekly tasks
    weeklyTasks.forEach(task => {
        const taskElement = createTaskElement(task, 'weekly');
        weeklyContainer.appendChild(taskElement);
    });

    // Render daily tasks
    dailyTasks.forEach(task => {
        const taskElement = createTaskElement(task, 'daily');
        dailyContainer.appendChild(taskElement);
    });
}

function createTaskElement(task, type) {
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors';
    
    div.innerHTML = `
        <input type="checkbox" 
               id="${type}_${task.id}" 
               class="task-checkbox text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
               data-type="${type}"
               data-task-id="${task.id}">
        <label for="${type}_${task.id}" class="flex items-center space-x-2 cursor-pointer flex-1">
            <i class="${task.icon} text-gray-400 w-5"></i>
            <span class="text-gray-200">${task.name}</span>
        </label>
    `;
    
    return div;
}

function setupEventListeners() {
    // Add event listeners to all checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveTaskState(this.dataset.type, this.dataset.taskId, this.checked);
        });
    });

    // Reset buttons
    document.getElementById('resetWeekly').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all weekly tasks?')) {
            resetTasks('weekly');
        }
    });

    document.getElementById('resetDaily').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all daily tasks?')) {
            resetTasks('daily');
        }
    });
}

function saveTaskState(type, taskId, isChecked) {
    const key = `warframe_${type}_${taskId}`;
    localStorage.setItem(key, isChecked);
}

function loadTaskStates() {
    // Load weekly task states
    weeklyTasks.forEach(task => {
        const key = `warframe_weekly_${task.id}`;
        const isChecked = localStorage.getItem(key) === 'true';
        const checkbox = document.getElementById(`weekly_${task.id}`);
        if (checkbox) {
            checkbox.checked = isChecked;
        }
    });

    // Load daily task states
    dailyTasks.forEach(task => {
        const key = `warframe_daily_${task.id}`;
        const isChecked = localStorage.getItem(key) === 'true';
        const checkbox = document.getElementById(`daily_${task.id}`);
        if (checkbox) {
            checkbox.checked = isChecked;
        }
    });
}

function resetTasks(type) {
    const tasks = type === 'weekly' ? weeklyTasks : dailyTasks;
    
    tasks.forEach(task => {
        const key = `warframe_${type}_${task.id}`;
        localStorage.removeItem(key);
        const checkbox = document.getElementById(`${type}_${task.id}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
}

// Auto-reset daily tasks at midnight (optional enhancement)
function checkAndResetDailyTasks() {
    const lastReset = localStorage.getItem('warframe_daily_last_reset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
        resetTasks('daily');
        localStorage.setItem('warframe_daily_last_reset', today);
    }
}

// Check for daily reset on page load
checkAndResetDailyTasks();
