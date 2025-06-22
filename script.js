function showAccommodationSelection() {
    // Hide all other forms
    document.getElementById('studentLogin').style.display = 'none';
    document.getElementById('wardenLogin').style.display = 'none';
    document.getElementById('teacherLogin').style.display = 'none';
    document.getElementById('leaveApplication').style.display = 'none';

    // Show accommodation selection
    document.getElementById('accommodationSelection').style.display = 'block';
}

function selectAccommodation(type) {
    // Store accommodation type
    sessionStorage.setItem('accommodationType', type);

    // Hide accommodation selection
    document.getElementById('accommodationSelection').style.display = 'none';

    // Show student login form
    showLoginForm('student');
}

function showLoginForm(type) {
    // Hide all forms first
    document.getElementById('studentLogin').style.display = 'none';
    document.getElementById('wardenLogin').style.display = 'none';
    document.getElementById('teacherLogin').style.display = 'none';
    document.getElementById('leaveApplication').style.display = 'none';
    document.getElementById('accommodationSelection').style.display = 'none';

    // Show the selected form
    if (type === 'student' || type === 'warden' || type === 'teacher') {
        document.getElementById(`${type}Login`).style.display = 'block';
    }
}

function handleLogin(type) {
    event.preventDefault();

    const form = event.target;
    showLoading(form);

    setTimeout(() => {
        const id = form.querySelector('input[type="text"]').value;
        const password = form.querySelector('input[type="password"]').value;

        if (type === 'student') {
            const accommodationType = sessionStorage.getItem('accommodationType') || 'hosteller';
            const studentData = {
                id: id,
                name: "Student " + id,
                accommodation: accommodationType,
                isHosteller: accommodationType === 'hosteller'
            };
            sessionStorage.setItem('studentData', JSON.stringify(studentData));

            // 🆕 Save to localStorage students list
            let students = JSON.parse(localStorage.getItem('students') || '[]');
            const exists = students.some(s => s.id === id);
            if (!exists) {
                const newStudent = {
                    id: id,
                    name: studentData.name,
                    department: 'N/A',
                    year: 'N/A',
                    contact: 'N/A',
                    parentContact: 'N/A',
                    accommodation: accommodationType === 'hosteller' ? 'Hosteller' : 'Non-Hosteller',
                    roomNo: accommodationType === 'hosteller' ? 'H001' : undefined,
                    address: accommodationType === 'non-hosteller' ? 'Unknown' : undefined,
                    status: 'Active'
                };
                students.push(newStudent);
                localStorage.setItem('students', JSON.stringify(students));
            }

            window.location.href = 'student-dashboard.html';
        }
        else if (type === 'teacher') {
            const teacherData = {
                id: id,
                name: "Teacher " + id
            };
            sessionStorage.setItem('teacherData', JSON.stringify(teacherData));
            window.location.href = 'teacher-dashboard.html';
        } else {
            const wardenData = {
                id: id,
                name: "Warden " + id
            };
            sessionStorage.setItem('wardenData', JSON.stringify(wardenData));
            window.location.href = 'warden-dashboard.html';
        }
    }, 1000);
}

// Rest of your existing script.js functions remain the same
function submitLeaveApplication(event) {
    // Your existing submitLeaveApplication function
}

function showLoading(element) {
    // Your existing showLoading function
}