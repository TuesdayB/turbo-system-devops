//checks if already logged in, if so, redirects
window.addEventListener('load', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('jwtToken');

    if(!token){
        window.location.href = '/';
    }
    
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        
        if (response.ok) { 
            hasAdmin = result.user.hasAdmin;
            if (!hasAdmin){
                window.location.href = '/';
            }
        } else {
            showMessage(`❌ Failed: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

