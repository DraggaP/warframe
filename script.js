// ============================================
// WARFRAME TRACKER - Application Logic
// ============================================

// --- Task Definitions ---

const weeklyTasks = [
    {
        id: 'eda',
        name: 'Elite Deep Archimedea',
        desc: 'Weekly endgame challenge',
        icon: 'fas fa-brain',
        color: '#e040fb',
        img: 'https://static.wikia.nocookie.net/warframe/images/4/4e/DeepArchimedea.png'
    },
    {
        id: 'eta',
        name: 'Elite Tactical Alert',
        desc: 'Tactical alert mission',
        icon: 'fas fa-crosshairs',
        color: '#ff5252',
        img: null
    },
    {
        id: 'netracell',
        name: 'Netracell',
        desc: 'Weekly Netracell mission',
        icon: 'fas fa-network-wired',
        color: '#00e5ff',
        img: null
    },
    {
        id: 'archon_hunt',
        name: 'Archon Hunt',
        desc: 'Weekly Archon boss fight',
        icon: 'fas fa-dragon',
        color: '#ff6e40',
        img: null
    },
    {
        id: 'calendar',
        name: 'Calendar Check',
        desc: 'Claim weekly calendar reward',
        icon: 'fas fa-calendar-alt',
        color: '#ffd54f',
        img: null
    },
    {
        id: 'acrithis',
        name: 'Check Acrithis',
        desc: 'Browse weekly wares for goodies',
        icon: 'fas fa-gem',
        color: '#69f0ae',
        img: null
    },
    {
        id: 'iron_wake',
        name: 'Iron Wake',
        desc: 'Kuva & Riven deals',
        icon: 'fas fa-skull',
        color: '#ff5252',
        img: null
    },
    {
        id: 'teshin',
        name: 'Check Teshin',
        desc: 'Steel Path weekly offerings',
        icon: 'fas fa-fist-raised',
        color: '#ffd54f',
        img: null
    },
    {
        id: 'yonta',
        name: 'Archimedian Yonta',
        desc: 'Weekly Kuva offering',
        icon: 'fas fa-flask',
        color: '#e040fb',
        img: null
    },
    {
        id: 'descendia_steel',
        name: 'Descendia (Steel Path)',
        desc: 'Steel Path weekly bounty',
        icon: 'fas fa-shield-alt',
        color: '#ff6e40',
        img: null
    },
    {
        id: 'descendia_base',
        name: 'Descendia (Base)',
        desc: 'Normal weekly bounty',
        icon: 'fas fa-shield',
        color: '#00e5ff',
        img: null
    },
    {
        id: 'ayatan_weekly',
        name: 'Ayatan Treasure',
        desc: 'Weekly Ayatan sculpture hunt',
        icon: 'fas fa-star',
        color: '#ffd54f',
        img: null
    },
    {
        id: 'bird3_archon',
        name: 'Bird 3 Archon Shard',
        desc: 'Weekly Archon Shard from Bird 3',
        icon: 'fas fa-feather',
        color: '#69f0ae',
        img: null
    },
    {
        id: 'kahl',
        name: 'Kahl Mission',
        desc: 'Weekly Kahl-175 mission',
        icon: 'fas fa-user-ninja',
        color: '#ff6e40',
        img: null
    },
    {
        id: 'clem',
        name: 'Clem Mission',
        desc: 'Weekly Clem survival',
        icon: 'fas fa-user-astronaut',
        color: '#00e5ff',
        img: null
    }
];

