// ============================================
// WARFRAME TRACKER - Application Logic
// ============================================

const API_BASE = 'https://api.warframestat.us/pc';

// --- Task Definitions ---

const weeklyTasks = [
    { id: 'eda', name: 'Elite Deep Archimedea', desc: 'Weekly endgame challenge', icon: 'fas fa-brain', color: '#e040fb' },
    { id: 'eta', name: 'Elite Tactical Alert', desc: 'Tactical alert mission', icon: 'fas fa-crosshairs', color: '#ff5252' },
    { id: 'netracell', name: 'Netracell', desc: 'Weekly Netracell mission', icon: 'fas fa-network-wired', color: '#00e5ff' },
    { id: 'archon_hunt', name: 'Archon Hunt', desc: 'Weekly Archon boss fight', icon: 'fas fa-dragon', color: '#ff6e40' },
    { id: 'calendar', name: 'Calendar Check', desc: 'Claim weekly calendar reward', icon: 'fas fa-calendar-alt', color: '#ffd54f' },
    { id: 'acrithis', name: 'Check Acrithis', desc: 'Browse weekly wares', icon: 'fas fa-gem', color: '#69f0ae' },
    { id: 'iron_wake', name: 'Iron Wake', desc: 'Kuva & Riven deals', icon: 'fas fa-skull', color: '#ff5252' },
    { id: 'teshin', name: 'Check Teshin', desc: 'Steel Path weekly offerings', icon: 'fas fa-fist-raised', color: '#ffd54f' },
    { id: 'yonta', name: 'Archimedian Yonta', desc: 'Weekly Kuva offering', icon: 'fas fa-flask', color: '#e040fb' },
    { id: 'descendia_steel', name: 'Descendia (Steel Path)', desc: 'Steel Path weekly bounty', icon: 'fas fa-shield-alt', color: '#ff6e40' },
    { id: 'descendia_base', name: 'Descendia (Base)', desc: 'Normal weekly bounty', icon: 'fas fa-shield', color: '#00e5ff' },
    { id: 'ayatan_weekly', name: 'Ayatan Treasure', desc: 'Weekly Ayatan sculpture hunt', icon: 'fas fa-star', color: '#ffd54f' },
    { id: 'bird3_archon', name: 'Bird 3 Archon Shard', desc: 'Weekly Archon Shard', icon: 'fas fa-feather', color: '#69f0ae' },
    { id: 'kahl', name: 'Kahl Mission', desc: 'Weekly Kahl-175 mission', icon: 'fas fa-user-ninja', color: '#ff6e40' },
    { id: 'clem', name: 'Clem Mission', desc: 'Weekly Clem survival', icon: 'fas fa-user-astronaut', color: '#00e5ff' }
];

const dailyTasks = [
    { id: 'sorties', name: 'Sorties', desc: '3-stage daily mission', icon: 'fas fa-bomb', color: '#ff5252' },
    { id: 'personal_syndicates', name: 'Syndicate Standing Cap', desc: 'Max out personal syndicates', icon: 'fas fa-handshake', color: '#e040fb' },
    { id: 'openworld_syndicates', name: 'Open World Syndicates', desc: 'Cap open-world standing', icon: 'fas fa-globe', color: '#69f0ae' },
    { id: 'daily_focus', name: 'Daily Focus Cap', desc: 'Max out daily focus', icon: 'fas fa-brain', color: '#00e5ff' },
    { id: 'alerts', name: 'Check Alerts', desc: 'Look for valuable alerts', icon: 'fas fa-exclamation-triangle', color: '#ffd54f' },
    { id: 'invasions', name: 'Check Invasions', desc: 'Farm invasion rewards', icon: 'fas fa-rocket', color: '#ff6e40' },
    { id: 'simaris', name: 'Cephalon Simaris', desc: 'Daily Simaris standing', icon: 'fas fa-eye', color: '#ffd54f' },
    { id: 'claim_forma', name: 'Claim / Build Forma', desc: 'Keep Forma production going', icon: 'fas fa-cube', color: '#00e5ff' },
    { id: 'foundry_blueprints', name: 'Check Foundry', desc: 'Catalyst/Reactor blueprints', icon: 'fas fa-hammer', color: '#e040fb' },
    { id: 'marie_ware', name: 'Marie Browse Ware', desc: 'Check Maroo for deals', icon: 'fas fa-shopping-cart', color: '#69f0ae' },
    { id: 'computer_jawns', name: 'Computer Jawns', desc: 'Talk to them jawns', icon: 'fas fa-laptop', color: '#ff5252' },
    { id: 'steelpath_incursions', name: 'Steel Path Incursions', desc: 'Daily Steel Path alerts', icon: 'fas fa-fire', color: '#ff6e40' }
];

