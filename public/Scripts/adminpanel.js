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


//CREATE - New comic
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

    try {
        const response = await fetch('/api/comics', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(comic)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Student "${comic.title}" added successfully!`, 'success');
            document.getElementById('comicPageEditor').reset();
            // loadStudents(); // Refresh the list
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
                        <small class="text-muted">ID: <span class="comic-id" 
                            data-id="${comic._id}" 
                            data-title="${comic.title}" 
                            data-index="${comic.index}" 
                            data-link="${comic.pageLink}">${comic._id}</span></small>
                        <br><small class="text-muted">Link: <a href='${comic.pageLink}' target='_blank'>${comic.pageLink}</a></small>
                        ${comic.postedBy ? `<br><small class="text-muted">Created by: ${comic.postedBy}</small>` : ''}
                    </div>
                    <button class="btn btn-outline-danger btn-sm" 
                        data-comic-id="${comic._id}" 
                        data-comic-title="${comic.title}"
                        class="delete-btn">
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
                fillComicUpdateForm(id, title, index, pageLink);
            });
        });

        //         // Add click event listeners for delete buttons
        //         document.querySelectorAll('.delete-btn').forEach(button => {
        //             button.addEventListener('click', function() {
        //                 const id = this.getAttribute('data-student-id');
        //                 const name = this.getAttribute('data-student-name');
        //                 deleteStudent(id, name);
        //             });
        //         });

        showMessage(`📋 Loaded ${comics.length} comics`, 'info');
    } catch (error) {
        showMessage(`❌ Error loading comics: ${error.message}`, 'danger');
    }
}

// Fill update form when clicking on student ID
function fillComicUpdateForm(id, title, index, pageLink) {
    editingId = id;
    document.getElementById('pageTitle').value = title;
    document.getElementById('pageIndex').value = index;
    document.getElementById('pageLink').value = pageLink;
    showMessage('📝 Comic data loaded in update form', 'info');
}

let editingId = null;
loadPages();




/*
    let editingId = null;

    // Handle form submission
    document.getElementById('quiltForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const quiltName = document.getElementById('quiltName').value;
      const quiltWidth = document.getElementById('quiltWidth').value;
      const quiltHeight = document.getElementById('quiltHeight').value;
      const squareSize = document.getElementById('squareSize').value;

      try {
        const url = editingId ? `/api/quilts/${editingId}` : '/api/quilts';
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quiltName,
            quiltWidth,
            quiltHeight,
            squareSize
          })
        });

        const result = await response.json();

        if (response.ok) {
          showMessage(result.message, 'success');
          document.getElementById('quiltForm').reset();
          if (editingId) {
            editingId = null;
            document.querySelector('button[type="submit"]').textContent = 'Save Quilt';
          }
          loadQuilts();
        } else {
          showMessage(result.error, 'error');
        }
      } catch (error) {
        showMessage('Error submitting form', 'error');
      }
    });

    // Load quilt records
    async function loadQuilts() {
      try {
        const response = await fetch('/api/quilts');
        const records = await response.json();

        const listDiv = document.getElementById('quiltList');

        if (records.length === 0) {
          listDiv.innerHTML = '<p>No quilt records yet.</p>';
          return;
        }

        listDiv.innerHTML = records.map(record => `
          <div class="record">
            <strong>${record.quiltName}</strong><br>
            <small>Dimensions: ${record.quiltWidth} x ${record.quiltHeight} | Recorded: ${new Date(record.timestamp).toLocaleString()}</small><br>
            <button class="edit-btn" onclick="editRecord('${record._id}', '${record.quiltName}', '${record.quiltWidth}', '${record.quiltHeight}','${record.squareSize}')">Edit</button>
            <button class="delete-btn" onclick="deleteRecord('${record._id}')">Delete</button>
          </div>
        `).join('');
      } catch (error) {
        document.getElementById('quiltList').innerHTML = 'Error loading quilt records';
      }
    }

    // Edit record
    function editRecord(id, quiltName, quiltWidth, quiltHeight, squareSize) {
      editingId = id;
      document.getElementById('quiltName').value = quiltName;
      document.getElementById('quiltWidth').value = quiltWidth;
      document.getElementById('quiltHeight').value = quiltHeight;
      document.getElementById('squareSize').value = squareSize;
      document.querySelector('button[type="submit"]').textContent = 'Update Quilt';
      showMessage('Editing record - click Update to save changes', 'success');
    }

    // Delete record
    async function deleteRecord(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;

      try {
        const response = await fetch(`/api/quilts/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
          showMessage(result.message, 'success');
          loadQuilts();
        } else {
          showMessage(result.error, 'error');
        }
      } catch (error) {
        showMessage('Error deleting record', 'error');
      }
    }

    // Initialize page
    loadDesmosInfo();
    loadQuilts();

    // Set today's date as default
    document.getElementById('date').value = 'February 30, 2026';
    */