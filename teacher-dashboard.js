// Global variables
let allStudents = [];
let allApplications = [];
let currentSortField = 'name';
let sortDirection = 1; // 1 for ascending, -1 for descending

// Check if teacher is logged in
function checkLogin() {
    const teacherData = sessionStorage.getItem('teacherData');
    if (!teacherData) {
        window.location.href = 'index.html';
    }
    return JSON.parse(teacherData);
}

// Initialize dashboard
function initializeDashboard() {
    const teacherData = checkLogin();
    document.getElementById('teacherNameDisplay').textContent = teacherData.name;

    // Load initial data
    loadAllData();

    // Set up real-time updates (every 3 seconds)
    setInterval(loadAllData, 3000);
}

function loadAllData() {
    // Load students from localStorage or initialize sample data
    const storedStudents = localStorage.getItem('students');
    if (!storedStudents) {
        // Initialize with sample data if none exists
        allStudents = [{
                id: 'S001',
                name: 'Rahul Sharma',
                department: 'Computer',
                year: 'Third',
                contact: '9876543210',
                parentContact: '9876543211',
                accommodation: 'Hosteller',
                roomNo: 'H101',
                status: 'Active'
            },
            {
                id: 'S002',
                name: 'Priya Patel',
                department: 'IT',
                year: 'Second',
                contact: '9876543212',
                parentContact: '9876543213',
                accommodation: 'Non-Hosteller',
                address: 'Near College',
                status: 'Active'
            },
            // Add more sample students as needed
        ];
        localStorage.setItem('students', JSON.stringify(allStudents));
    } else {
        allStudents = JSON.parse(storedStudents);
    }

    // Load leave applications
    allApplications = JSON.parse(localStorage.getItem('leaveApplications') || []);

    // Update UI
    renderAllSections();
}

function renderAllSections() {
    renderStudentList();
    renderPendingRequests();
    renderLeaveHistory();
    renderHostellers();
    renderNonHostellers();
}