const dailyTasks = [
    {
        id: 'sorties',
        name: 'Sorties',
        desc: '3-stage daily mission',
        icon: 'fas fa-bomb',
        color: '#ff5252',
        img: null
    },
    {
        id: 'personal_syndicates',
        name: 'Syndicate Standing Cap',
        desc: 'Max out personal syndicates',
        icon: 'fas fa-handshake',
        color: '#e040fb',
        img: null
    },
    {
        id: 'openworld_syndicates',
        name: 'Open World Syndicates',
        desc: 'Cap open-world standing',
        icon: 'fas fa-globe',
        color: '#69f0ae',
        img: null
    },
    {
        id: 'daily_focus',
        name: 'Daily Focus Cap',
        desc: 'Max out daily focus',
        icon: 'fas fa-brain',
        color: '#00e5ff',
        img: null
    },
    {
        id: 'alerts',
        name: 'Check Alerts',
        desc: 'Look for valuable alerts',
        icon: 'fas fa-exclamation-triangle',
        color: '#ffd54f',
        img: null
    },
    {
        id: 'invasions',
        name: 'Check Invasions',
        desc: 'Farm invasion rewards',
        icon: 'fas fa-rocket',
        color: '#ff6e40',
        img: null
    },
    {
        id: 'simaris',
        name: 'Cephalon Simaris',
        desc: 'Daily Simaris standing',
        icon: 'fas fa-eye',
        color: '#ffd54f',
        img: null
    },
    {
        id: 'claim_forma',
        name: 'Claim / Build Forma',
        desc: 'Keep Forma production going',
        icon: 'fas fa-cube',
        color: '#00e5ff',
        img: null
    },
    {
        id: 'foundry_blueprints',
        name: 'Check Foundry',
        desc: 'Catalyst/Reactor blueprints',
        icon: 'fas fa-hammer',
        color: '#e040fb',
        img: null
    },
    {
        id: 'marie_ware',
        name: 'Marie Browse Ware',
        desc: 'Check Maroo for deals',
        icon: 'fas fa-shopping-cart',
        color: '#69f0ae',
        img: null
    },
    {
        id: 'computer_jawns',
        name: 'Computer Jawns',
        desc: 'Talk to them jawns on the computer',
        icon: 'fas fa-laptop',
        color: '#ff5252',
        img: null
    },
    {
        id: 'steelpath_incursions',
        name: 'Steel Path Incursions',
        desc: 'Daily Steel Path alerts',
        icon: 'fas fa-fire',
        color: '#ff6e40',
        img: null
    }
];

const boosterTypes = [
    {
        id: 'affinity',
        name: 'Affinity Booster',
        subtitle: '2x Affinity gains',
        icon: 'fas fa-graduation-cap',
        color: '#00e5ff',
        bgColor: 'rgba(0, 229, 255, 0.08)',
        borderColor: 'rgba(0, 229, 255, 0.2)',
        placeholder: 'e.g. Level up new frames at Hydron\nMax out focus schools\nForma builds on weapons...'
    },
    {
        id: 'credit',
        name: 'Credit Booster',
        subtitle: '2x Credit gains',
        icon: 'fas fa-coins',
        color: '#ffd54f',
        bgColor: 'rgba(255, 213, 79, 0.08)',
        borderColor: 'rgba(255, 213, 79, 0.2)',
        placeholder: 'e.g. Run Index for millions\nDo high-level bounties\nSell prime junk...'
    },
    {
        id: 'resource',
        name: 'Resource Booster',
        subtitle: '2x Resource drops',
        icon: 'fas fa-cubes',
        color: '#69f0ae',
        bgColor: 'rgba(105, 240, 174, 0.08)',
        borderColor: 'rgba(105, 240, 174, 0.2)',
        placeholder: 'e.g. Farm Kuva Survival\nStock up on Argon Crystals\nFarm Tellurium on Uranus...'
    },
    {
        id: 'mod_drop',
        name: 'Mod Drop Chance Booster',
        subtitle: '2x Mod drop chance',
        icon: 'fas fa-puzzle-piece',
        color: '#e040fb',
        bgColor: 'rgba(224, 64, 251, 0.08)',
        borderColor: 'rgba(224, 64, 251, 0.2)',
        placeholder: 'e.g. Farm Condition Overload at Deimos\nFarm rare Acolyte mods\nGet Galvanized mods from Arbitrations...'
    },
    {
        id: 'resource_drop',
        name: 'Resource Drop Chance Booster',
        subtitle: '2x Resource drop chance',
        icon: 'fas fa-diamond',
        color: '#ff6e40',
        bgColor: 'rgba(255, 110, 64, 0.08)',
        borderColor: 'rgba(255, 110, 64, 0.2)',
        placeholder: 'e.g. Farm Neurodes on Earth\nGet Orokin Cells at Ceres\nStock up on Neural Sensors...'
    }
];

// --- State Management ---

const STORAGE_PREFIX = 'wft_';

function getStore(key, fallback) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function setStore(key, value) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

// --- Utilities ---

function getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Set to Monday of the week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

function getDayKey(date) {
    return new Date(date).toISOString().split('T')[0];
}

