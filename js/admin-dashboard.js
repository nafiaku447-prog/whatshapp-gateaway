// ============================================
// ADMIN DASHBOARD - SYSTEM MONITOR
// ============================================

// Check if user is logged in and is admin
requireAuth();
checkAdminAccess();

// Configuration
const REFRESH_INTERVAL = 5000; // 5 seconds
const MAX_CHART_DATA_POINTS = 20;

// State
let autoRefreshEnabled = true;
let refreshTimer = null;
let countdownTimer = null;
let countdownSeconds = 5;

// Charts
let cpuChart = null;
let memoryChart = null;

// Chart data
const cpuHistory = [];
const memoryHistory = [];
const timeLabels = [];

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load user info
    await loadUserInfo();

    // Initialize charts
    initializeCharts();

    // Load initial data
    await fetchSystemStats();

    // Start auto-refresh
    startAutoRefresh();

    // Setup event listeners
    setupEventListeners();

    // Hide loading overlay
    hideLoading();
});

// ============================================
// USER INFO
// ============================================

async function loadUserInfo() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const userName = `${user.firstName} ${user.lastName}`;
            document.getElementById('userName').textContent = userName;

            // Set avatar initial
            const initial = user.firstName.charAt(0).toUpperCase();
            document.getElementById('userAvatar').textContent = initial;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// ============================================
// CHECK ADMIN ACCESS
// ============================================

async function checkAdminAccess() {
    try {
        // This will be checked by backend middleware
        // If not admin, the API will return 403
        const response = await apiRequest('/system/system-stats');
        // If we get here, user is admin
        return true;
    } catch (error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'dashboard.html';
        }
        return false;
    }
}

// ============================================
// FETCH SYSTEM STATS
// ============================================

async function fetchSystemStats() {
    try {
        const stats = await apiRequest('/system/system-stats');

        // Update UI
        updateCPUStats(stats.cpu);
        updateMemoryStats(stats.memory);
        updateDiskStats(stats.disk);
        updateSystemInfo(stats.os);
        updateProcessInfo(stats.processes);

        // Update charts
        updateCharts(stats);

        // Update timestamp
        console.log('Stats updated:', new Date(stats.timestamp).toLocaleTimeString());

    } catch (error) {
        console.error('Error fetching system stats:', error);

        // If 403, redirect to dashboard
        if (error.message && error.message.includes('403')) {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'dashboard.html';
        }
    }
}

// ============================================
// UPDATE CPU STATS
// ============================================

function updateCPUStats(cpu) {
    // Update values
    document.getElementById('cpuUsage').textContent = cpu.usage.toFixed(1);
    document.getElementById('cpuModel').textContent = cpu.model;
    document.getElementById('cpuCores').textContent = cpu.cores;
    document.getElementById('cpuSpeed').textContent = cpu.speed;

    // Update progress bar
    const cpuProgress = document.getElementById('cpuProgress');
    cpuProgress.style.width = cpu.usage + '%';

    // Update status and color
    const cpuStatus = document.getElementById('cpuStatus');
    cpuStatus.className = 'stat-status ' + cpu.status;

    const statusText = cpuStatus.querySelector('.status-text');
    statusText.textContent = getStatusText(cpu.status);

    // Update progress bar color
    cpuProgress.className = 'progress-fill ' + cpu.status;
}

// ============================================
// UPDATE MEMORY STATS
// ============================================

function updateMemoryStats(memory) {
    // Update values
    document.getElementById('memoryUsage').textContent = memory.percent.toFixed(1);
    document.getElementById('memoryTotal').textContent = 'Total: ' + memory.total;
    document.getElementById('memoryUsed').textContent = memory.used;
    document.getElementById('memoryFree').textContent = memory.free;

    // Update progress bar
    const memoryProgress = document.getElementById('memoryProgress');
    memoryProgress.style.width = memory.percent + '%';

    // Update status and color
    const memoryStatus = document.getElementById('memoryStatus');
    memoryStatus.className = 'stat-status ' + memory.status;

    const statusText = memoryStatus.querySelector('.status-text');
    statusText.textContent = getStatusText(memory.status);

    // Update progress bar color
    memoryProgress.className = 'progress-fill ' + memory.status;
}

