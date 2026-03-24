// ============================================
// WARFRAME TRACKER - Application Logic
// ============================================

const API_BASE = 'https://api.warframestat.us/pc';

// ============================================
// ARBITRATION DATA from browse.wf
// Uses arbys.txt schedule + ExportRegions for node info
// Tier list from Arbitration Goons via arbyTiers.js
// ============================================

// Tier data from browse.wf/supplemental-data/arbyTiers.js (Arbitration Goons)
const ARBI_TIERS_BY_ID = {
    SolNode106: 'S', SolNode147: 'S', SolNode149: 'S', ClanNode22: 'S',
    SolNode25: 'A', SolNode224: 'A', SolNode195: 'A', SolNode42: 'A', ClanNode24: 'A', ClanNode6: 'A',
    SolNode707: 'B', SolNode125: 'B', ClanNode4: 'B', SolNode412: 'B', SolNode719: 'B',
    SolNode22: 'B', SolNode211: 'B', ClanNode8: 'B', SolNode72: 'B', SolNode212: 'B', SolNode46: 'B', SolNode450: 'B',
    SolNode130: 'C', ClanNode15: 'C', SolNode408: 'C', SolNode402: 'C', SolNode26: 'C', SolNode18: 'C',
    SolNode305: 'C', SolNode185: 'C', SolNode43: 'C', SolNode64: 'C', SolNode122: 'C',
    SolNode167: 'C', SolNode164: 'C', ClanNode18: 'C',
    SolNode85: 'D', ClanNode2: 'D', SolNode172: 'D', ClanNode0: 'D', SolNode17: 'D',
    SettlementNode11: 'D', SolNode23: 'D'
};

function getArbiTierById(nodeId) {
    return ARBI_TIERS_BY_ID[nodeId] || null;
}

// Legacy name-based lookup (fallback when using warframestat API data)
function getArbiTier(node) {
    if (!node) return null;
    // If we have browse.wf data loaded, try to find by resolved name
    if (arbiNodeCache) {
        for (const [nodeId, info] of Object.entries(arbiNodeCache)) {
            const display = `${info.name} (${info.system})`;
            if (display === node || info.name === node.split('(')[0].trim()) {
                return getArbiTierById(nodeId) || 'B';
            }
        }
    }
    return 'B';
}

const TIER_COLORS = {
    'S': { bg: 'rgba(255, 213, 79, 0.15)', border: 'rgba(255, 213, 79, 0.4)', text: '#ffd54f', label: 'S' },
    'A': { bg: 'rgba(105, 240, 174, 0.15)', border: 'rgba(105, 240, 174, 0.4)', text: '#69f0ae', label: 'A' },
    'B': { bg: 'rgba(0, 229, 255, 0.15)', border: 'rgba(0, 229, 255, 0.4)', text: '#00e5ff', label: 'B' },
    'C': { bg: 'rgba(255, 110, 64, 0.12)', border: 'rgba(255, 110, 64, 0.3)', text: '#ff6e40', label: 'C' },
    'D': { bg: 'rgba(255, 82, 82, 0.12)', border: 'rgba(255, 82, 82, 0.3)', text: '#ff5252', label: 'D' }
};

// Cached arbitration data (loaded from local static files)
let arbiSchedule = null;    // Array of [timestamp, nodeId]
let arbiNodeCache = null;   // { nodeId: { name, system, missionType, faction } }

