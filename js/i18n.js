// ============================================
// Internationalization (i18n) System
// ============================================

// Translations
const translations = {
    en: {
        // Dashboard
        dashboard: {
            title: "Dashboard",
            subtitle: "Welcome back! Here's what's happening with your WhatsApp gateway today."
        },

        // Stats
        stats: {
            totalMessages: "Total Messages Sent",
            activeDevices: "Active Devices",
            totalContacts: "Total Contacts",
            deliveryRate: "Delivery Rate"
        },

        // Sidebar
        sidebar: {
            dashboard: "Dashboard",
            devices: "Devices",
            messages: "Messages",
            contacts: "Contacts",
            automation: "Automation",
            autoReply: "Auto Reply",
            webhooks: "Webhooks",
            account: "Account",
            subscription: "Subscription",
            settings: "Settings"
        },

        // Recent Activity
        activity: {
            title: "Recent Activity",
            viewAll: "View All",
            noActivity: "No Activity Yet",
            noActivityDesc: "Get started by sending your first WhatsApp message.<br>Your activity will appear here.",
            sendFirstMessage: "Send Your First Message",
            messageSent: "Message sent",
            messageFailed: "Message failed",
            to: "To"
        },

        // Quick Actions
        quickActions: {
            title: "Quick Actions",
            addDevice: "Add Device",
            sendMessage: "Send Message",
            addContact: "Add Contact",
            setupBot: "Setup Bot"
        },

        // Logout Modal
        logout: {
            title: "Logout Confirmation",
            description: "Are you sure you want to logout? You'll need to login again to access the dashboard.",
            cancel: "Cancel",
            confirm: "Yes, Logout",
            loggingOut: "Logging out...",
            loggedOut: "Logged out!",
            error: "Error! Try again"
        },

        // Time
        time: {
            justNow: "Just now",
            minutesAgo: "m ago",
            hoursAgo: "h ago",
            daysAgo: "d ago"
        }
    },

    id: {
        // Dashboard
        dashboard: {
            title: "Dasbor",
            subtitle: "Selamat datang kembali! Berikut yang terjadi dengan gateway WhatsApp Anda hari ini."
        },

        // Stats
        stats: {
            totalMessages: "Total Pesan Terkirim",
            activeDevices: "Perangkat Aktif",
            totalContacts: "Total Kontak",
            deliveryRate: "Tingkat Pengiriman"
        },

        // Sidebar
        sidebar: {
            dashboard: "Dasbor",
            devices: "Perangkat",
            messages: "Pesan",
            contacts: "Kontak",
            automation: "Otomasi",
            autoReply: "Balas Otomatis",
            webhooks: "Webhook",
            account: "Akun",
            subscription: "Langganan",
            settings: "Pengaturan"
        },

        // Recent Activity
        activity: {
            title: "Aktivitas Terbaru",
            viewAll: "Lihat Semua",
            noActivity: "Belum Ada Aktivitas",
            noActivityDesc: "Mulai dengan mengirim pesan WhatsApp pertama Anda.<br>Aktivitas Anda akan muncul di sini.",
            sendFirstMessage: "Kirim Pesan Pertama",
            messageSent: "Pesan terkirim",
            messageFailed: "Pesan gagal",
            to: "Ke"
        },

        // Quick Actions
        quickActions: {
            title: "Aksi Cepat",
            addDevice: "Tambah Perangkat",
            sendMessage: "Kirim Pesan",
            addContact: "Tambah Kontak",
            setupBot: "Setup Bot"
        },

        // Logout Modal
        logout: {
            title: "Konfirmasi Keluar",
            description: "Apakah Anda yakin ingin keluar? Anda perlu login kembali untuk mengakses dasbor.",
            cancel: "Batal",
            confirm: "Ya, Keluar",
            loggingOut: "Sedang keluar...",
            loggedOut: "Berhasil keluar!",
            error: "Error! Coba lagi"
        },

        // Time
        time: {
            justNow: "Baru saja",
            minutesAgo: "m yang lalu",
            hoursAgo: "j yang lalu",
            daysAgo: "h yang lalu"
        }
    }
};

// Current language (default: en)
let currentLang = localStorage.getItem('language') || 'en';

// Get translation
function t(key) {
    const keys = key.split('.');
    let value = translations[currentLang];

    for (const k of keys) {
        value = value[k];
        if (value === undefined) {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }
    }

    return value;
}

// Update all elements with data-i18n attribute
function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.innerHTML = translation;
        }
    });
}

// Toggle language
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('language', currentLang);

    // Update current lang display
    document.getElementById('currentLang').textContent = currentLang.toUpperCase();

    // Update all translations
    updateTranslations();

    // Trigger custom event for other scripts to react
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
}

// Initialize i18n on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language display
    document.getElementById('currentLang').textContent = currentLang.toUpperCase();

    // Update all translations
    updateTranslations();
});

// Export for use in other scripts
window.i18n = {
    t,
    currentLang: () => currentLang,
    toggleLanguage,
    updateTranslations
};
