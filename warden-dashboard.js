// Check if warden is logged in
function checkLogin() {
    const wardenData = sessionStorage.getItem('wardenData');
    if (!wardenData) {
        window.location.href = 'index.html';
    }
    return JSON.parse(wardenData);
}

// Initialize dashboard
function initializeDashboard() {
    const wardenData = checkLogin();
    document.getElementById('wardenNameDisplay').textContent = wardenData.name;
    updatePendingRequests();
    updateAllRequests();
}

// Show different sections
function showSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

let currentFilter = 'all';
let selectedApplication = null;

function filterRequests(status) {
    currentFilter = status;
    updateAllRequests();
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function updatePendingRequests() {
    const applications = JSON.parse(localStorage.getItem('leaveApplications') || '[]');
    const pendingApplications = applications.filter(app => 
    app.status === 'Pending' && 
    app.accommodationType === 'hosteller'
    );

    const tbody = document.getElementById('pendingRequestsBody');
    
    if (pendingApplications.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    No pending leave applications
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    pendingApplications.forEach(app => {
        const startDate = new Date(app.startDate);
        const endDate = new Date(app.endDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        tbody.innerHTML += `
            <tr>
                <td>${app.studentName}</td>
                <td>${app.studentId}</td>
                <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
                <td>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</td>
                <td>${days} days</td>
                <td>${app.reason}</td>
                <td>
                    <div class="action-buttons">
                        <button class="approve-btn" onclick="showRemarksModal('${app.studentId}', '${app.dateApplied}', 'approve')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="reject-btn" onclick="showRemarksModal('${app.studentId}', '${app.dateApplied}', 'reject')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function updateAllRequests() {
    const applications = JSON.parse(localStorage.getItem('leaveApplications') || '[]');
    const filteredApplications = currentFilter === 'all' 
        ? applications.filter(app => app.accommodationType === 'hosteller')
        : applications.filter(app => app.status.toLowerCase() === currentFilter);
    
    const tbody = document.getElementById('allRequestsBody');
    tbody.innerHTML = '';
    
    filteredApplications.forEach(app => {
        const startDate = new Date(app.startDate);
        const endDate = new Date(app.endDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        tbody.innerHTML += `
            <tr>
                <td>${app.studentName}</td>
                <td>${app.studentId}</td>
                <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
                <td>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</td>
                <td>${days} days</td>
                <td>${app.reason}</td>
                <td><span class="status-${app.status.toLowerCase()}">${app.status}</span></td>
                <td>${app.remarks || '-'}</td>
            </tr>
        `;
    });
}

function showRemarksModal(studentId, dateApplied, action) {
    selectedApplication = { studentId, dateApplied, action };
    const modal = document.getElementById('remarksModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('modalSubmitBtn');
    const remarksText = document.getElementById('remarksText');
    
    // Clear previous remarks
    remarksText.value = '';
    
    // Update modal title and button based on action
    if (action === 'approve') {
        modalTitle.textContent = 'Add Approval Remarks';
        submitBtn.style.backgroundColor = '#28a745';
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
        remarksText.placeholder = 'Enter approval remarks...';
    } else {
        modalTitle.textContent = 'Add Rejection Remarks';
        submitBtn.style.backgroundColor = '#dc3545';
        submitBtn.innerHTML = '<i class="fas fa-times"></i> Reject';
        remarksText.placeholder = 'Enter rejection reason...';
    }
    
    // Show modal with animation
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
        remarksText.focus();
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('remarksModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        selectedApplication = null;
    }, 300);
}

function submitDecision() {
    if (!selectedApplication) return;
    
    const remarks = document.getElementById('remarksText').value.trim();
    
    if (!remarks) {
        alert('Please add remarks before submitting your decision.');
        return;
    }
    
    try {
        const applications = JSON.parse(localStorage.getItem('leaveApplications') || '[]');
        
        // Find the application
        const applicationIndex = applications.findIndex(
            app => app.studentId === selectedApplication.studentId && 
                   app.dateApplied === selectedApplication.dateApplied
        );
        
        if (applicationIndex === -1) {
            throw new Error('Application not found');
        }
        
        // Update the application
        const newStatus = selectedApplication.action === 'approve' ? 'Approved' : 'Rejected';
        applications[applicationIndex] = {
            ...applications[applicationIndex],
            status: newStatus,
            remarks: remarks,
            decisionDate: new Date().toISOString(),
            decidedBy: JSON.parse(sessionStorage.getItem('wardenData')).name
        };
        
        // Save to localStorage
        localStorage.setItem('leaveApplications', JSON.stringify(applications));
        
        // Update UI
        updatePendingRequests();
        updateAllRequests();
        
        // Close modal and show success message
        closeModal();
        alert(`Leave application has been ${newStatus.toLowerCase()} successfully!`);
        
    } catch (error) {
        console.error('Error updating application:', error);
        alert('There was an error processing your decision. Please try again.');
    }
}

function logout() {
    sessionStorage.removeItem('wardenData');
    window.location.href = 'index.html';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard); 