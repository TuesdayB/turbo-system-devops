existingEmail = null;
//CREATE/DELETE - New subscriber or delete existing subscriber
document.getElementById('mailingListSignup').addEventListener('submit', async (e) => {
    e.preventDefault();
    newEmail = document.getElementById('emailSubscribe').value;

    await findSubscriber(newEmail);
    if (!existingEmail) {
        newSubscriber(newEmail);
    } else {
        deleteSubscriber(existingEmail);
    }
    existingEmail = null;
    document.getElementById('mailingListSignup').reset();
});

async function newSubscriber(email) {
    const subscriber = {
        email: email
    };
    try {
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriber)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Subscribed successfully!`, 'success');
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');

        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}

async function findSubscriber(email) {
    try {
        const response = await fetch(`/api/subscribe/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        existingEmail = await response.json();
        console.log(JSON.stringify(existingEmail));
    } catch (error) {
        showMessage(`❌ Error loading subscribers: ${error.message}`, 'danger');
    }
}

async function deleteSubscriber(email) {
    id = email._id;
    emailAddress = email.email;
    if (!confirm(`Are you sure you want to unsubscribe "${emailAddress}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/subscribe/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Unsubscribed successfully!`, 'success');
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}
