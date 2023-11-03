// renderer.js

// Access the electronAPI object exposed by preload.js
// const electronAPI = window.electronAPI;
// import Swal from '/node_modules/sweetalert2/dist/sweetalert2.min.js';

const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-btn');
const statusMessage = document.getElementById('status-message');


// Check if the user is logged in


const username = localStorage.getItem('user');
if (username) {
    window.location.href = 'dashboard.html';
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    // Send a login request to the main process using the electronAPI
    const response = await window.electronAPI.sendLoginRequest(username, password);
    if (response.success) {
        // Show a success alert using SweetAlert2
        localStorage.setItem('user', username);
        Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Welcome to the application.',
        });
       setTimeout(() => {
        if (username) {
            window.location.href = 'dashboard.html';
        }
       }, 1000);
        
        // Redirect to the main application page or perform necessary actions
    } else {
        // Show a failure alert using SweetAlert2
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid username or password.',
        });
    }
});
