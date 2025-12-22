/**
 * Toast Notification Library
 * Modern toast notification system with Tailwind-inspired design
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Create toast container if not exists
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Show a toast notification
     * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
     * @param {string} message - Toast message
     * @param {string} title - Toast title (optional)
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    show(type = 'info', message = '', title = '', duration = 3000) {
        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Default titles
        const defaultTitles = {
            success: 'Berhasil!',
            error: 'Error!',
            warning: 'Perhatian!',
            info: 'Informasi'
        };

        // Default icons
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toastTitle = title || defaultTitles[type] || defaultTitles.info;
        const iconClass = icons[type] || icons.info;

        // Create toast element
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${toastTitle}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="toastManager.dismiss('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress"></div>
        `;

        // Add to container
        this.container.appendChild(toast);
        this.toasts.push({ id: toastId, element: toast, timeout: null });

        // Auto dismiss after duration
        if (duration > 0) {
            const timeout = setTimeout(() => {
                this.dismiss(toastId);
            }, duration);

            // Store timeout reference
            const toastObj = this.toasts.find(t => t.id === toastId);
            if (toastObj) {
                toastObj.timeout = timeout;
            }
        }

        return toastId;
    }

    /**
     * Dismiss a specific toast
     * @param {string} toastId - ID of the toast to dismiss
     */
    dismiss(toastId) {
        const toastIndex = this.toasts.findIndex(t => t.id === toastId);

        if (toastIndex !== -1) {
            const { element, timeout } = this.toasts[toastIndex];

            // Clear timeout if exists
            if (timeout) {
                clearTimeout(timeout);
            }

            // Add hiding animation
            element.classList.add('hiding');

            // Remove after animation
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                this.toasts.splice(toastIndex, 1);
            }, 300);
        }
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        this.toasts.forEach(({ id }) => this.dismiss(id));
    }

    // Convenience methods
    success(message, title = '', duration = 3000) {
        return this.show('success', message, title, duration);
    }

    error(message, title = '', duration = 4000) {
        return this.show('error', message, title, duration);
    }

    warning(message, title = '', duration = 3500) {
        return this.show('warning', message, title, duration);
    }

    info(message, title = '', duration = 3000) {
        return this.show('info', message, title, duration);
    }
}

// Create global instance
const toastManager = new ToastManager();

// Legacy compatibility: showAlert function
function showAlert(type, message, title = '', duration = 3000) {
    // Map old alert types to toast types
    const typeMap = {
        'success': 'success',
        'danger': 'error',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };

    const toastType = typeMap[type] || 'info';
    return toastManager.show(toastType, message, title, duration);
}

// Export for use in modules (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToastManager, toastManager, showAlert };
}
