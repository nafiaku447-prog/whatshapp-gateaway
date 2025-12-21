// ============================================
// API Configuration
// ============================================
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// API Helper Functions
// ============================================

// Make API request with error handling
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// Authentication API
// ============================================

const AuthAPI = {
    // Register new user
    register: async (userData) => {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        // Save token
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    // Login user
    login: async (email, password) => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Save token
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    // Get current user
    getCurrentUser: async () => {
        return await apiRequest('/auth/me');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get stored user
    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// ============================================
// Devices API
// ============================================

const DevicesAPI = {
    // Get all devices
    getAll: async () => {
        return await apiRequest('/devices');
    },

    // Create new device
    create: async (deviceData) => {
        return await apiRequest('/devices', {
            method: 'POST',
            body: JSON.stringify(deviceData)
        });
    },

    // Get device by ID
    getById: async (id) => {
        return await apiRequest(`/devices/${id}`);
    },

    // Delete device
    delete: async (id) => {
        return await apiRequest(`/devices/${id}`, {
            method: 'DELETE'
        });
    }
};

// ============================================
// Messages API
// ============================================

const MessagesAPI = {
    // Send message
    send: async (messageData) => {
        return await apiRequest('/messages/send', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    },

    // Get message history
    getHistory: async () => {
        return await apiRequest('/messages');
    }
};

// ============================================
// Contacts API
// ============================================

const ContactsAPI = {
    // Get all contacts
    getAll: async () => {
        return await apiRequest('/contacts');
    }
};

// ============================================
// Statistics API
// ============================================

const StatsAPI = {
    // Get dashboard statistics
    getDashboard: async () => {
        return await apiRequest('/stats/dashboard');
    }
};

// ============================================
// Users API
// ============================================

const UsersAPI = {
    // Get user profile
    getProfile: async () => {
        return await apiRequest('/users/profile');
    },

    // Update profile
    updateProfile: async (data) => {
        return await apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // Change password
    changePassword: async (data) => {
        return await apiRequest('/users/password', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // Regenerate API Key
    regenerateApiKey: async () => {
        return await apiRequest('/users/api-key/regenerate', {
            method: 'POST'
        });
    },

    // Upload Avatar
    uploadAvatar: async (formData) => {
        // We can't use standard apiRequest because it sets Content-Type to application/json
        // So we manually fetch
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'File upload failed');
        }
        return await response.json();
    }
};

// ============================================
// Utility Functions
// ============================================

// Show error message
function showError(message, elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Auto hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Show success message
function showSuccess(message, elementId = 'success-message') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';

        // Auto hide after 3 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
}

// Show loading state
function showLoading(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.dataset.originalText = originalText;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
}

// Hide loading state
function hideLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Redirect if not authenticated
function requireAuth() {
    if (!AuthAPI.isAuthenticated()) {
        window.location.href = 'login.html';
    } else {
        // Load from localStorage first for instant display
        loadUserProfileFromCache();
        // Then IMMEDIATELY fetch fresh data from API to ensure profilePicture is up to date
        loadUserProfileToSidebar();
    }
}

// Load user profile from localStorage for instant display
function loadUserProfileFromCache() {
    try {
        const cachedUser = localStorage.getItem('user');
        if (!cachedUser) return;

        const user = JSON.parse(cachedUser);
        updateSidebarUI(user);
    } catch (error) {
        console.error('Error loading cached profile:', error);
    }
}

// Load user profile and update sidebar avatar
async function loadUserProfileToSidebar() {
    try {
        const response = await UsersAPI.getProfile();
        const user = response.user;

        if (!user) return;

        // Update sidebar UI
        updateSidebarUI(user);

        // Update localStorage for next time
        localStorage.setItem('user', JSON.stringify(user));

    } catch (error) {
        console.error('Error loading user profile to sidebar:', error);
    }
}

// Helper function to update sidebar UI
function updateSidebarUI(user) {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userAvatarEl = document.getElementById('userAvatar');

    if (userNameEl) {
        const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
        userNameEl.textContent = fullName;
    }

    if (userEmailEl) {
        userEmailEl.textContent = user.email;
    }

    if (userAvatarEl) {
        // Check if avatar already has content (from inline script) to avoid flash
        const alreadySet = userAvatarEl.style.backgroundImage || userAvatarEl.textContent;

        if (user.profilePicture) {
            // Only update if different to avoid flicker
            const newBg = `url("${user.profilePicture}")`;
            if (userAvatarEl.style.backgroundImage !== newBg) {
                userAvatarEl.textContent = '';
                userAvatarEl.style.backgroundImage = newBg;
                userAvatarEl.style.backgroundSize = 'cover';
                userAvatarEl.style.backgroundPosition = 'center';
            }
        } else if (!alreadySet || !user.profilePicture) {
            // Set initial only if not already set
            const initial = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
            if (userAvatarEl.textContent !== initial) {
                userAvatarEl.style.backgroundImage = 'none';
                userAvatarEl.textContent = initial;
            }
        }
    }
}

// Redirect if already authenticated
function requireGuest() {
    if (AuthAPI.isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
}
