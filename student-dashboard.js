// Check if user is logged in (you'll need to implement proper session management)
function checkLogin() {
    const studentData = sessionStorage.getItem('studentData');
    if (!studentData) {
        window.location.href = 'index.html';
    }
    return JSON.parse(studentData);
}

// Initialize dashboard
function initializeDashboard() {
    const studentData = checkLogin();
    document.getElementById('studentNameDisplay').textContent = studentData.name;
    
    // Load profile data
    loadProfileData();
    updateLeaveStatus();
    initializeValidation();
}

// Load profile data
function loadProfileData() {
    const studentData = checkLogin();
    const profileData = JSON.parse(localStorage.getItem(`profile_${studentData.id}`) || '{}');
    
    // Set existing profile data if available
    const fields = {
        'updateName': profileData.name || studentData.name || '',
        'updateEmail': profileData.email || '',
        'updateDepartment': profileData.department || '',
        'updateParentContact': profileData.parentContact || ''
    };

    // Update each field and trigger the input event
    Object.entries(fields).forEach(([id, value]) => {
        const input = document.getElementById(id);
        input.value = value;
        // Trigger input event to activate floating labels
        input.dispatchEvent(new Event('input'));
    });
}

// Handle profile update
function updateProfile(event) {
    event.preventDefault();
    
    const studentData = checkLogin();
    const form = event.target;
    
    // Validate password fields
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword || confirmPassword) {
        if (!currentPassword) {
            showError('currentPassword', 'Please enter your current password');
            return false;
        }
        if (newPassword !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            return false;
        }
        if (newPassword.length < 6) {
            showError('newPassword', 'Password must be at least 6 characters');
            return false;
        }
    }
    
    // Create profile data object
    const profileData = {
        name: document.getElementById('updateName').value.trim(),
        email: document.getElementById('updateEmail').value.trim(),
        department: document.getElementById('updateDepartment').value.trim(),
        parentContact: document.getElementById('updateParentContact').value.trim(),
        lastUpdated: new Date().toISOString()
    };
    
    try {
        // Validate required fields
        if (!profileData.name) throw new Error('Name is required');
        if (!profileData.email) throw new Error('Email is required');
        if (!profileData.department) throw new Error('Department is required');
        if (!profileData.parentContact) throw new Error('Parent contact is required');
        
        // Store in localStorage
        localStorage.setItem(`profile_${studentData.id}`, JSON.stringify(profileData));
        
        // Update display name everywhere
        document.getElementById('studentNameDisplay').textContent = profileData.name;
        
        // Update student data in session
        studentData.name = profileData.name;
        sessionStorage.setItem('studentData', JSON.stringify(studentData));
        
        showSuccess('Profile updated successfully!');
        
        // Reset password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
    } catch (error) {
        showError(null, error.message);
    }
    
    return false;
}

// Helper functions for form validation
function showError(fieldId, message) {
    if (fieldId) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('error');
        const errorDiv = formGroup.querySelector('.error-message') || 
            createErrorElement(formGroup);
        errorDiv.textContent = message;
    }
    alert(message); // For now, also show an alert
}

function showSuccess(message) {
    // Clear any existing errors
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
    });
    alert(message); // For now, show an alert
}

function createErrorElement(formGroup) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    formGroup.appendChild(errorDiv);
    return errorDiv;
}

// Show different sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Handle leave application submission
function submitLeaveApplication(event) {
    event.preventDefault();
    
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    // Validate dates
    if (startDate < new Date().setHours(0, 0, 0, 0)) {
        showError('startDate', 'Start date cannot be in the past');
        return false;
    }
    
    if (endDate < startDate) {
        showError('endDate', 'End date must be after start date');
        return false;
    }
    
    const studentData = checkLogin();
    const leaveApplication = {
        studentName: studentData.name,
        studentId: studentData.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason: document.getElementById('leaveReason').value.trim(),
        status: 'Pending',
        dateApplied: new Date().toISOString().split('T')[0],
        accommodationType: studentData.accommodation // 👈 ADDED: hosteller / non-hosteller
    };

    
    try {
        // Validate fields
        if (!leaveApplication.reason) {
            throw new Error('Please provide a reason for leave');
        }
        
        // Store leave application
        const applications = JSON.parse(localStorage.getItem('leaveApplications') || '[]');
        applications.push(leaveApplication);
        localStorage.setItem('leaveApplications', JSON.stringify(applications));
        
        // Update UI
        updateLeaveHistory();
        updateLeaveStatus();
        
        showSuccess('Leave Application Submitted Successfully!');
        event.target.reset();
        
    } catch (error) {
        showError(null, error.message);
    }
    
    return false;
}

