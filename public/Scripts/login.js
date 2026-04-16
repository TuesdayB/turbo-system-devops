//checks if already logged in, if so, redirects
window.addEventListener('load', function() {
    const token = localStorage.getItem('jwtToken');
    if(token){
        window.location.href = '/';
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('jwtToken', result.token);
            localStorage.setItem('username', result.user.username);
            
            showMessage(`✅ Login successful! Welcome, ${result.user.username}!`, 'success');
            
            // Check if user should be redirected after login
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect');
            
            if (redirectTo) {
                // Redirect to the original page they were trying to access
                setTimeout(() => {
                    window.location.href = redirectTo + '?from=login';
                }, 1000);
            } else {
                showMessage(`✅ Login successful! Welcome, ${result.user.username}!`, 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } else {
            showMessage(`❌ Login failed: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});