async function loadArbiData() {
    try {
        // Load from local static files (pre-downloaded from browse.wf, no CORS issues)
        const [scheduleRes, nodesRes] = await Promise.all([
            fetch('data/arbys.txt'),
            fetch('data/arbi-nodes.json')
        ]);

        if (!scheduleRes.ok || !nodesRes.ok) {
            throw new Error('Failed to load local arbi data files');
        }

        const scheduleText = await scheduleRes.text();
        const nodesData = await nodesRes.json();

        // Parse schedule: each line is "timestamp,nodeId"
        arbiSchedule = scheduleText.split('\n')
            .map(line => line.trim().split(','))
            .filter(arr => arr.length === 2)
            .map(arr => [parseInt(arr[0]), arr[1]]);

        // Build node cache from pre-resolved data
        // arbi-nodes.json has { nodes: { nodeId: { n, s, m, f } }, tiers: { nodeId: tier } }
        arbiNodeCache = {};
        for (const [nodeId, info] of Object.entries(nodesData.nodes || {})) {
            arbiNodeCache[nodeId] = {
                name: info.n,
                system: info.s,
                missionType: info.m,
                faction: info.f
            };
        }

        // Override tier data if present in the JSON
        if (nodesData.tiers) {
            for (const [nodeId, tier] of Object.entries(nodesData.tiers)) {
                ARBI_TIERS_BY_ID[nodeId] = tier;
            }
        }

        console.log(`Loaded ${arbiSchedule.length} arbitration entries, ${Object.keys(arbiNodeCache).length} unique nodes`);
        return true;
    } catch (err) {
        console.error('Failed to load arbi data:', err);
        return false;
    }
}

function getCurrentArbi() {
    if (!arbiSchedule || arbiSchedule.length === 0) return null;
    const nowSec = Math.floor(Date.now() / 1000);
    // Find the current arbitration (largest timestamp <= now)
    let current = null;
    for (let i = arbiSchedule.length - 1; i >= 0; i--) {
        if (arbiSchedule[i][0] <= nowSec) {
            current = arbiSchedule[i];
            break;
        }
    }
    return current;
}

function getUpcomingArbis(count = 20) {
    if (!arbiSchedule || arbiSchedule.length === 0) return [];
    const nowSec = Math.floor(Date.now() / 1000);
    const upcoming = [];
    for (let i = 0; i < arbiSchedule.length; i++) {
        if (arbiSchedule[i][0] > nowSec) {
            upcoming.push(arbiSchedule[i]);
            if (upcoming.length >= count) break;
        }
    }
    return upcoming;
}

function getNextTieredArbi(targetTiers) {
    const upcoming = getUpcomingArbis(100);
    for (const [ts, nodeId] of upcoming) {
        const tier = getArbiTierById(nodeId);
        if (tier && targetTiers.includes(tier)) {
            return { timestamp: ts, nodeId, tier };
        }
    }
    return null;
}

function formatArbiNode(nodeId) {
    const info = arbiNodeCache?.[nodeId];
    if (!info) return nodeId;
    return `${info.name} (${info.system})`;
}