// ============================================
// UPDATE DISK STATS
// ============================================

function updateDiskStats(disk) {
    // Update values
    document.getElementById('diskUsage').textContent = disk.percent.toFixed(1);
    document.getElementById('diskTotal').textContent = 'Total: ' + disk.total;
    document.getElementById('diskUsed').textContent = disk.used;
    document.getElementById('diskFree').textContent = disk.free;

    // Update progress bar
    const diskProgress = document.getElementById('diskProgress');
    diskProgress.style.width = disk.percent + '%';

    // Update status and color
    const diskStatus = document.getElementById('diskStatus');
    diskStatus.className = 'stat-status ' + disk.status;

    const statusText = diskStatus.querySelector('.status-text');
    statusText.textContent = getStatusText(disk.status);

    // Update progress bar color
    diskProgress.className = 'progress-fill ' + disk.status;
}

// ============================================
// UPDATE SYSTEM INFO
// ============================================

function updateSystemInfo(os) {
    document.getElementById('osDistro').textContent = os.distro;
    document.getElementById('systemUptime').textContent = os.uptime;
    document.getElementById('systemPlatform').textContent = os.platform;
    document.getElementById('systemHostname').textContent = os.hostname;
    document.getElementById('systemArch').textContent = os.arch;
}

// ============================================
// UPDATE PROCESS INFO
// ============================================

function updateProcessInfo(processes) {
    document.getElementById('processAll').textContent = processes.all || '--';
    document.getElementById('processRunning').textContent = processes.running || '--';
    document.getElementById('processSleeping').textContent = processes.sleeping || '--';
    document.getElementById('processBlocked').textContent = processes.blocked || '--';
}

// ============================================
// INITIALIZE CHARTS
// ============================================

function initializeCharts() {
    // CPU Chart
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    cpuChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'CPU Usage (%)',
                data: cpuHistory,
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    // Memory Chart
    const memoryCtx = document.getElementById('memoryChart').getContext('2d');
    memoryChart = new Chart(memoryCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Memory Usage (%)',
                data: memoryHistory,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// UPDATE CHARTS
// ============================================

function updateCharts(stats) {
    // Add new data
    const timestamp = new Date().toLocaleTimeString();
    timeLabels.push(timestamp);
    cpuHistory.push(stats.cpu.usage);
    memoryHistory.push(stats.memory.percent);

    // Keep only last MAX_CHART_DATA_POINTS
    if (timeLabels.length > MAX_CHART_DATA_POINTS) {
        timeLabels.shift();
        cpuHistory.shift();
        memoryHistory.shift();
    }

    // Update charts
    cpuChart.update();
    memoryChart.update();
}

// ============================================
// AUTO REFRESH
// ============================================

function startAutoRefresh() {
    if (!autoRefreshEnabled) return;

    // Fetch stats
    refreshTimer = setInterval(async () => {
        if (autoRefreshEnabled) {
            await fetchSystemStats();
            startCountdown();
        }
    }, REFRESH_INTERVAL);

    // Start countdown
    startCountdown();
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }

    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}

function startCountdown() {
    countdownSeconds = 5;

    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    countdownTimer = setInterval(() => {
        countdownSeconds--;
        document.getElementById('refreshTimer').textContent = countdownSeconds;

        if (countdownSeconds <= 0) {
            countdownSeconds = 5;
        }
    }, 1000);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Toggle auto-refresh
    document.getElementById('toggleAutoRefresh').addEventListener('click', () => {
        autoRefreshEnabled = !autoRefreshEnabled;

        const btn = document.getElementById('toggleAutoRefresh');
        const indicator = document.getElementById('refreshIndicator');

        if (autoRefreshEnabled) {
            btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            btn.style.color = 'white';
            indicator.style.display = 'flex';
            startAutoRefresh();
        } else {
            btn.style.background = 'transparent';
            btn.style.color = '#667eea';
            indicator.style.display = 'none';
            stopAutoRefresh();
        }
    });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStatusText(status) {
    switch (status) {
        case 'normal':
            return 'Normal';
        case 'warning':
            return 'Warning';
        case 'critical':
            return 'Critical';
        default:
            return 'Unknown';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// ============================================
// CLEANUP
// ============================================

window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});
