
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
        window.location.href = 'index.html'; // Redirect to login page if not logged in
    }
  
