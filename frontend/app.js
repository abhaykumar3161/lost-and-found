const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let authToken = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadItems();
    setDefaultDate();
});

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateNav();
    }
}

// Update navigation based on auth status
function updateNav() {
    if (currentUser) {
        document.getElementById('auth-links').style.display = 'none';
        document.getElementById('user-links').style.display = 'flex';
        document.getElementById('user-name').textContent = `Hi, ${currentUser.name}`;
    } else {
        document.getElementById('auth-links').style.display = 'flex';
        document.getElementById('user-links').style.display = 'none';
    }
}

// Show/Hide pages
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageName}-page`).classList.add('active');
    
    if (pageName === 'home') loadItems();
    if (pageName === 'dashboard') loadDashboard();
    if (pageName === 'my-items') loadMyItems();
    if (pageName === 'add-item') prefillContactInfo();
    if (pageName === 'account') loadAccountDetails();
}

// Register
async function register(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    showLoading(submitBtn);
    
    const data = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        password: document.getElementById('reg-password').value,
    };
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            authToken = result.token;
            currentUser = result.user;
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateNav();
            showAlert(`Welcome ${result.user.name}! 🎉`, 'success');
            event.target.reset();
            setTimeout(() => showPage('dashboard'), 500);
        } else {
            showAlert(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

// Login
async function login(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    showLoading(submitBtn);
    
    const data = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
    };
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            authToken = result.token;
            currentUser = result.user;
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateNav();
            showAlert(`Welcome back, ${result.user.name}! 👋`, 'success');
            event.target.reset();
            setTimeout(() => showPage('dashboard'), 500);
        } else {
            showAlert(result.error || 'Invalid credentials', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    updateNav();
    showPage('home');
    showAlert('Logged out successfully', 'info');
}

// Load all items
async function loadItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        displayItems(items, 'items-grid');
        document.getElementById('items-count').textContent = `All Items (${items.length})`;
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

// Search items
async function searchItems() {
    const search = document.getElementById('search').value;
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;
    
    let url = `${API_URL}/items?`;
    if (search) url += `search=${search}&`;
    if (type) url += `type=${type}&`;
    if (category) url += `category=${category}&`;
    
    try {
        const response = await fetch(url);
        const items = await response.json();
        displayItems(items, 'items-grid');
        document.getElementById('items-count').textContent = `Found ${items.length} Items`;
    } catch (error) {
        console.error('Error searching items:', error);
    }
}

// Display items
function displayItems(items, containerId) {
    const container = document.getElementById(containerId);
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; grid-column: 1/-1;">No items found</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="item-card" onclick="showItemDetails('${item._id}')">
            <div class="item-type ${item.type}">
                ${item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
            </div>
            <div class="item-content">
                <h3>${item.itemName}</h3>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
                <p style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${item.description}
                </p>
                <span class="item-status ${item.status}">${item.status}</span>
            </div>
        </div>
    `).join('');
}

// Show item details
async function showItemDetails(itemId) {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}`);
        const item = await response.json();
        
        const detailsHTML = `
            <div class="item-type ${item.type}" style="margin-bottom: 20px;">
                ${item.type === 'lost' ? '🔍 Lost Item' : '✅ Found Item'}
            </div>
            
            <h2 style="margin-bottom: 20px; color: #333;">${item.itemName}</h2>
            
            <div class="detail-section">
                <h3>Details</h3>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="item-status ${item.status}">${item.status}</span></p>
            </div>
            
            <div class="detail-section">
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> ${item.contactName}</p>
                <p><strong>Phone:</strong> ${item.contactPhone}</p>
                <p><strong>Email:</strong> ${item.contactEmail}</p>
            </div>
            
            ${currentUser && item.userId === currentUser._id ? `
                <div class="detail-actions">
                    <button onclick="updateItemStatus('${item._id}', 'resolved')" class="btn">Mark as Resolved</button>
                    <button onclick="deleteItem('${item._id}')" class="btn" style="background:#dc3545;">Delete</button>
                </div>
            ` : ''}
        `;
        
        document.getElementById('item-details').innerHTML = detailsHTML;
        document.getElementById('item-modal').classList.add('active');
    } catch (error) {
        showAlert('Error loading item details', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('item-modal').classList.remove('active');
}

// Post new item
async function postItem(event) {
    event.preventDefault();
    
    if (!authToken) {
        showAlert('Please login first', 'error');
        showPage('login');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    showLoading(submitBtn);
    
    const data = {
        type: document.getElementById('item-type').value,
        itemName: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        description: document.getElementById('item-desc').value,
        location: document.getElementById('item-location').value,
        date: document.getElementById('item-date').value,
        contactName: document.getElementById('contact-name').value,
        contactPhone: document.getElementById('contact-phone').value,
        contactEmail: document.getElementById('contact-email').value,
    };
    
    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const typeEmoji = data.type === 'lost' ? '🔍' : '✅';
            showAlert(`${typeEmoji} Item posted successfully!`, 'success');
            event.target.reset();
            setDefaultDate();
            setTimeout(() => showPage('my-items'), 500);
        } else {
            const result = await response.json();
            showAlert(result.error || 'Failed to post item', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

// Load user's items
async function loadMyItems() {
    if (!authToken) {
        showPage('login');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/my-items`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const items = await response.json();
        displayItems(items, 'my-items-grid');
    } catch (error) {
        showAlert('Error loading your items', 'error');
    }
}