// Update leave history table
function updateLeaveHistory() {
    const applications = JSON.parse(localStorage.getItem('leaveApplications') || '[]');
    const studentData = checkLogin();
    const tbody = document.getElementById('leaveHistoryBody');
    
    tbody.innerHTML = '';
    
    applications
        .filter(app => app.studentId === studentData.id)
        .forEach(app => {
            tbody.innerHTML += `
                <tr>
                    <td>${app.dateApplied}</td>
                    <td>${app.startDate}</td>
                    <td>${app.endDate}</td>
                    <td>${app.reason}</td>
                    <td><span class="status-${app.status.toLowerCase()}">${app.status}</span></td>
                </tr>
            `;
        });
}

// Logout function
function logout() {
    sessionStorage.removeItem('studentData');
    window.location.href = 'index.html';
}

let currentFilter = 'all';

function filterLeaveStatus(status) {
    currentFilter = status;
    updateLeaveStatus();
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function updateLeaveStatus() {
    const applications = JSON.parse(localStorage.getItem('leaveApplications') || '[]');
    const studentData = checkLogin();
    const tbody = document.getElementById('leaveStatusBody');
    
    // Filter applications for current student
    const studentApplications = applications.filter(app => app.studentId === studentData.id);
    
    // Update status counts
    const counts = {
        pending: 0,
        approved: 0,
        rejected: 0
    };
    
    studentApplications.forEach(app => {
        counts[app.status.toLowerCase()]++;
    });
    
    // Update count displays
    document.getElementById('pendingCount').textContent = counts.pending;
    document.getElementById('approvedCount').textContent = counts.approved;
    document.getElementById('rejectedCount').textContent = counts.rejected;
    
    // Filter applications based on selected status
    const filteredApplications = currentFilter === 'all' 
        ? studentApplications 
        : studentApplications.filter(app => app.status.toLowerCase() === currentFilter);
    
    // Clear and populate table
    tbody.innerHTML = '';
    
    filteredApplications.forEach(app => {
        const startDate = new Date(app.startDate);
        const endDate = new Date(app.endDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        tbody.innerHTML += `
            <tr>
                <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
                <td>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</td>
                <td>${days} days</td>
                <td>${app.reason}</td>
                <td><span class="status-${app.status.toLowerCase()}">${app.status}</span></td>
                <td class="remarks">${app.remarks || '-'}</td>
            </tr>
        `;
    });
}

// Add this function
function initializeValidation() {
    // Add date input listeners
    document.getElementById('startDate').addEventListener('change', function() {
        const startDate = new Date(this.value);
        if (startDate < new Date().setHours(0, 0, 0, 0)) {
            showError('startDate', 'Start date cannot be in the past');
        } else {
            clearError('startDate');
        }
    });
    
    document.getElementById('endDate').addEventListener('change', function() {
        const endDate = new Date(this.value);
        const startDate = new Date(document.getElementById('startDate').value);
        if (endDate < startDate) {
            showError('endDate', 'End date must be after start date');
        } else {
            clearError('endDate');
        }
    });
    
    // Add email validation
    document.getElementById('updateEmail').addEventListener('input', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value)) {
            showError('updateEmail', 'Please enter a valid email address');
        } else {
            clearError('updateEmail');
        }
    });
    
    // Add phone number validation
    document.getElementById('updateParentContact').addEventListener('input', function() {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(this.value)) {
            showError('updateParentContact', 'Please enter a valid 10-digit phone number');
        } else {
            clearError('updateParentContact');
        }
    });
}

// Add this helper function
function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error');
    const errorDiv = formGroup.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard); 