function formatWeekLabel(weekKey) {
    const d = new Date(weekKey + 'T00:00:00');
    const options = { month: 'short', day: 'numeric' };
    const start = d.toLocaleDateString('en-US', options);
    const end = new Date(d.getTime() + 6 * 86400000);
    const endStr = end.toLocaleDateString('en-US', options);
    return `${start} - ${endStr}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateWeekIndicator();
    checkAutoResets();
    renderWeeklyTasks();
    renderDailyTasks();
    renderHistory();
    renderBoosters();
    renderEvents();
    updateProgress('weekly');
    updateProgress('daily');
    updateStreak();
    setupNavigation();
    setupResetButtons();
    setupEventModal();
}

// --- Week Indicator ---

function updateWeekIndicator() {
    const now = new Date();
    const weekKey = getWeekKey(now);
    const label = formatWeekLabel(weekKey);
    document.getElementById('currentWeek').textContent = label;
}

// --- Auto-Reset Logic ---

function checkAutoResets() {
    const now = new Date();
    const today = getDayKey(now);
    const currentWeek = getWeekKey(now);

    // Daily auto-reset
    const lastDailyReset = getStore('lastDailyReset', null);
    if (lastDailyReset !== today) {
        resetTaskStates('daily');
        setStore('lastDailyReset', today);
    }

    // Weekly auto-reset: archive and reset
    const lastWeeklyReset = getStore('lastWeeklyReset', null);
    if (lastWeeklyReset !== currentWeek) {
        // Archive previous week if there's data
        if (lastWeeklyReset) {
            archiveWeek(lastWeeklyReset);
        }
        resetTaskStates('weekly');
        setStore('lastWeeklyReset', currentWeek);
    }
}

function archiveWeek(weekKey) {
    const states = getStore('tasks_weekly', {});
    // Only archive if there's at least one completed task
    const hasCompleted = weeklyTasks.some(t => states[t.id] === true);
    if (!hasCompleted) return;

    const history = getStore('history', []);
    // Don't duplicate
    if (history.find(h => h.weekKey === weekKey)) return;

    const entry = {
        weekKey: weekKey,
        label: formatWeekLabel(weekKey),
        tasks: weeklyTasks.map(t => ({
            id: t.id,
            name: t.name,
            completed: states[t.id] === true
        })),
        completedCount: weeklyTasks.filter(t => states[t.id] === true).length,
        totalCount: weeklyTasks.length
    };

    history.unshift(entry);
    // Keep last 52 weeks
    if (history.length > 52) history.pop();
    setStore('history', history);
}

// --- Task Rendering ---

function renderWeeklyTasks() {
    const container = document.getElementById('weeklyTasks');
    container.innerHTML = '';
    const states = getStore('tasks_weekly', {});

    weeklyTasks.forEach(task => {
        const card = createTaskCard(task, 'weekly', states[task.id] === true);
        container.appendChild(card);
    });
}

function renderDailyTasks() {
    const container = document.getElementById('dailyTasks');
    container.innerHTML = '';
    const states = getStore('tasks_daily', {});

    dailyTasks.forEach(task => {
        const card = createTaskCard(task, 'daily', states[task.id] === true);
        container.appendChild(card);
    });
}

function createTaskCard(task, type, isCompleted) {
    const card = document.createElement('div');
    card.className = 'task-card' + (isCompleted ? ' completed' : '');
    card.dataset.taskId = task.id;
    card.dataset.type = type;

    const iconBg = task.color + '18'; // ~10% opacity hex
    const iconBorder = task.color + '30';

    card.innerHTML = `
        <div class="task-check"></div>
        <div class="task-icon-wrapper" style="background:${iconBg}; border: 1px solid ${iconBorder}; color:${task.color}">
            ${task.img
                ? `<img src="${task.img}" alt="${task.name}" onerror="this.parentElement.innerHTML='<i class=\\'${task.icon}\\'></i>'">`
                : `<i class="${task.icon}"></i>`
            }
        </div>
        <div class="task-info">
            <div class="task-name">${task.name}</div>
            ${task.desc ? `<div class="task-desc">${task.desc}</div>` : ''}
        </div>
    `;

    card.addEventListener('click', () => toggleTask(card, type, task.id));
    return card;
}

function toggleTask(card, type, taskId) {
    const states = getStore(`tasks_${type}`, {});
    const newState = !states[taskId];
    states[taskId] = newState;
    setStore(`tasks_${type}`, states);

    card.classList.toggle('completed', newState);
    updateProgress(type);

    // Auto-archive on weekly completion
    if (type === 'weekly') {
        updateStreak();
    }
}

// --- Progress ---

function updateProgress(type) {
    const tasks = type === 'weekly' ? weeklyTasks : dailyTasks;
    const states = getStore(`tasks_${type}`, {});
    const done = tasks.filter(t => states[t.id] === true).length;
    const total = tasks.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    // Update ring
    const ring = document.getElementById(`${type}ProgressRing`);
    const text = document.getElementById(`${type}ProgressText`);
    if (ring && text) {
        const circumference = 2 * Math.PI * 20; // r=20
        const offset = circumference - (pct / 100) * circumference;
        ring.style.strokeDashoffset = offset;
        text.textContent = `${pct}%`;
    }
}

// --- Streak ---

function updateStreak() {
    const history = getStore('history', []);
    let streak = 0;

    // Check current week too
    const currentWeek = getWeekKey(new Date());
    const currentStates = getStore('tasks_weekly', {});
    const currentDone = weeklyTasks.filter(t => currentStates[t.id] === true).length;
    if (currentDone === weeklyTasks.length) streak++;

    // Check history
    for (const entry of history) {
        if (entry.completedCount === entry.totalCount) {
            streak++;
        } else {
            break;
        }
    }

    document.getElementById('streakCount').textContent = streak;
    const badge = document.getElementById('streakBadge');
    badge.style.display = streak > 0 ? 'flex' : 'flex'; // always show
}

// --- Reset ---

function resetTaskStates(type) {
    setStore(`tasks_${type}`, {});
}

function setupResetButtons() {
    document.getElementById('resetWeekly').addEventListener('click', () => {
        if (!confirm('Reset all weekly tasks? This will archive your current progress.')) return;
        const weekKey = getWeekKey(new Date());
        archiveWeek(weekKey);
        resetTaskStates('weekly');
        renderWeeklyTasks();
        updateProgress('weekly');
        renderHistory();
        updateStreak();
    });

    document.getElementById('resetDaily').addEventListener('click', () => {
        if (!confirm('Reset all daily tasks?')) return;
        resetTaskStates('daily');
        renderDailyTasks();
        updateProgress('daily');
    });

    document.getElementById('clearHistory').addEventListener('click', () => {
        if (!confirm('Clear all history? This cannot be undone.')) return;
        setStore('history', []);
        renderHistory();
    });
}

// --- Navigation ---

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const panels = document.querySelectorAll('.tab-panel');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            navBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');
        });
    });
}

// --- History ---

function renderHistory() {
    const container = document.getElementById('historyContainer');
    const emptyEl = document.getElementById('historyEmpty');
    const history = getStore('history', []);

    // Remove old week cards (keep empty state)
    container.querySelectorAll('.history-week').forEach(el => el.remove());

    if (history.length === 0) {
        emptyEl.style.display = 'block';
        return;
    }

    emptyEl.style.display = 'none';

    history.forEach((entry, idx) => {
        const pct = Math.round((entry.completedCount / entry.totalCount) * 100);
        const weekEl = document.createElement('div');
        weekEl.className = 'history-week';

        weekEl.innerHTML = `
            <div class="history-week-header">
                <span class="history-week-title">${entry.label}</span>
                <div class="history-week-stats">
                    <span class="history-stat"><strong>${entry.completedCount}</strong>/${entry.totalCount}</span>
                    <div class="history-progress-bar">
                        <div class="history-progress-fill" style="width:${pct}%"></div>
                    </div>
                    <i class="fas fa-chevron-down history-chevron"></i>
                </div>
            </div>
            <div class="history-week-body">
                ${entry.tasks.map(t => `
                    <div class="history-task ${t.completed ? 'done' : 'missed'}">
                        <i class="fas ${t.completed ? 'fa-check' : 'fa-xmark'}"></i>
                        <span>${t.name}</span>
                    </div>
                `).join('')}
            </div>
        `;

        weekEl.querySelector('.history-week-header').addEventListener('click', () => {
            weekEl.classList.toggle('expanded');
        });

        container.appendChild(weekEl);
    });
}

// --- Boosters ---

function renderBoosters() {
    const container = document.getElementById('boostersGrid');
    container.innerHTML = '';
    const notes = getStore('booster_notes', {});

    boosterTypes.forEach(booster => {
        const card = document.createElement('div');
        card.className = 'booster-card';

        card.innerHTML = `
            <div class="booster-card-header">
                <div class="booster-icon" style="background:${booster.bgColor}; border: 1px solid ${booster.borderColor}; color:${booster.color}">
                    <i class="${booster.icon}"></i>
                </div>
                <div>
                    <div class="booster-name">${booster.name}</div>
                    <div class="booster-subtitle">${booster.subtitle}</div>
                </div>
            </div>
            <div class="booster-card-body">
                <div class="booster-notes-label">When I get this booster, I should:</div>
                <textarea
                    class="booster-notes"
                    data-booster-id="${booster.id}"
                    placeholder="${booster.placeholder}"
                >${notes[booster.id] || ''}</textarea>
            </div>
        `;

        const textarea = card.querySelector('.booster-notes');
        textarea.addEventListener('input', () => {
            const allNotes = getStore('booster_notes', {});
            allNotes[booster.id] = textarea.value;
            setStore('booster_notes', allNotes);
        });

        container.appendChild(card);
    });
}

// --- Events / Custom Tasks ---

function renderEvents() {
    const container = document.getElementById('eventsContainer');
    const emptyEl = document.getElementById('eventsEmpty');
    const events = getStore('events', []);

    container.querySelectorAll('.event-card').forEach(el => el.remove());

    if (events.length === 0) {
        emptyEl.style.display = 'block';
        return;
    }

    emptyEl.style.display = 'none';

    events.forEach(evt => {
        const completedCount = evt.tasks.filter(t => t.completed).length;
        const card = document.createElement('div');
        card.className = 'event-card';

        card.innerHTML = `
            <div class="event-card-header">
                <div class="event-card-header-left">
                    <div class="event-icon" style="background:${evt.color}22; border:1px solid ${evt.color}44; color:${evt.color}">
                        <i class="${evt.icon}"></i>
                    </div>
                    <div>
                        <div class="event-title" style="color:${evt.color}">${evt.name}</div>
                        <div class="event-progress-text">${completedCount}/${evt.tasks.length} completed</div>
                    </div>
                </div>
                <div class="event-card-actions">
                    <button title="Delete event" data-event-id="${evt.id}" class="delete-event-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="event-card-body">
                ${evt.tasks.map((t, i) => `
                    <div class="event-task ${t.completed ? 'completed' : ''}" data-event-id="${evt.id}" data-task-index="${i}">
                        <div class="event-task-check"></div>
                        <span class="event-task-name">${t.name}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Toggle event tasks
        card.querySelectorAll('.event-task').forEach(taskEl => {
            taskEl.addEventListener('click', () => {
                const eventId = taskEl.dataset.eventId;
                const taskIndex = parseInt(taskEl.dataset.taskIndex);
                toggleEventTask(eventId, taskIndex);
            });
        });

        // Delete event
        card.querySelector('.delete-event-btn').addEventListener('click', () => {
            if (!confirm(`Delete "${evt.name}"? This cannot be undone.`)) return;
            deleteEvent(evt.id);
        });

        container.appendChild(card);
    });
}

function toggleEventTask(eventId, taskIndex) {
    const events = getStore('events', []);
    const evt = events.find(e => e.id === eventId);
    if (!evt || !evt.tasks[taskIndex]) return;

    evt.tasks[taskIndex].completed = !evt.tasks[taskIndex].completed;
    setStore('events', events);
    renderEvents();
}

function deleteEvent(eventId) {
    let events = getStore('events', []);
    events = events.filter(e => e.id !== eventId);
    setStore('events', events);
    renderEvents();
}

function addEvent(name, icon, color, taskNames) {
    const events = getStore('events', []);
    events.push({
        id: generateId(),
        name: name,
        icon: icon,
        color: color,
        tasks: taskNames.map(n => ({ name: n.trim(), completed: false }))
    });
    setStore('events', events);
    renderEvents();
}

// --- Event Modal ---

function setupEventModal() {
    const modal = document.getElementById('eventModal');
    const openBtn = document.getElementById('addEventBtn');
    const closeBtn = document.getElementById('closeEventModal');
    const cancelBtn = document.getElementById('cancelEvent');
    const saveBtn = document.getElementById('saveEvent');
    const colorPicker = document.getElementById('eventColorPicker');

    let selectedColor = '#00e5ff';

    openBtn.addEventListener('click', () => {
        modal.classList.add('open');
        document.getElementById('eventName').value = '';
        document.getElementById('eventTasks').value = '';
        document.getElementById('eventIcon').selectedIndex = 0;
        // Reset color selection
        colorPicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        colorPicker.querySelector('[data-color="#00e5ff"]').classList.add('active');
        selectedColor = '#00e5ff';
    });

    const closeModal = () => modal.classList.remove('open');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Color picker
    colorPicker.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            colorPicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            selectedColor = swatch.dataset.color;
        });
    });

    saveBtn.addEventListener('click', () => {
        const name = document.getElementById('eventName').value.trim();
        const icon = document.getElementById('eventIcon').value;
        const tasksRaw = document.getElementById('eventTasks').value.trim();

        if (!name) { alert('Please enter an event name.'); return; }

        const taskNames = tasksRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (taskNames.length === 0) { alert('Please add at least one task.'); return; }

        addEvent(name, icon, selectedColor, taskNames);
        closeModal();
    });
}