// Update item status
async function updateItemStatus(itemId, status) {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showAlert('Item updated!', 'success');
            closeModal();
            loadMyItems();
        } else {
            showAlert('Failed to update item', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Delete item
async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`${API_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            showAlert('Item deleted!', 'success');
            closeModal();
            loadMyItems();
        } else {
            showAlert('Failed to delete item', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Load dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-lost').textContent = stats.lost;
        document.getElementById('stat-found').textContent = stats.found;
        
        // Load recent items
        const itemsResponse = await fetch(`${API_URL}/items`);
        const items = await itemsResponse.json();
        displayItems(items.slice(0, 6), 'dashboard-items');
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Prefill contact info
function prefillContactInfo() {
    if (currentUser) {
        document.getElementById('contact-name').value = currentUser.name;
        document.getElementById('contact-phone').value = currentUser.phone;
        document.getElementById('contact-email').value = currentUser.email;
    }
}

// Set default date
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('item-date').value = today;
}

// Show alert with better animations
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '100px';
    alert.style.right = '20px';
    alert.style.zIndex = '3000';
    alert.style.minWidth = '320px';
    alert.style.maxWidth = '400px';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.4s ease-out';
        setTimeout(() => {
            alert.remove();
        }, 400);
    }, 3500);
}

// Show loading state
function showLoading(button) {
    button.classList.add('loading');
    button.disabled = true;
}

// Hide loading state
function hideLoading(button) {
    button.classList.remove('loading');
    button.disabled = false;
}

// Load account details
async function loadAccountDetails() {
    if (!authToken) {
        showPage('login');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const { user, stats } = data;
            
            // Update profile info
            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('profile-phone').textContent = user.phone;
            document.getElementById('profile-joined').textContent = new Date(user.createdAt).toLocaleDateString();
            
            // Update avatar
            document.getElementById('avatar-letter').textContent = user.name.charAt(0).toUpperCase();
            
            // Update status
            const statusBadge = document.getElementById('profile-status');
            if (user.isVerified) {
                statusBadge.textContent = '✓ Verified';
                statusBadge.className = 'status-badge verified';
                document.getElementById('verify-btn').style.display = 'none';
            } else {
                statusBadge.textContent = '⚠ Not Verified';
                statusBadge.className = 'status-badge unverified';
                document.getElementById('verify-btn').style.display = 'block';
            }
            
            // Update stats
            document.getElementById('account-total').textContent = stats.totalItems;
            document.getElementById('account-lost').textContent = stats.lostItems;
            document.getElementById('account-found').textContent = stats.foundItems;
            document.getElementById('account-resolved').textContent = stats.resolvedItems;
            
            // Prefill edit form
            document.getElementById('edit-name').value = user.name;
            document.getElementById('edit-phone').value = user.phone;
            document.getElementById('edit-bio').value = user.bio || '';
            document.getElementById('edit-address').value = user.address || '';
        }
    } catch (error) {
        showAlert('Error loading profile', 'error');
    }
}

// Update profile
async function updateProfile(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    showLoading(submitBtn);
    
    const data = {
        name: document.getElementById('edit-name').value,
        phone: document.getElementById('edit-phone').value,
        bio: document.getElementById('edit-bio').value,
        address: document.getElementById('edit-address').value,
    };
    
    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser.name = result.user.name;
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateNav();
            showAlert('✓ Profile updated successfully!', 'success');
            loadAccountDetails();
        } else {
            showAlert(result.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

// Change password
async function changePassword(event) {
    event.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    showLoading(submitBtn);
    
    const data = {
        currentPassword: document.getElementById('current-password').value,
        newPassword: newPassword,
    };
    
    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('🔒 Password changed successfully!', 'success');
            event.target.reset();
        } else {
            showAlert(result.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

// Show OTP verification modal
function showVerifyOTP() {
    document.getElementById('otp-modal').classList.add('active');
    sendOTP();
}

// Close OTP modal
function closeOTPModal() {
    document.getElementById('otp-modal').classList.remove('active');
    document.getElementById('otp-input').value = '';
}

// Send OTP
async function sendOTP() {
    try {
        const response = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            if (result.emailSent) {
                // Email was sent successfully
                document.getElementById('otp-display').style.display = 'none';
                showAlert('📧 OTP sent to your email! Check your inbox.', 'success');
            } else if (result.otp) {
                // Email not configured, show OTP in modal
                document.getElementById('otp-code').textContent = result.otp;
                document.getElementById('otp-display').style.display = 'block';
                showAlert('⚠️ ' + result.message, 'info');
            }
        } else {
            showAlert(result.error || 'Failed to send OTP', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Verify OTP
async function verifyOTP(event) {
    event.preventDefault();
    
    const otp = document.getElementById('otp-input').value;
    
    try {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUser.email,
                otp: otp 
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('✓ Account verified successfully! 🎉', 'success');
            closeOTPModal();
            loadAccountDetails();
        } else {
            showAlert(result.error || 'Verification failed', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}