function formatArbiDetails(nodeId) {
    const info = arbiNodeCache?.[nodeId];
    if (!info) return { name: nodeId, system: '', missionType: '', faction: '', display: nodeId };
    return {
        name: info.name,
        system: info.system,
        missionType: info.missionType,
        faction: info.faction,
        display: `${info.name} (${info.system})`
    };
}

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
    setupNotifications();
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
        // Fetch main world state and browse.wf arbi data in parallel
        const promises = [
            fetch(API_BASE, { headers: { 'Accept': 'application/json' } }).then(r => r.ok ? r.json() : null)
        ];

        // Only load arbi data if not already loaded
        if (!arbiSchedule) {
            promises.push(loadArbiData());
        }

        const [wsData] = await Promise.all(promises);

        if (wsData) {
            worldStateData = wsData;
        }

        // Use browse.wf data for arbitrations (more reliable than warframestat semlar data)
        if (arbiSchedule && arbiNodeCache) {
            const currentArbi = getCurrentArbi();
            if (currentArbi) {
                const [ts, nodeId] = currentArbi;
                const details = formatArbiDetails(nodeId);
                const tier = getArbiTierById(nodeId);
                // Override the warframestat arbitration data with browse.wf data
                worldStateData.arbitration = {
                    node: details.display,
                    type: details.missionType,
                    enemy: details.faction,
                    expiry: new Date((ts + 3600) * 1000).toISOString(), // Each arbi lasts 1 hour
                    archwing: false,
                    _nodeId: nodeId,
                    _tier: tier,
                    _source: 'browse.wf'
                };
            }
        }

        // Fallback to warframestat dedicated endpoint if we still have no arbi data
        if ((!worldStateData.arbitration || !worldStateData.arbitration.node) && !arbiSchedule) {
            try {
                const arbRes = await fetch(`${API_BASE}/arbitration`, { headers: { 'Accept': 'application/json' } });
                if (arbRes.ok) {
                    const arbData = await arbRes.json();
                    if (arbData && arbData.node) {
                        worldStateData.arbitration = arbData;
                    }
                }
            } catch (arbErr) {
                console.warn('Arbitration endpoint fallback failed:', arbErr);
            }
        }

        renderStatusBar(worldStateData);
        renderWorldStateCards(worldStateData);
        checkAlertRules(worldStateData);
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

    // Arbitration chip
    renderArbitrationChip(data.arbitration);

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
    renderCircuit(data.endlessXpChoices);
    renderNightwave(data.nightwave);
    renderFissures(data.fissures);
    renderVoidStorms(data.voidStorms);
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
    if (!arb || (!arb.node && !arb.type) || arb.type === 'Unknown') {
        body.innerHTML = '<div class="ws-empty">No arbitration data available. The schedule data may not cover this time period.</div>';
        body.classList.remove('ws-loading');
        return;
    }

    const tier = arb._tier || getArbiTierById(arb._nodeId) || getArbiTier(arb.node);
    const tierInfo = TIER_COLORS[tier] || TIER_COLORS['B'];

    body.innerHTML = `
        <div class="ws-arbi-tier-banner" style="background:${tierInfo.bg}; border:1px solid ${tierInfo.border}; border-radius:var(--radius-sm); padding:0.5rem 0.7rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem">
            <span class="ws-arbi-tier-badge" style="background:${tierInfo.border}; color:#000; font-weight:800; font-size:0.75rem; padding:0.15rem 0.5rem; border-radius:3px; font-family:var(--font-display); letter-spacing:0.05em">${tierInfo.label}-TIER</span>
            <span style="color:${tierInfo.text}; font-weight:600; font-size:0.85rem">${arb.node || 'Unknown Node'}</span>
        </div>
        <div class="ws-row">
            <div class="ws-row-left">
                <i class="fas fa-crosshairs" style="color:#69f0ae"></i>
                <span class="ws-row-text"><span class="ws-highlight">${arb.type || arb.missionType || 'Mission'}</span></span>
            </div>
            <div class="ws-row-right">${timeUntil(arb.expiry)}</div>
        </div>
        <div class="ws-row">
            <div class="ws-row-left">
                <i class="fas fa-skull" style="color:#ff5252; font-size:0.6rem"></i>
                <span class="ws-row-text">${arb.enemy || 'Unknown'} ${arb.archwing ? '(Archwing)' : ''}</span>
            </div>
        </div>
        ${arb._source === 'browse.wf' ? '<div style="font-size:0.62rem; color:var(--text-muted); margin-top:0.3rem; opacity:0.6">Data from browse.wf</div>' : ''}
        ${renderUpcomingNoteworthyArbis()}
    `;
    body.classList.remove('ws-loading');
}