const boosterTypes = [
    { id: 'affinity', name: 'Affinity Booster', subtitle: '2x Affinity gains', icon: 'fas fa-graduation-cap', color: '#00e5ff', bgColor: 'rgba(0, 229, 255, 0.08)', borderColor: 'rgba(0, 229, 255, 0.2)', placeholder: 'e.g. Level up new frames at Hydron\nMax out focus schools\nForma builds on weapons...' },
    { id: 'credit', name: 'Credit Booster', subtitle: '2x Credit gains', icon: 'fas fa-coins', color: '#ffd54f', bgColor: 'rgba(255, 213, 79, 0.08)', borderColor: 'rgba(255, 213, 79, 0.2)', placeholder: 'e.g. Run Index for millions\nDo high-level bounties\nSell prime junk...' },
    { id: 'resource', name: 'Resource Booster', subtitle: '2x Resource drops', icon: 'fas fa-cubes', color: '#69f0ae', bgColor: 'rgba(105, 240, 174, 0.08)', borderColor: 'rgba(105, 240, 174, 0.2)', placeholder: 'e.g. Farm Kuva Survival\nStock up on Argon Crystals\nFarm Tellurium on Uranus...' },
    { id: 'mod_drop', name: 'Mod Drop Chance Booster', subtitle: '2x Mod drop chance', icon: 'fas fa-puzzle-piece', color: '#e040fb', bgColor: 'rgba(224, 64, 251, 0.08)', borderColor: 'rgba(224, 64, 251, 0.2)', placeholder: 'e.g. Farm Condition Overload at Deimos\nFarm rare Acolyte mods...' },
    { id: 'resource_drop', name: 'Resource Drop Chance Booster', subtitle: '2x Resource drop chance', icon: 'fas fa-diamond', color: '#ff6e40', bgColor: 'rgba(255, 110, 64, 0.08)', borderColor: 'rgba(255, 110, 64, 0.2)', placeholder: 'e.g. Farm Neurodes on Earth\nGet Orokin Cells at Ceres...' }
];

// --- State Management ---

const STORAGE_PREFIX = 'wft_';

function getStore(key, fallback) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
}

function setStore(key, value) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

// --- Utilities ---

function getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
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
    const end = new Date(d.getTime() + 6 * 86400000).toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function timeUntil(expiryStr) {
    const now = Date.now();
    const expiry = new Date(expiryStr).getTime();
    const diff = expiry - now;
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 24) {
        const d = Math.floor(h / 24);
        return `${d}d ${h % 24}h`;
    }
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function relativeDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================

let worldStateData = null;
let fissureFilterValue = 'all';

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
    setupWorldState();
    fetchWorldState();
}

// --- Week Indicator ---

function updateWeekIndicator() {
    const weekKey = getWeekKey(new Date());
    document.getElementById('currentWeek').textContent = formatWeekLabel(weekKey);
}

// --- Auto-Reset ---

function checkAutoResets() {
    const now = new Date();
    const today = getDayKey(now);
    const currentWeek = getWeekKey(now);

    const lastDailyReset = getStore('lastDailyReset', null);
    if (lastDailyReset !== today) {
        resetTaskStates('daily');
        setStore('lastDailyReset', today);
    }

    const lastWeeklyReset = getStore('lastWeeklyReset', null);
    if (lastWeeklyReset !== currentWeek) {
        if (lastWeeklyReset) archiveWeek(lastWeeklyReset);
        resetTaskStates('weekly');
        setStore('lastWeeklyReset', currentWeek);
    }
}

function archiveWeek(weekKey) {
    const states = getStore('tasks_weekly', {});
    const hasCompleted = weeklyTasks.some(t => states[t.id] === true);
    if (!hasCompleted) return;

    const history = getStore('history', []);
    if (history.find(h => h.weekKey === weekKey)) return;

    history.unshift({
        weekKey,
        label: formatWeekLabel(weekKey),
        tasks: weeklyTasks.map(t => ({ id: t.id, name: t.name, completed: states[t.id] === true })),
        completedCount: weeklyTasks.filter(t => states[t.id] === true).length,
        totalCount: weeklyTasks.length
    });

    if (history.length > 52) history.pop();
    setStore('history', history);
}

// --- Task Rendering ---

