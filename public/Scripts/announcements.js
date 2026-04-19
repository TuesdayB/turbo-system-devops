// READ - Load all announcements
async function loadAnnouncements() {
    try {
        const response = await fetch('/api/announcements', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const announcements = await response.json();

        const announcementsPanel = document.getElementById('announcementsPanel');

        if (announcements.length === 0) {
            announcementsPanel.innerHTML = '<p class="text-muted">No announcements found.</p>';
            return;
        }

        announcementsPanel.innerHTML = announcements.map(announcement => `
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h3>${announcement.title}</h3>
                        <br>
                        <p>${announcement.bodyText}</p>
                        ${announcement.postedBy ? `<br><small class="text-muted">Posted by: ${announcement.postedBy}` : ''} on ${ new Date(announcement.postedAt).toLocaleString() }</small>
                    </div>
                </div>
            </div>
        `).join('');
        console.log();
    } catch (error) {
        showMessage(`❌ Error loading announcements: ${error.message}`, 'danger');
    }
}

loadAnnouncements();