function renderUpcomingNoteworthyArbis() {
    let html = '<div class="ws-divider"></div>';

    // Show upcoming noteworthy arbitrations from browse.wf
    if (arbiSchedule && arbiNodeCache) {
        const upcoming = getUpcomingArbis(50);
        const noteworthy = upcoming.filter(([ts, nodeId]) => {
            const tier = getArbiTierById(nodeId);
            return tier === 'S' || tier === 'A';
        }).slice(0, 5);

        if (noteworthy.length > 0) {
            html += '<div class="ws-label">Upcoming Noteworthy Arbitrations</div>';
            html += noteworthy.map(([ts, nodeId]) => {
                const tier = getArbiTierById(nodeId);
                const tierInfo = TIER_COLORS[tier] || TIER_COLORS['B'];
                const details = formatArbiDetails(nodeId);
                const startsIn = timeUntil(new Date(ts * 1000).toISOString());
                return `
                    <div class="ws-row">
                        <div class="ws-row-left">
                            <span style="background:${tierInfo.bg}; border:1px solid ${tierInfo.border}; color:${tierInfo.text}; font-size:0.65rem; font-weight:700; padding:0.08rem 0.35rem; border-radius:3px; font-family:var(--font-display)">${tierInfo.label}</span>
                            <span class="ws-row-text"><span class="ws-highlight">${details.name}</span> (${details.system}) - ${details.missionType}</span>
                        </div>
                        <div class="ws-row-right">${startsIn}</div>
                    </div>
                `;
            }).join('');
            html += '<div style="margin-top:0.3rem"></div>';
        }
    }

    // Tier legend
    html += `
        <div class="ws-label">Tier Ratings</div>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-top:0.25rem">
            ${Object.entries(TIER_COLORS).map(([tier, info]) => `
                <span style="background:${info.bg}; border:1px solid ${info.border}; color:${info.text}; font-size:0.68rem; font-weight:700; padding:0.1rem 0.4rem; border-radius:3px; font-family:var(--font-display)">${info.label}</span>
            `).join('')}
        </div>
        <div style="font-size:0.68rem; color:var(--text-muted); margin-top:0.3rem">
            Tier list by Arbitration Goons.
            <a href="https://discord.gg/SNRjJBMg" target="_blank" rel="noopener" style="color:var(--accent)">Join Discord</a>
            | Data from <a href="https://browse.wf/arbys" target="_blank" rel="noopener" style="color:var(--accent)">browse.wf</a>
        </div>
    `;
    return html;
}

// --- Arbitration Status Bar Chip ---

function renderArbitrationChip(arb) {
    const chip = document.getElementById('chip-arbitration');
    const tierBadge = document.getElementById('chip-arbi-tier');
    const nextSChip = document.getElementById('chip-arbi-next-s');
    const nextAChip = document.getElementById('chip-arbi-next-a');

    if (!arb || (!arb.node && !arb.type)) {
        chip.querySelector('.chip-value').textContent = 'No data';
        chip.classList.remove('loading');
        tierBadge.style.display = 'none';
        nextSChip.style.display = 'none';
        nextAChip.style.display = 'none';
        return;
    }

    const tier = arb._tier || getArbiTierById(arb._nodeId) || getArbiTier(arb.node);
    const tierInfo = TIER_COLORS[tier] || TIER_COLORS['B'];
    const nodeName = arb.node ? arb.node.split('(')[0].trim() : 'Unknown';

    chip.querySelector('.chip-value').textContent = `${nodeName} - ${arb.type || ''} (${timeUntil(arb.expiry)})`;
    chip.classList.remove('loading');

    // Show tier badge
    tierBadge.textContent = tierInfo.label;
    tierBadge.style.display = 'inline-block';
    tierBadge.style.background = tierInfo.border;
    tierBadge.style.color = '#000';
    tierBadge.className = 'chip-tier-badge';

    // Update chip colors based on tier
    chip.style.borderColor = tierInfo.border;
    chip.querySelector('i').style.color = tierInfo.text;

    // Show next S-tier and A-tier from browse.wf schedule
    if (arbiSchedule && arbiNodeCache) {
        const nextS = getNextTieredArbi(['S']);
        if (nextS) {
            const sDetails = formatArbiDetails(nextS.nodeId);
            const sTime = timeUntil(new Date(nextS.timestamp * 1000).toISOString());
            const sTierInfo = TIER_COLORS['S'];
            nextSChip.style.display = 'flex';
            nextSChip.querySelector('.chip-value').textContent = `${sDetails.name} (${sDetails.system}) in ${sTime}`;
            nextSChip.style.borderColor = sTierInfo.border;
        } else {
            nextSChip.style.display = 'none';
        }

        const nextA = getNextTieredArbi(['A']);
        if (nextA) {
            const aDetails = formatArbiDetails(nextA.nodeId);
            const aTime = timeUntil(new Date(nextA.timestamp * 1000).toISOString());
            const aTierInfo = TIER_COLORS['A'];
            nextAChip.style.display = 'flex';
            nextAChip.querySelector('.chip-value').textContent = `${aDetails.name} (${aDetails.system}) in ${aTime}`;
            nextAChip.style.borderColor = aTierInfo.border;
        } else {
            nextAChip.style.display = 'none';
        }
    } else {
        nextSChip.style.display = 'none';
        nextAChip.style.display = 'none';
    }
}