function renderWeeklyTasks() {
    const container = document.getElementById('weeklyTasks');
    container.innerHTML = '';
    const states = getStore('tasks_weekly', {});
    weeklyTasks.forEach(task => container.appendChild(createTaskCard(task, 'weekly', states[task.id] === true)));
}

function renderDailyTasks() {
    const container = document.getElementById('dailyTasks');
    container.innerHTML = '';
    const states = getStore('tasks_daily', {});
    dailyTasks.forEach(task => container.appendChild(createTaskCard(task, 'daily', states[task.id] === true)));
}

function createTaskCard(task, type, isCompleted) {
    const card = document.createElement('div');
    card.className = 'task-card' + (isCompleted ? ' completed' : '');
    card.dataset.taskId = task.id;
    card.dataset.type = type;

    card.innerHTML = `
        <div class="task-check"></div>
        <div class="task-icon-wrapper" style="background:${task.color}18; border: 1px solid ${task.color}30; color:${task.color}">
            <i class="${task.icon}"></i>
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
    states[taskId] = !states[taskId];
    setStore(`tasks_${type}`, states);
    card.classList.toggle('completed', states[taskId]);
    updateProgress(type);
    if (type === 'weekly') updateStreak();
}

// --- Progress ---

function updateProgress(type) {
    const tasks = type === 'weekly' ? weeklyTasks : dailyTasks;
    const states = getStore(`tasks_${type}`, {});
    const done = tasks.filter(t => states[t.id] === true).length;
    const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

    const ring = document.getElementById(`${type}ProgressRing`);
    const text = document.getElementById(`${type}ProgressText`);
    if (ring && text) {
        const circumference = 2 * Math.PI * 20;
        ring.style.strokeDashoffset = circumference - (pct / 100) * circumference;
        text.textContent = `${pct}%`;
    }
}

// --- Streak ---

function updateStreak() {
    const history = getStore('history', []);
    let streak = 0;
    const currentStates = getStore('tasks_weekly', {});
    if (weeklyTasks.every(t => currentStates[t.id] === true)) streak++;
    for (const entry of history) {
        if (entry.completedCount === entry.totalCount) streak++;
        else break;
    }
    document.getElementById('streakCount').textContent = streak;
}

// --- Reset ---

function resetTaskStates(type) { setStore(`tasks_${type}`, {}); }

function setupResetButtons() {
    document.getElementById('resetWeekly').addEventListener('click', () => {
        if (!confirm('Reset all weekly tasks? This will archive your current progress.')) return;
        archiveWeek(getWeekKey(new Date()));
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
            navBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });
}

// --- History ---

function renderHistory() {
    const container = document.getElementById('historyContainer');
    const emptyEl = document.getElementById('historyEmpty');
    const history = getStore('history', []);

    container.querySelectorAll('.history-week').forEach(el => el.remove());

    if (history.length === 0) { emptyEl.style.display = 'block'; return; }
    emptyEl.style.display = 'none';

    history.forEach(entry => {
        const pct = Math.round((entry.completedCount / entry.totalCount) * 100);
        const el = document.createElement('div');
        el.className = 'history-week';
        el.innerHTML = `
            <div class="history-week-header">
                <span class="history-week-title">${entry.label}</span>
                <div class="history-week-stats">
                    <span class="history-stat"><strong>${entry.completedCount}</strong>/${entry.totalCount}</span>
                    <div class="history-progress-bar"><div class="history-progress-fill" style="width:${pct}%"></div></div>
                    <i class="fas fa-chevron-down history-chevron"></i>
                </div>
            </div>
            <div class="history-week-body">
                ${entry.tasks.map(t => `<div class="history-task ${t.completed ? 'done' : 'missed'}"><i class="fas ${t.completed ? 'fa-check' : 'fa-xmark'}"></i><span>${t.name}</span></div>`).join('')}
            </div>
        `;
        el.querySelector('.history-week-header').addEventListener('click', () => el.classList.toggle('expanded'));
        container.appendChild(el);
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
                <textarea class="booster-notes" data-booster-id="${booster.id}" placeholder="${booster.placeholder}">${notes[booster.id] || ''}</textarea>
            </div>
        `;
        card.querySelector('.booster-notes').addEventListener('input', function () {
            const allNotes = getStore('booster_notes', {});
            allNotes[booster.id] = this.value;
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

    if (events.length === 0) { emptyEl.style.display = 'block'; return; }
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
                        <div class="event-title" style="color:${evt.color}">${escapeHtml(evt.name)}</div>
                        <div class="event-progress-text">${completedCount}/${evt.tasks.length} completed</div>
                    </div>
                </div>
                <div class="event-card-actions">
                    <button title="Delete event" data-event-id="${evt.id}" class="delete-event-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="event-card-body">
                ${evt.tasks.map((t, i) => `
                    <div class="event-task ${t.completed ? 'completed' : ''}" data-event-id="${evt.id}" data-task-index="${i}">
                        <div class="event-task-check"></div>
                        <span class="event-task-name">${escapeHtml(t.name)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        card.querySelectorAll('.event-task').forEach(taskEl => {
            taskEl.addEventListener('click', () => toggleEventTask(taskEl.dataset.eventId, parseInt(taskEl.dataset.taskIndex)));
        });
        card.querySelector('.delete-event-btn').addEventListener('click', () => {
            if (confirm(`Delete "${evt.name}"?`)) deleteEvent(evt.id);
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
    setStore('events', getStore('events', []).filter(e => e.id !== eventId));
    renderEvents();
}

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
        colorPicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        colorPicker.querySelector('[data-color="#00e5ff"]').classList.add('active');
        selectedColor = '#00e5ff';
    });

    const closeModal = () => modal.classList.remove('open');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

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

        const events = getStore('events', []);
        events.push({ id: generateId(), name, icon, color: selectedColor, tasks: taskNames.map(n => ({ name: n, completed: false })) });
        setStore('events', events);
        renderEvents();
        closeModal();
    });
}

// ============================================
// WORLD STATE - API Integration
// ============================================

function setupWorldState() {
    document.getElementById('refreshWorldState').addEventListener('click', () => fetchWorldState());

    document.getElementById('fissureFilter').addEventListener('change', function () {
        fissureFilterValue = this.value;
        if (worldStateData) renderFissures(worldStateData.fissures);
    });
}

async function fetchWorldState() {
    try {
        const res = await fetch(API_BASE, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        worldStateData = await res.json();
        renderStatusBar(worldStateData);
        renderWorldStateCards(worldStateData);
    } catch (err) {
        console.error('Failed to fetch world state:', err);
    }

    // Refresh every 60s
    setTimeout(fetchWorldState, 60000);
}

// ============================================
// STATUS BAR - Live Cycles
// ============================================

function renderStatusBar(data) {
    // Cetus
    updateChip('chip-cetus', data.cetusCycle, {
        stateClass: data.cetusCycle?.isDay ? 'state-day' : 'state-night',
        icon: data.cetusCycle?.isDay ? 'fas fa-sun' : 'fas fa-moon',
        value: `${capitalize(data.cetusCycle?.state)} ${data.cetusCycle?.timeLeft || ''}`
    });

    // Earth
    updateChip('chip-earth', data.earthCycle, {
        stateClass: data.earthCycle?.isDay ? 'state-day' : 'state-night',
        icon: data.earthCycle?.isDay ? 'fas fa-sun' : 'fas fa-moon',
        value: `${capitalize(data.earthCycle?.state)} ${data.earthCycle?.timeLeft || ''}`
    });

    // Vallis
    updateChip('chip-vallis', data.vallisCycle, {
        stateClass: data.vallisCycle?.isWarm ? 'state-warm' : 'state-cold',
        icon: data.vallisCycle?.isWarm ? 'fas fa-temperature-high' : 'fas fa-snowflake',
        value: `${capitalize(data.vallisCycle?.state)} ${timeUntil(data.vallisCycle?.expiry)}`
    });

    // Cambion
    updateChip('chip-cambion', data.cambionCycle, {
        stateClass: `state-${data.cambionCycle?.state}`,
        icon: data.cambionCycle?.state === 'fass' ? 'fas fa-sun' : 'fas fa-moon',
        value: `${capitalize(data.cambionCycle?.state)} ${data.cambionCycle?.timeLeft || ''}`
    });

    // Zariman
    updateChip('chip-zariman', data.zarimanCycle, {
        stateClass: `state-${data.zarimanCycle?.state}`,
        icon: data.zarimanCycle?.isCorpus ? 'fas fa-building' : 'fas fa-skull-crossbones',
        value: `${capitalize(data.zarimanCycle?.state)} ${data.zarimanCycle?.timeLeft || ''}`
    });

    // Duviri
    updateChip('chip-duviri', data.duviriCycle, {
        stateClass: '',
        icon: 'fas fa-masks-theater',
        value: capitalize(data.duviriCycle?.state || '--')
    });

    // Baro
    const baro = data.voidTrader;
    if (baro) {
        const now = Date.now();
        const arrival = new Date(baro.activation).getTime();
        const departure = new Date(baro.expiry).getTime();
        const isHere = now >= arrival && now < departure;

        const chipEl = document.getElementById('chip-baro');
        chipEl.className = 'status-chip ' + (isHere ? 'chip-accent' : 'chip-accent');
        chipEl.querySelector('i').className = 'fas fa-gem';
        chipEl.querySelector('.chip-value').textContent = isHere
            ? `HERE - ${baro.location || ''} (${timeUntil(baro.expiry)})`
            : `In ${timeUntil(baro.activation)}`;
        chipEl.classList.remove('loading');
    }

    // Construction
    const cp = data.constructionProgress;
    if (cp) {
        const chipEl = document.getElementById('chip-construction');
        const fomorian = parseFloat(cp.fomorianProgress) || 0;
        const razorback = parseFloat(cp.razorbackProgress) || 0;
        chipEl.querySelector('.chip-label').textContent = 'Build';
        chipEl.querySelector('.chip-value').textContent = `F:${fomorian.toFixed(0)}% R:${razorback.toFixed(0)}%`;
        chipEl.className = 'status-chip' + (fomorian > 80 || razorback > 80 ? ' chip-danger' : '');
        chipEl.classList.remove('loading');
    }
}

function updateChip(chipId, data, opts) {
    const el = document.getElementById(chipId);
    if (!el || !data) return;
    el.className = 'status-chip ' + (opts.stateClass || '');
    el.querySelector('i').className = opts.icon;
    el.querySelector('.chip-value').textContent = opts.value;
    el.classList.remove('loading');
}

function capitalize(str) {
    if (!str) return '--';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// WORLD STATE CARDS - Full Detail
// ============================================

function renderWorldStateCards(data) {
    renderSortie(data.sortie);
    renderArchonHunt(data.archonHunt);
    renderSteelPath(data.steelPath);
    renderArbitration(data.arbitration);
    renderVoidTrader(data.voidTrader);
    renderDailyDeals(data.dailyDeals);
    renderDuviriDetails(data.duviriCycle);
    renderConstruction(data.constructionProgress);
    renderNightwave(data.nightwave);
    renderFissures(data.fissures);
    renderInvasions(data.invasions);
    renderActiveEvents(data.events);
    renderNews(data.news);
}

// --- Sortie ---

function renderSortie(sortie) {
    const body = document.querySelector('#ws-sortie .ws-card-body');
    if (!sortie || !sortie.variants || sortie.variants.length === 0) {
        body.innerHTML = '<div class="ws-empty">No sortie data available</div>';
        return;
    }

    body.innerHTML = `
        <div class="ws-label">Expires ${timeUntil(sortie.expiry)}</div>
        ${sortie.variants.map((v, i) => `
            <div class="ws-row">
                <div class="ws-row-left">
                    <i class="fas fa-crosshairs" style="color:${['#69f0ae', '#ffd54f', '#ff5252'][i]}"></i>
                    <span class="ws-row-text"><span class="ws-highlight">${v.missionType}</span> - ${v.modifier}</span>
                </div>
            </div>
        `).join('')}
    `;
    body.classList.remove('ws-loading');
}

// --- Archon Hunt ---

function renderArchonHunt(archon) {
    const body = document.querySelector('#ws-archon .ws-card-body');
    if (!archon) {
        body.innerHTML = '<div class="ws-empty">No data</div>';
        return;
    }

    const missions = archon.missions || archon.variants || [];
    body.innerHTML = `
        <div class="ws-label">Expires ${timeUntil(archon.expiry)}</div>
        ${missions.map((m, i) => `
            <div class="ws-row">
                <div class="ws-row-left">
                    <i class="fas fa-${i === missions.length - 1 ? 'dragon' : 'circle'}" style="color:${i === missions.length - 1 ? '#ff6e40' : '#8899aa'}; font-size:${i === missions.length - 1 ? '0.7rem' : '0.4rem'}"></i>
                    <span class="ws-row-text"><span class="ws-highlight">${m.type || m.missionType || 'Unknown'}</span> - ${m.node || ''}</span>
                </div>
            </div>
        `).join('')}
    `;
    body.classList.remove('ws-loading');
}

// --- Steel Path ---

function renderSteelPath(sp) {
    const body = document.querySelector('#ws-steelpath .ws-card-body');
    if (!sp) {
        body.innerHTML = '<div class="ws-empty">No data</div>';
        return;
    }

    body.innerHTML = `
        <div class="ws-label">Current Reward</div>
        <div class="ws-row">
            <div class="ws-row-left">
                <i class="fas fa-trophy" style="color:#ffd54f"></i>
                <span class="ws-highlight">${sp.currentReward?.name || 'Unknown'}</span>
            </div>
            <div class="ws-row-right ws-gold">${sp.currentReward?.cost || '?'} SE</div>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.3rem">Rotates in ${sp.remaining || timeUntil(sp.expiry)}</div>
    `;
    body.classList.remove('ws-loading');
}

// --- Arbitration ---

function renderArbitration(arb) {
    const body = document.querySelector('#ws-arbitration .ws-card-body');
    if (!arb || arb.type === 'Unknown') {
        body.innerHTML = '<div class="ws-empty">No arbitration data</div>';
        body.classList.remove('ws-loading');
        return;
    }

    body.innerHTML = `
        <div class="ws-row">
            <div class="ws-row-left">
                <i class="fas fa-crosshairs" style="color:#69f0ae"></i>
                <span class="ws-row-text"><span class="ws-highlight">${arb.type}</span> - ${arb.node}</span>
            </div>
        </div>
        <div class="ws-row">
            <div class="ws-row-left">
                <i class="fas fa-skull" style="color:#ff5252; font-size:0.6rem"></i>
                <span class="ws-row-text">${arb.enemy} ${arb.archwing ? '(Archwing)' : ''}</span>
            </div>
            <div class="ws-row-right">${timeUntil(arb.expiry)}</div>
        </div>
    `;
    body.classList.remove('ws-loading');
}

// --- Void Trader ---

function renderVoidTrader(baro) {
    const body = document.querySelector('#ws-baro .ws-card-body');
    if (!baro) {
        body.innerHTML = '<div class="ws-empty">No data</div>';
        return;
    }

    const now = Date.now();
    const arrival = new Date(baro.activation).getTime();
    const departure = new Date(baro.expiry).getTime();
    const isHere = now >= arrival && now < departure;

    let html = '';
    if (isHere) {
        html += `<div class="ws-label" style="color:var(--purple)">Baro Ki'Teer is HERE</div>`;
        html += `<div style="font-size:0.82rem; margin-bottom:0.3rem"><i class="fas fa-map-marker-alt" style="color:var(--purple)"></i> ${baro.location || 'Unknown relay'}</div>`;
        html += `<div style="font-size:0.72rem; color:var(--text-muted)">Leaves in ${timeUntil(baro.expiry)}</div>`;
        if (baro.inventory && baro.inventory.length > 0) {
            html += '<div class="ws-divider"></div>';
            html += baro.inventory.slice(0, 10).map(item => `
                <div class="ws-row">
                    <div class="ws-row-left">
                        <i class="fas fa-caret-right" style="color:var(--purple); font-size:0.6rem"></i>
                        <span class="ws-row-text">${item.item || item.name || 'Unknown'}</span>
                    </div>
                    <div class="ws-row-right ws-gold">${item.ducats || '?'}d / ${item.credits || '?'}cr</div>
                </div>
            `).join('');
            if (baro.inventory.length > 10) {
                html += `<div class="ws-empty">...and ${baro.inventory.length - 10} more items</div>`;
            }
        }
    } else {
        html += `<div class="ws-label">Baro Ki'Teer</div>`;
        html += `<div class="ws-row">
            <div class="ws-row-left">
                <i class="fas fa-clock" style="color:var(--purple)"></i>
                <span>Arrives in <span class="ws-purple">${timeUntil(baro.activation)}</span></span>
            </div>
        </div>`;
        if (baro.location) {
            html += `<div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.2rem"><i class="fas fa-map-marker-alt"></i> ${baro.location}</div>`;
        }
    }

    body.innerHTML = html;
    body.classList.remove('ws-loading');
}

// --- Daily Deals ---

function renderDailyDeals(deals) {
    const body = document.querySelector('#ws-deals .ws-card-body');
    if (!deals || deals.length === 0) {
        body.innerHTML = '<div class="ws-empty">No daily deals</div>';
        body.classList.remove('ws-loading');
        return;
    }

    body.innerHTML = deals.map(deal => `
        <div class="ws-row">
            <div class="ws-row-left">
                <i class="fas fa-tag" style="color:#ffd54f"></i>
                <span class="ws-row-text"><span class="ws-highlight">${deal.item}</span></span>
            </div>
            <div class="ws-row-right">
                <span class="ws-success">-${deal.discount}%</span>
                <span style="margin-left:0.3rem">${deal.salePrice}p</span>
            </div>
        </div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:0.3rem">${deal.sold}/${deal.total} sold - ${timeUntil(deal.expiry)} left</div>
    `).join('');
    body.classList.remove('ws-loading');
}

// --- Duviri ---

function renderDuviriDetails(duviri) {
    const body = document.querySelector('#ws-duviri .ws-card-body');
    if (!duviri) {
        body.innerHTML = '<div class="ws-empty">No data</div>';
        return;
    }

    let html = `<div class="ws-label">Mood: <span class="ws-purple">${capitalize(duviri.state)}</span></div>`;

    if (duviri.choices && duviri.choices.length > 0) {
        duviri.choices.forEach(choice => {
            html += `<div style="margin-top:0.4rem"><span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em">${choice.category}</span></div>`;
            html += `<div style="font-size:0.82rem; color:var(--text-primary)">${choice.choices.join(', ')}</div>`;
        });
    }

    html += `<div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.3rem">Changes in ${timeUntil(duviri.expiry)}</div>`;
    body.innerHTML = html;
    body.classList.remove('ws-loading');
}

// --- Construction Progress ---

function renderConstruction(cp) {
    const body = document.querySelector('#ws-construction .ws-card-body');
    if (!cp) {
        body.innerHTML = '<div class="ws-empty">No data</div>';
        return;
    }

    const fomorian = parseFloat(cp.fomorianProgress) || 0;
    const razorback = parseFloat(cp.razorbackProgress) || 0;

    body.innerHTML = `
        <div class="ws-row">
            <div class="ws-row-left"><i class="fas fa-ship" style="color:#ff5252"></i><span class="ws-highlight">Fomorian</span></div>
            <div class="ws-row-right ${fomorian > 80 ? 'ws-danger' : ''}">${fomorian.toFixed(1)}%</div>
        </div>
        <div class="ws-progress-bar"><div class="ws-progress-fill" style="width:${fomorian}%; background:linear-gradient(90deg, #ff5252, #ff8a80)"></div></div>
        <div class="ws-row" style="margin-top:0.5rem">
            <div class="ws-row-left"><i class="fas fa-robot" style="color:#00e5ff"></i><span class="ws-highlight">Razorback</span></div>
            <div class="ws-row-right ${razorback > 80 ? 'ws-danger' : ''}">${razorback.toFixed(1)}%</div>
        </div>
        <div class="ws-progress-bar"><div class="ws-progress-fill" style="width:${razorback}%; background:linear-gradient(90deg, #00e5ff, #80deea)"></div></div>
    `;
    body.classList.remove('ws-loading');
}

// --- Nightwave ---

function renderNightwave(nw) {
    const body = document.querySelector('#ws-nightwave .ws-card-body');
    if (!nw || !nw.activeChallenges || nw.activeChallenges.length === 0) {
        body.innerHTML = '<div class="ws-empty">No active Nightwave challenges</div>';
        body.classList.remove('ws-loading');
        return;
    }

    const challenges = nw.activeChallenges.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));

    body.innerHTML = `
        <div class="ws-label">Season ${nw.season || '?'} - ${challenges.length} active challenges</div>
        ${challenges.map(c => `
            <div class="ws-nw-challenge">
                <div class="ws-nw-info">
                    <div class="ws-nw-title">${c.title || c.desc || 'Challenge'}</div>
                    <div class="ws-nw-desc">${c.desc || ''}</div>
                </div>
                <div class="ws-nw-rep">+${(c.reputation || 0).toLocaleString()}</div>
            </div>
        `).join('')}
    `;
    body.classList.remove('ws-loading');
}

// --- Fissures ---

function renderFissures(fissures) {
    const body = document.querySelector('#ws-fissures .ws-card-body');
    if (!fissures || fissures.length === 0) {
        body.innerHTML = '<div class="ws-empty">No active fissures</div>';
        body.classList.remove('ws-loading');
        return;
    }

    let filtered = fissures;
    if (fissureFilterValue !== 'all') {
        filtered = fissures.filter(f => f.tier === fissureFilterValue);
    }

    // Sort by tier
    const tierOrder = { Lith: 1, Meso: 2, Neo: 3, Axi: 4, Requiem: 5, Omnia: 6 };
    filtered.sort((a, b) => (tierOrder[a.tier] || 99) - (tierOrder[b.tier] || 99));

    if (filtered.length === 0) {
        body.innerHTML = `<div class="ws-empty">No ${fissureFilterValue} fissures active</div>`;
        body.classList.remove('ws-loading');
        return;
    }

    body.innerHTML = filtered.map(f => {
        const tierClass = 'ws-tag-' + (f.tier || '').toLowerCase();
        return `
            <div class="ws-row">
                <div class="ws-row-left">
                    <span class="ws-tag ${tierClass}">${f.tier || '?'}</span>
                    <span class="ws-row-text"><span class="ws-highlight">${f.missionType}</span> - ${f.node} (${f.enemy})</span>
                </div>
                <div class="ws-row-right">${timeUntil(f.expiry)}</div>
            </div>
        `;
    }).join('');
    body.classList.remove('ws-loading');
}

// --- Invasions ---

function renderInvasions(invasions) {
    const body = document.querySelector('#ws-invasions .ws-card-body');
    if (!invasions || invasions.length === 0) {
        body.innerHTML = '<div class="ws-empty">No active invasions</div>';
        body.classList.remove('ws-loading');
        return;
    }

    // Only show non-completed
    const active = invasions.filter(inv => !inv.completed);
    if (active.length === 0) {
        body.innerHTML = '<div class="ws-empty">All invasions completed</div>';
        body.classList.remove('ws-loading');
        return;
    }

    body.innerHTML = active.map(inv => {
        const attackerReward = getInvasionReward(inv.attacker);
        const defenderReward = getInvasionReward(inv.defender);
        const completion = inv.completion || 50;
        const attackerPct = Math.max(0, Math.min(100, 50 + completion / 2));
        const defenderPct = 100 - attackerPct;

        return `
            <div style="margin-bottom:0.6rem">
                <div class="ws-row">
                    <div class="ws-row-left">
                        <span class="ws-row-text">
                            <span class="ws-danger">${attackerReward}</span>
                            vs
                            <span class="ws-accent">${defenderReward}</span>
                        </span>
                    </div>
                    <div class="ws-row-right">${inv.node}</div>
                </div>
                <div class="ws-invasion-bar">
                    <div class="ws-invasion-attacker" style="width:${attackerPct}%"></div>
                    <div class="ws-invasion-defender" style="width:${defenderPct}%"></div>
                </div>
            </div>
        `;
    }).join('');
    body.classList.remove('ws-loading');
}

function getInvasionReward(side) {
    if (!side || !side.reward) return 'Credits';
    const items = side.reward.countedItems || [];
    const directItems = side.reward.items || [];
    if (items.length > 0) return items.map(i => `${i.count}x ${i.type}`).join(', ');
    if (directItems.length > 0) return directItems.join(', ');
    if (side.reward.credits > 0) return `${side.reward.credits.toLocaleString()} Credits`;
    return 'Reward';
}

// --- Events ---

function renderActiveEvents(events) {
    const body = document.querySelector('#ws-events .ws-card-body');
    if (!events || events.length === 0) {
        body.innerHTML = '<div class="ws-empty">No active events</div>';
        body.classList.remove('ws-loading');
        return;
    }

    body.innerHTML = events.map(evt => `
        <div class="ws-row">
            <div class="ws-row-left">
                <i class="fas fa-star" style="color:#69f0ae"></i>
                <span class="ws-row-text">
                    <span class="ws-highlight">${evt.description || evt.tooltip || 'Event'}</span>
                    ${evt.tooltip && evt.tooltip !== evt.description ? ` - ${evt.tooltip}` : ''}
                </span>
            </div>
            <div class="ws-row-right">${timeUntil(evt.expiry)}</div>
        </div>
        ${evt.currentScore !== undefined ? `
            <div class="ws-progress-bar" style="margin-bottom:0.4rem">
                <div class="ws-progress-fill" style="width:${Math.min(100, (evt.currentScore / (evt.maximumScore || 100)) * 100)}%; background:linear-gradient(90deg, #69f0ae, #00e5ff)"></div>
            </div>
        ` : ''}
    `).join('');
    body.classList.remove('ws-loading');
}

// --- News ---

function renderNews(news) {
    const body = document.querySelector('#ws-news .ws-card-body');
    if (!news || news.length === 0) {
        body.innerHTML = '<div class="ws-empty">No news</div>';
        body.classList.remove('ws-loading');
        return;
    }

    // Show latest 8 news items, skip broken dates
    const sorted = [...news]
        .filter(n => n.message && n.link)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

    body.innerHTML = sorted.map(n => `
        <a href="${n.link}" target="_blank" rel="noopener" class="ws-news-link">
            <span class="ws-news-date">${relativeDate(n.date)}</span>
            <span class="ws-news-text">${escapeHtml(n.message)}</span>
            <i class="fas fa-external-link-alt" style="font-size:0.6rem; color:var(--text-muted); flex-shrink:0"></i>
        </a>
    `).join('');
    body.classList.remove('ws-loading');
}
