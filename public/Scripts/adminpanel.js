//checks if already logged in, if so, redirects
window.addEventListener('load', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('jwtToken');

    if (!token) {
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
            if (!hasAdmin) {
                window.location.href = '/';
            }
        } else {
            showMessage(`❌ Failed: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

// Authentication helpers
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

function checkAuthentication() {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    // const authStatus = document.getElementById('authStatus');
    // const mainContent = document.getElementById('mainContent');

    if (!token) {
        mainContent.style.display = 'none';
        return false;
    } else {
        mainContent.style.display = 'block';
        return true;
    }
}

function resetForm(formID) {
    let editingId = null;
    document.getElementById('comicPageSubmission').innerHTML = "Publish Page";
    document.getElementById(formID).reset();
}

// Fill update form
function fillComicUpdateForm(id, title, index, pageLink) {
    editingId = id;
    document.getElementById('pageTitle').value = title;
    document.getElementById('pageIndex').value = index;
    document.getElementById('pageLink').value = pageLink;
    showMessage('📝 Comic data loaded in update form', 'info');
}

document.getElementById('editComics').addEventListener('click', (e) =>{
comicsContainers = document.getElementById('comicsContainers');
comicsContainers.hidden = false;
announcementsContainers = document.getElementById('announcementsContainers');
announcementsContainers.hidden = true;
let editingId = null;

});

document.getElementById('editAnnouncements').addEventListener('click', (e) =>{
comicsContainers = document.getElementById('comicsContainers');
comicsContainers.hidden = true;
announcementsContainers = document.getElementById('announcementsContainers');
announcementsContainers.hidden = false;
let editingId = null;

});

//CREATE/UPDATE - New comic or Edit existing comic
document.getElementById('comicPageEditor').addEventListener('submit', async (e) => {
    e.preventDefault();

    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }

    const comic = {
        title: document.getElementById('pageTitle').value,
        index: parseInt(document.getElementById('pageIndex').value),
        pageLink: document.getElementById('pageLink').value
    };

    if (editingId) {
        const id = editingId;
        try {
            const response = await fetch(`/api/comics/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(comic)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(`✅ Comic "${comic.title}" updated successfully!`, 'success');
                resetForm('comicPageEditor');
                loadPages();
            } else {
                showMessage(`❌ Error: ${result.error}`, 'danger');
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }
    } else {
        try {
            const response = await fetch('/api/comics', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(comic)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(`✅ Student "${comic.title}" added successfully!`, 'success');
                resetForm('comicPageEditor');
                loadPages();
            } else {
                if (response.status === 401 || response.status === 403) {
                    showMessage('❌ Authentication failed. Please login again.', 'danger');
                    logout();
                } else {
                    showMessage(`❌ Error: ${result.error}`, 'danger');
                }
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }
    }
});

// READ - Load all pages
async function loadPages() {
    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }

    try {
        const response = await fetch('/api/comics', {
            method: 'GET',
            headers: headers
        });

        if (response.status === 401 || response.status === 403) {
            showMessage('❌ Authentication failed. Please login again.', 'danger');
            logout();
            return;
        }

        const comics = await response.json();

        const comicPageList = document.getElementById('comicPageList');

        if (comics.length === 0) {
            comicPageList.innerHTML = '<p class="text-muted">No comics found.</p>';
            return;
        }

        comicPageList.innerHTML = comics.map(comic => `
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${comic.title}</strong> (Page # ${comic.index})
                        <br>
                        <small class="text-muted"><b>ID: <span class="comic-id" 
                            data-id="${comic._id}" 
                            data-title="${comic.title}" 
                            data-index="${comic.index}" 
                            data-link="${comic.pageLink}">${comic._id}</span></b></small>
                        <br><small class="text-muted">Link: <a href='${comic.pageLink}' target='_blank'>${comic.pageLink}</a></small>
                        ${comic.postedBy ? `<br><small class="text-muted">Created by: ${comic.postedBy}</small>` : ''}
                    </div>
                    <button class="btn btn-danger btn-sm delete-btn" 
                        data-comic-id="${comic._id}" 
                        data-comic-title="${comic.title}">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');

        // Add click event listeners for student IDs
        document.querySelectorAll('.comic-id').forEach(span => {
            span.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const title = this.getAttribute('data-title');
                const index = this.getAttribute('data-index');
                const pageLink = this.getAttribute('data-link');
                document.getElementById('comicPageSubmission').innerHTML = "Edit Page";
                fillComicUpdateForm(id, title, index, pageLink);
            });
        });

        // Add click event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-comic-id');
                const title = this.getAttribute('data-comic-title');
                deletePage(id, title);
            });
        });

        showMessage(`📋 Loaded ${comics.length} comics`, 'info');
    } catch (error) {
        showMessage(`❌ Error loading comics: ${error.message}`, 'danger');
    }
}

// DELETE - Delete comic page
async function deletePage(id, title) {
    console.log('delete');
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
        return;
    }
    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }
    try {
        const response = await fetch(`/api/comics/${id}`, {
            method: 'DELETE',
            headers: headers
        });

        const result = await response.json();
        console.log(JSON.stringify(result));

        if (response.ok) {
            showMessage(`✅ Comic "${name}" deleted successfully!`, 'success');
            loadPages(); // Refresh the list
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}


//Initialize Page
let editingId = null;
loadPages();