function renderStudentList() {
    const tbody = document.getElementById('studentListBody');
    tbody.innerHTML = '';

    // Sort students
    const sortedStudents = [...allStudents].sort((a, b) => {
        if (a[currentSortField] < b[currentSortField]) return -1 * sortDirection;
        if (a[currentSortField] > b[currentSortField]) return 1 * sortDirection;
        return 0;
    });

    sortedStudents.forEach(student => {
                const activeLeave = allApplications.find(app =>
                    app.studentId === student.id &&
                    app.status === 'Approved' &&
                    new Date(app.startDate) <= new Date() &&
                    new Date(app.endDate) >= new Date()
                );

                tbody.innerHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>${student.year}</td>
                <td>${student.contact}</td>
                <td>${student.parentContact}</td>
                <td>${student.accommodation}</td>
                <td class="status-${activeLeave ? 'on-leave' : 'active'}">
                    ${activeLeave ? 'On Leave' : 'Active'}
                    ${activeLeave ? `<br><small>${activeLeave.startDate} to ${activeLeave.endDate}</small>` : ''}
                </td>
            </tr>
        `;
    });
}

function renderPendingRequests() {
    const pendingApplications = allApplications.filter(app => 
        app.status === 'Pending' && 
        app.accommodationType === 'non-hosteller'
    );
    
    const tbody = document.getElementById('pendingRequestsBody');
    
    if (pendingApplications.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    No pending leave applications for non-hostellers
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
        const student = allStudents.find(s => s.id === app.studentId) || {};
        
        tbody.innerHTML += `
            <tr>
                <td>${student.name || app.studentName}</td>
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

function renderLeaveHistory() {
    const tbody = document.getElementById('leaveHistoryBody');
    tbody.innerHTML = '';
    
    allApplications.forEach(app => {
        const startDate = new Date(app.startDate);
        const endDate = new Date(app.endDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const student = allStudents.find(s => s.id === app.studentId) || {};
        
        tbody.innerHTML += `
            <tr>
                <td>${student.name || app.studentName}</td>
                <td>${app.studentId}</td>
                <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
                <td>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</td>
                <td>${days} days</td>
                <td>${app.reason}</td>
                <td>${app.accommodationType === 'hosteller' ? 'Hosteller' : 'Non-Hosteller'}</td>
                <td><span class="status-${app.status.toLowerCase()}">${app.status}</span></td>
                <td>${app.remarks || '-'}</td>
            </tr>
        `;
    });
}

function renderHostellers() {
    const hostellers = allStudents.filter(s => s.accommodation === 'Hosteller');
    const tbody = document.getElementById('hostellersBody');
    tbody.innerHTML = '';
    
    hostellers.forEach(student => {
        const activeLeave = allApplications.find(app => 
            app.studentId === student.id && 
            app.status === 'Approved' &&
            new Date(app.startDate) <= new Date() &&
            new Date(app.endDate) >= new Date()
        );
        
        tbody.innerHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>${student.year}</td>
                <td>${student.roomNo || '-'}</td>
                <td class="status-${activeLeave ? 'on-leave' : 'active'}">
                    ${activeLeave ? 'On Leave' : 'Active'}
                </td>
            </tr>
        `;
    });
}

function renderNonHostellers() {
    const nonHostellers = allStudents.filter(s => s.accommodation === 'Non-Hosteller');
    const tbody = document.getElementById('nonHostellersBody');
    tbody.innerHTML = '';
    
    nonHostellers.forEach(student => {
        const activeLeave = allApplications.find(app => 
            app.studentId === student.id && 
            app.status === 'Approved' &&
            new Date(app.startDate) <= new Date() &&
            new Date(app.endDate) >= new Date()
        );
        
        tbody.innerHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>${student.year}</td>
                <td>${student.address || '-'}</td>
                <td class="status-${activeLeave ? 'on-leave' : 'active'}">
                    ${activeLeave ? 'On Leave' : 'Active'}
                </td>
            </tr>
        `;
    });
}

// Sorting functionality
function sortStudents(field) {
    if (currentSortField === field) {
        sortDirection *= -1; // Toggle sort direction
    } else {
        currentSortField = field;
        sortDirection = 1;
    }
    renderStudentList();
}

// Filter leave history
function filterLeaveHistory(status) {
    const tbody = document.getElementById('leaveHistoryBody');
    tbody.innerHTML = '';
    
    const filteredApplications = status === 'all' 
        ? allApplications 
        : allApplications.filter(app => app.status.toLowerCase() === status);
    
    filteredApplications.forEach(app => {
        const startDate = new Date(app.startDate);
        const endDate = new Date(app.endDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const student = allStudents.find(s => s.id === app.studentId) || {};
        
        tbody.innerHTML += `
            <tr>
                <td>${student.name || app.studentName}</td>
                <td>${app.studentId}</td>
                <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
                <td>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</td>
                <td>${days} days</td>
                <td>${app.reason}</td>
                <td>${app.accommodationType === 'hosteller' ? 'Hosteller' : 'Non-Hosteller'}</td>
                <td><span class="status-${app.status.toLowerCase()}">${app.status}</span></td>
                <td>${app.remarks || '-'}</td>
            </tr>
        `;
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Modal functions
let selectedApplication = null;

function showRemarksModal(studentId, dateApplied, action) {
    selectedApplication = { studentId, dateApplied, action };
    const modal = document.getElementById('remarksModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('modalSubmitBtn');
    const remarksText = document.getElementById('remarksText');
    
    remarksText.value = '';
    
    if (action === 'approve') {
        modalTitle.textContent = 'Add Approval Remarks';
        submitBtn.style.backgroundColor = '#28a745';
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
    } else {
        modalTitle.textContent = 'Add Rejection Remarks';
        submitBtn.style.backgroundColor = '#dc3545';
        submitBtn.innerHTML = '<i class="fas fa-times"></i> Reject';
    }
    
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
            app =>
                app.studentId === selectedApplication.studentId &&
                app.dateApplied === selectedApplication.dateApplied
        );

        if (applicationIndex === -1) {
            alert('Application not found.');
            return;
        }

        // Update application status and remarks
        applications[applicationIndex].status =
            selectedApplication.action === 'approve' ? 'Approved' : 'Rejected';
        applications[applicationIndex].remarks = remarks;

        localStorage.setItem('leaveApplications', JSON.stringify(applications));

        // ✅ Show popup message based on action
        if (selectedApplication.action === 'approve') {
            alert('✅ Leave application approved successfully!');
        } else {
            alert('❌ Leave application rejected successfully!');
        }

        // Refresh data and close modal
        loadAllData();
        closeModal();
    } catch (error) {
        alert('An error occurred while submitting the decision.');
        console.error(error);
    }
}


// Search functionality
function searchStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentListBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
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

function logout() {
    sessionStorage.removeItem('teacherData');
    window.location.href = 'index.html';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);