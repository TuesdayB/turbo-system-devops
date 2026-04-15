//Handle User Creation
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    try {
        const response = await fetch('/api/auth/newuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                confirmPassword
            })
        });
        const result = await response.json();

        if (response.ok) {
            showMessage(result.message);
            //   showMessage(result.message, 'success');
            //   document.getElementById('quiltForm').reset();
            //   if (editingId) {
            //     editingId = null;
            //     document.querySelector('button[type="submit"]').textContent = 'Save Quilt';
        // }
        fetch('/');
    } else {
        showMessage(result.error, 'error');
    }
} catch (error) {
    showMessage('Error submitting form', 'error');
}
    });