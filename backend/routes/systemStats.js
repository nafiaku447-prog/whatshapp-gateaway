const express = require('express');
const router = express.Router();
const si = require('systeminformation');
const os = require('os');
const { requireAdmin } = require('../middleware/adminAuth');

// ============================================
// GET SYSTEM STATS (CPU, RAM, DISK)
// ============================================
router.get('/system-stats', requireAdmin, async (req, res) => {
    try {
        // Get CPU usage
        const cpuLoad = await si.currentLoad();

        // Get memory info
        const memInfo = await si.mem();

        // Get disk info
        const diskInfo = await si.fsSize();

        // Get OS info
        const osInfo = await si.osInfo();

        // Get system uptime
        const uptime = os.uptime();

        // Calculate memory percentage
        const memUsed = memInfo.used;
        const memTotal = memInfo.total;
        const memPercent = ((memUsed / memTotal) * 100).toFixed(2);

        // Calculate disk usage (sum all drives)
        let totalDiskSize = 0;
        let totalDiskUsed = 0;

        diskInfo.forEach(disk => {
            totalDiskSize += disk.size;
            totalDiskUsed += disk.used;
        });

        const diskPercent = totalDiskSize > 0
            ? ((totalDiskUsed / totalDiskSize) * 100).toFixed(2)
            : 0;

        // CPU cores info
        const cpuInfo = await si.cpu();

        // Network stats
        const networkStats = await si.networkStats();

        // Process info
        const processes = await si.processes();

        // Response data
        const stats = {
            timestamp: new Date().toISOString(),

            // CPU Information
            cpu: {
                usage: parseFloat(cpuLoad.currentLoad.toFixed(2)),
                cores: cpuInfo.cores,
                model: cpuInfo.manufacturer + ' ' + cpuInfo.brand,
                speed: cpuInfo.speed + ' GHz',
                loadPerCore: cpuLoad.cpus.map(cpu => ({
                    load: parseFloat(cpu.load.toFixed(2))
                })),
                status: getCpuStatus(cpuLoad.currentLoad)
            },

            // Memory Information
            memory: {
                used: formatBytes(memUsed),
                total: formatBytes(memTotal),
                free: formatBytes(memInfo.free),
                percent: parseFloat(memPercent),
                usedBytes: memUsed,
                totalBytes: memTotal,
                status: getMemoryStatus(memPercent)
            },

            // Disk Information
            disk: {
                used: formatBytes(totalDiskUsed),
                total: formatBytes(totalDiskSize),
                free: formatBytes(totalDiskSize - totalDiskUsed),
                percent: parseFloat(diskPercent),
                drives: diskInfo.map(disk => ({
                    mount: disk.mount,
                    fs: disk.fs,
                    type: disk.type,
                    size: formatBytes(disk.size),
                    used: formatBytes(disk.used),
                    percent: parseFloat(disk.use.toFixed(2))
                })),
                status: getDiskStatus(diskPercent)
            },

            // OS Information
            os: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                release: osInfo.release,
                arch: osInfo.arch,
                hostname: os.hostname(),
                uptime: formatUptime(uptime)
            },

            // Network Information
            network: networkStats.length > 0 ? {
                interface: networkStats[0].iface,
                rxSec: formatBytes(networkStats[0].rx_sec) + '/s',
                txSec: formatBytes(networkStats[0].tx_sec) + '/s'
            } : null,

            // Process Information
            processes: {
                all: processes.all,
                running: processes.running,
                blocked: processes.blocked,
                sleeping: processes.sleeping
            }
        };

        res.json(stats);

    } catch (error) {
        console.error('System stats error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to retrieve system statistics'
        });
    }
});

// ============================================
// GET REAL-TIME CPU STATS
// ============================================
router.get('/cpu-stats', requireAdmin, async (req, res) => {
    try {
        const cpuLoad = await si.currentLoad();
        const cpuTemp = await si.cpuTemperature();

        res.json({
            timestamp: new Date().toISOString(),
            usage: parseFloat(cpuLoad.currentLoad.toFixed(2)),
            cores: cpuLoad.cpus.map(cpu => ({
                load: parseFloat(cpu.load.toFixed(2))
            })),
            temperature: cpuTemp.main || null,
            status: getCpuStatus(cpuLoad.currentLoad)
        });
    } catch (error) {
        console.error('CPU stats error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to retrieve CPU statistics'
        });
    }
});

// ============================================
// GET REAL-TIME MEMORY STATS
// ============================================
router.get('/memory-stats', requireAdmin, async (req, res) => {
    try {
        const memInfo = await si.mem();
        const memPercent = ((memInfo.used / memInfo.total) * 100).toFixed(2);

        res.json({
            timestamp: new Date().toISOString(),
            used: formatBytes(memInfo.used),
            total: formatBytes(memInfo.total),
            free: formatBytes(memInfo.free),
            percent: parseFloat(memPercent),
            usedBytes: memInfo.used,
            totalBytes: memInfo.total,
            status: getMemoryStatus(memPercent)
        });
    } catch (error) {
        console.error('Memory stats error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to retrieve memory statistics'
        });
    }
});

// ============================================
// Helper Functions
// ============================================

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format uptime to human readable format
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '< 1m';
}

/**
 * Get CPU status based on usage percentage
 */
function getCpuStatus(usage) {
    if (usage < 50) return 'normal';
    if (usage < 80) return 'warning';
    return 'critical';
}

/**
 * Get memory status based on usage percentage
 */
function getMemoryStatus(percent) {
    if (percent < 70) return 'normal';
    if (percent < 90) return 'warning';
    return 'critical';
}

/**
 * Get disk status based on usage percentage
 */
function getDiskStatus(percent) {
    if (percent < 80) return 'normal';
    if (percent < 95) return 'warning';
    return 'critical';
}

module.exports = router;
