document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmRegisterPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, confirmPassword })
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Account created successfully! You can now login.`, 'success');
            document.getElementById('registrationForm').reset();
        } else {
            showMessage(`❌ Registration failed: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});