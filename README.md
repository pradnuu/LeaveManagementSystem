# Leave Management System

A simple frontend-only web application to manage student leave requests and approvals based on roles: Student, Teacher, and Warden.

Built using HTML, CSS, and JavaScript. No backend or server is required. All data is stored in the browser using localStorage and sessionStorage.


## Features

- Student login with accommodation type selection (Hosteller or Non-Hosteller)
- Submit leave requests with date and reason
- Track leave status, view history, and update profile
- Teacher login:
  - View all student data
  - Approve or reject leave requests from non-hosteller students
- Warden login:
  - Approve or reject leave requests from hosteller students
- Real-time updates to dashboards every few seconds
- Fully responsive design for desktop and mobile devices


## Technologies Used

- HTML5
- CSS3
- JavaScript
- LocalStorage and SessionStorage


## Project Structure

LeaveManagementSystem/
├── index.html               - Main login and accommodation selection  
├── script.js                - Handles login and routing  
├── styles.css               - Main styling (responsive)  
├── student-dashboard.html   - Student interface  
├── student-dashboard.js     - Student-side logic  
├── teacher-dashboard.html   - Teacher interface  
├── teacher-dashboard.js     - Teacher-side logic  
├── warden-dashboard.html    - Warden interface  
├── warden-dashboard.js      - Warden-side logic  
├── images/                  - Icons and logos (optional)


## How to Run

1. Download or clone the project.
2. Open index.html in any modern browser (Chrome recommended).
3. Choose a role to log in as: Student, Teacher, or Warden.
4. Use the features as needed. All data is stored in the browser and will reset when cleared.



## Live Demo

https://github.com/pradnuu/LeaveManagementSystem.git


## Notes

- This is a frontend-only project.
- There is no backend or database.
- All data is stored temporarily in the user's browser.
- It can be enhanced later with backend integration.


## Developed By

Pradnya Phadtare  
MMIT Lohgaon, Pune  
Under the guidance of Mr. Swapnil Gagare Sir