// --- Status Bar Auto-Scroll ---

let scrollInterval = null;
let scrollPaused = false;

function initStatusBarScroll() {
    const bar = document.getElementById('statusBar');
    const inner = document.getElementById('statusBarInner');
    if (!bar || !inner) return;

    // Clear existing interval
    if (scrollInterval) clearInterval(scrollInterval);

    // Only auto-scroll if content overflows
    if (inner.scrollWidth <= bar.clientWidth) return;

    let scrollPos = 0;
    const scrollSpeed = 1; // pixels per tick

    scrollInterval = setInterval(() => {
        if (scrollPaused) return;
        scrollPos += scrollSpeed;
        if (scrollPos >= inner.scrollWidth - bar.clientWidth) {
            scrollPos = 0;
        }
        bar.scrollLeft = scrollPos;
    }, 30);

    // Pause on hover
    bar.addEventListener('mouseenter', () => { scrollPaused = true; });
    bar.addEventListener('mouseleave', () => { scrollPaused = false; });
    // Pause on touch
    bar.addEventListener('touchstart', () => { scrollPaused = true; }, { passive: true });
    bar.addEventListener('touchend', () => { scrollPaused = false; }, { passive: true });
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

// --- The Circuit ---

function renderCircuit(choices) {
    const body = document.querySelector('#ws-circuit .ws-card-body');
    if (!body) return;
    if (!choices || choices.length === 0) {
        body.innerHTML = '<div class="ws-empty">No Circuit data</div>';
        body.classList.remove('ws-loading');
        return;
    }

    body.innerHTML = choices.map(choice => {
        const isNormal = (choice.category || '').toLowerCase().includes('normal');
        const label = isNormal ? 'Normal' : 'Steel Path';
        const icon = isNormal ? 'fas fa-circle-play' : 'fas fa-fire';
        const color = isNormal ? '#00e5ff' : '#ffd54f';
        return `
            <div style="margin-bottom:0.5rem">
                <div class="ws-label"><i class="${icon}" style="color:${color}; margin-right:0.3rem"></i>${label}</div>
                <div style="display:flex; gap:0.4rem; flex-wrap:wrap">
                    ${choice.choices.map(c => `<span class="ws-tag" style="background:${color}18; color:${color}; border:1px solid ${color}30">${c}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
    body.classList.remove('ws-loading');
}

// --- Void Storms (Railjack Fissures) ---

function renderVoidStorms(storms) {
    const body = document.querySelector('#ws-voidstorms .ws-card-body');
    if (!body) return;
    if (!storms || storms.length === 0) {
        body.innerHTML = '<div class="ws-empty">No active Void Storms</div>';
        body.classList.remove('ws-loading');
        return;
    }

    const tierOrder = { Lith: 1, Meso: 2, Neo: 3, Axi: 4, Requiem: 5, Omnia: 6 };
    const sorted = [...storms].sort((a, b) => (tierOrder[a.tier] || 99) - (tierOrder[b.tier] || 99));

    body.innerHTML = sorted.map(s => {
        const tierClass = 'ws-tag-' + (s.tier || '').toLowerCase();
        return `
            <div class="ws-row">
                <div class="ws-row-left">
                    <span class="ws-tag ${tierClass}">${s.tier || '?'}</span>
                    <span class="ws-row-text"><span class="ws-highlight">${s.missionType || 'Mission'}</span> - ${s.node || '?'}</span>
                </div>
                <div class="ws-row-right">${timeUntil(s.expiry)}</div>
            </div>
        `;
    }).join('');
    body.classList.remove('ws-loading');
}

// --- News ---

// ============================================
// NOTIFICATIONS - Browser + Discord
// ============================================

const CYCLE_NAMES = {
    cetusCycle: 'Cetus',
    earthCycle: 'Earth',
    vallisCycle: 'Orb Vallis',
    cambionCycle: 'Cambion Drift',
    zarimanCycle: 'Zariman',
    duviriCycle: 'Duviri'
};

const CYCLE_STATES = {
    cetusCycle: ['day', 'night'],
    earthCycle: ['day', 'night'],
    vallisCycle: ['warm', 'cold'],
    cambionCycle: ['fass', 'vome'],
    zarimanCycle: ['corpus', 'grineer'],
    duviriCycle: ['joy', 'anger', 'envy', 'sorrow', 'fear']
};

// Track which alerts have already fired so we don't spam
let firedAlerts = {};

function setupNotifications() {
    const notifModal = document.getElementById('notifModal');
    const openBtn = document.getElementById('openNotifSettings');
    const closeBtn = document.getElementById('closeNotifModal');
    const closeBtn2 = document.getElementById('closeNotifBtn');

    const browserToggle = document.getElementById('browserNotifToggle');
    const discordToggle = document.getElementById('discordNotifToggle');
    const webhookInput = document.getElementById('discordWebhookUrl');
    const testBtn = document.getElementById('testDiscordBtn');

    // Open/close modal
    openBtn.addEventListener('click', () => { notifModal.classList.add('open'); refreshNotifUI(); });
    const closeNotif = () => notifModal.classList.remove('open');
    closeBtn.addEventListener('click', closeNotif);
    closeBtn2.addEventListener('click', closeNotif);
    notifModal.addEventListener('click', (e) => { if (e.target === notifModal) closeNotif(); });

    // Browser notifications toggle
    const browserEnabled = getStore('notif_browser', false);
    browserToggle.checked = browserEnabled;
    updateBrowserNotifStatus();

    browserToggle.addEventListener('change', async () => {
        if (browserToggle.checked) {
            if ('Notification' in window) {
                const perm = await Notification.requestPermission();
                if (perm === 'granted') {
                    setStore('notif_browser', true);
                    updateBrowserNotifStatus();
                } else {
                    browserToggle.checked = false;
                    setStore('notif_browser', false);
                    updateBrowserNotifStatus();
                }
            } else {
                browserToggle.checked = false;
                alert('Your browser does not support notifications.');
            }
        } else {
            setStore('notif_browser', false);
            updateBrowserNotifStatus();
        }
    });

    // Discord toggle + webhook
    discordToggle.checked = getStore('notif_discord', false);
    webhookInput.value = getStore('discord_webhook', '');

    discordToggle.addEventListener('change', () => {
        setStore('notif_discord', discordToggle.checked);
    });

    webhookInput.addEventListener('input', () => {
        setStore('discord_webhook', webhookInput.value.trim());
    });

    // Test Discord
    testBtn.addEventListener('click', () => {
        const url = getStore('discord_webhook', '');
        if (!url) { alert('Please enter a Discord webhook URL first.'); return; }
        sendDiscordMessage(url, 'Warframe Tracker -- test notification. Your webhook is working!');
    });

    // Alert rules
    setupAlertRuleModal();
    renderAlertRules();
}

function updateBrowserNotifStatus() {
    const el = document.getElementById('browserNotifStatus');
    if (!('Notification' in window)) {
        el.textContent = 'Not supported in this browser';
        return;
    }
    const perm = Notification.permission;
    const enabled = getStore('notif_browser', false);
    if (enabled && perm === 'granted') {
        el.textContent = 'Enabled -- notifications will appear on your desktop';
        el.style.color = 'var(--success)';
    } else if (perm === 'denied') {
        el.textContent = 'Blocked by browser. Check your browser notification settings.';
        el.style.color = 'var(--danger)';
    } else {
        el.textContent = 'Click toggle to enable';
        el.style.color = '';
    }
}

function refreshNotifUI() {
    document.getElementById('browserNotifToggle').checked = getStore('notif_browser', false);
    document.getElementById('discordNotifToggle').checked = getStore('notif_discord', false);
    document.getElementById('discordWebhookUrl').value = getStore('discord_webhook', '');
    updateBrowserNotifStatus();
    renderAlertRules();
}

// --- Alert Rules ---

function setupAlertRuleModal() {
    const modal = document.getElementById('alertRuleModal');
    const addBtn = document.getElementById('addAlertRuleBtn');
    const closeBtn = document.getElementById('closeAlertRuleModal');
    const cancelBtn = document.getElementById('cancelAlertRule');
    const saveBtn = document.getElementById('saveAlertRule');
    const cycleSelect = document.getElementById('ruleCycle');
    const stateSelect = document.getElementById('ruleState');

    // Update state options when cycle changes
    cycleSelect.addEventListener('change', () => updateStateOptions(cycleSelect.value, stateSelect));

    addBtn.addEventListener('click', () => {
        modal.classList.add('open');
        cycleSelect.selectedIndex = 0;
        updateStateOptions(cycleSelect.value, stateSelect);
        document.getElementById('ruleLeadTime').selectedIndex = 0;
        document.getElementById('ruleSendBrowser').checked = true;
        document.getElementById('ruleSendDiscord').checked = false;
    });

    const closeRule = () => modal.classList.remove('open');
    closeBtn.addEventListener('click', closeRule);
    cancelBtn.addEventListener('click', closeRule);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeRule(); });

    saveBtn.addEventListener('click', () => {
        const rules = getStore('alert_rules', []);
        rules.push({
            id: generateId(),
            cycle: cycleSelect.value,
            state: stateSelect.value,
            leadMinutes: parseInt(document.getElementById('ruleLeadTime').value),
            browser: document.getElementById('ruleSendBrowser').checked,
            discord: document.getElementById('ruleSendDiscord').checked
        });
        setStore('alert_rules', rules);
        renderAlertRules();
        closeRule();
    });
}

function updateStateOptions(cycleKey, selectEl) {
    const states = CYCLE_STATES[cycleKey] || ['day', 'night'];
    selectEl.innerHTML = states.map(s => `<option value="${s}">${capitalize(s)}</option>`).join('');
}

function renderAlertRules() {
    const container = document.getElementById('alertRulesList');
    const rules = getStore('alert_rules', []);

    if (rules.length === 0) {
        container.innerHTML = '<div class="alert-rules-empty">No alert rules yet. Add one to get notified!</div>';
        return;
    }

    container.innerHTML = rules.map(rule => `
        <div class="alert-rule-item" data-rule-id="${rule.id}">
            <i class="fas fa-bell alert-rule-icon"></i>
            <div class="alert-rule-text">
                <strong>${CYCLE_NAMES[rule.cycle] || rule.cycle}</strong> &rarr; ${capitalize(rule.state)}
                <div class="rule-detail">${rule.leadMinutes > 0 ? rule.leadMinutes + ' min before' : 'When it starts'}</div>
            </div>
            <div class="alert-rule-channels">
                <i class="fas fa-desktop ${rule.browser ? 'active-channel' : ''}" title="Browser"></i>
                <i class="fab fa-discord ${rule.discord ? 'active-discord' : ''}" title="Discord"></i>
            </div>
            <button class="alert-rule-delete" title="Delete rule"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    container.querySelectorAll('.alert-rule-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const ruleId = btn.closest('.alert-rule-item').dataset.ruleId;
            setStore('alert_rules', getStore('alert_rules', []).filter(r => r.id !== ruleId));
            renderAlertRules();
        });
    });
}

// --- Notification Dispatch ---

function checkAlertRules(data) {
    const rules = getStore('alert_rules', []);
    if (rules.length === 0) return;

    const browserEnabled = getStore('notif_browser', false);
    const discordEnabled = getStore('notif_discord', false);
    const webhookUrl = getStore('discord_webhook', '');

    rules.forEach(rule => {
        const cycleData = data[rule.cycle];
        if (!cycleData) return;

        const currentState = cycleData.state;
        const expiry = new Date(cycleData.expiry).getTime();
        const now = Date.now();
        const msLeft = expiry - now;
        const minsLeft = msLeft / 60000;

        // Calculate when the NEXT state (the one we want) starts
        // If the current state IS the desired state:
        //   - leadMinutes=0: fire when state is active
        //   - leadMinutes>0: doesn't apply (we're already in it)
        // If the current state is NOT the desired state:
        //   - The desired state starts when current expires
        //   - Fire if minsLeft <= leadMinutes

        const alertKey = `${rule.id}_${cycleData.id}`;

        if (currentState === rule.state) {
            // Desired state is active right now
            if (rule.leadMinutes === 0 && !firedAlerts[alertKey]) {
                firedAlerts[alertKey] = true;
                fireAlert(rule, `${CYCLE_NAMES[rule.cycle]} is now ${capitalize(rule.state)}!`, browserEnabled, discordEnabled, webhookUrl);
            }
        } else {
            // Desired state comes next (after current expires)
            if (rule.leadMinutes > 0 && minsLeft <= rule.leadMinutes && minsLeft > 0 && !firedAlerts[alertKey]) {
                firedAlerts[alertKey] = true;
                const timeStr = Math.ceil(minsLeft);
                fireAlert(rule, `${CYCLE_NAMES[rule.cycle]} will be ${capitalize(rule.state)} in ~${timeStr} min!`, browserEnabled, discordEnabled, webhookUrl);
            } else if (rule.leadMinutes === 0) {
                // Reset fired state so it fires when state actually changes
                delete firedAlerts[alertKey];
            }
        }
    });
}

function fireAlert(rule, message, browserEnabled, discordEnabled, webhookUrl) {
    // Browser notification
    if (rule.browser && browserEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Warframe Tracker', {
            body: message,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%230a0e14" stroke="%2300e5ff" stroke-width="2"/><text x="20" y="26" text-anchor="middle" fill="%2300e5ff" font-size="18">W</text></svg>',
            tag: rule.id,
            requireInteraction: false
        });
    }

    // Discord webhook
    if (rule.discord && discordEnabled && webhookUrl) {
        sendDiscordMessage(webhookUrl, message);
    }
}

async function sendDiscordMessage(webhookUrl, message) {
    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Warframe Tracker',
                avatar_url: 'https://i.imgur.com/AfFp7pu.png',
                embeds: [{
                    title: 'Warframe Cycle Alert',
                    description: message,
                    color: 58879, // #00e5ff as decimal
                    timestamp: new Date().toISOString(),
                    footer: { text: 'Warframe Tracker' }
                }]
            })
        });
    } catch (err) {
        console.error('Discord webhook error:', err);
    }
}

// Clean up old fired alerts periodically
function cleanupFiredAlerts() {
    // Simple approach: clear every 10 minutes
    firedAlerts = {};
}
setInterval(cleanupFiredAlerts, 600000);

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

    body.innerHTML = `<div class="ws-news-grid">${sorted.map(n => {
        const hasImage = n.imageLink || n.image;
        const imgUrl = n.imageLink || n.image || '';
        return `
            <a href="${n.link}" target="_blank" rel="noopener" class="ws-news-card${hasImage ? ' has-image' : ''}">
                ${hasImage ? `<div class="ws-news-img-wrapper"><img src="${imgUrl}" alt="" class="ws-news-img" loading="lazy" onerror="this.parentElement.style.display='none'"></div>` : ''}
                <div class="ws-news-card-body">
                    <span class="ws-news-date">${relativeDate(n.date)}</span>
                    <span class="ws-news-text">${escapeHtml(n.message)}</span>
                </div>
                <i class="fas fa-external-link-alt ws-news-ext-icon"></i>
            </a>
        `;
    }).join('')}</div>`;
    body.classList.remove('ws-loading');
}
