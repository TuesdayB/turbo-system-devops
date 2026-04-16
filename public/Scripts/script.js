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

    // Show message
    function showMessage(text, type) {
      const messageDiv = document.getElementById('message');
      messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
      setTimeout(() => {
        messageDiv.innerHTML = '';
      }, 3000);
    }

    // Initialize page
    loadDesmosInfo();
    loadQuilts();

    // Set today's date as default
    document.getElementById('date').value = 'February 30, 2026';
    */

function logout() {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('username');

  location.reload();
}

function showMessage(message, type = 'info') {
  const messagesDiv = document.getElementById('message');
  messagesDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
  setTimeout(() => {
    messagesDiv.innerHTML = '';
  }, 5000);
}

//loads nav bar
window.addEventListener('load', () => {
  const token = localStorage.getItem('jwtToken');
  const user = localStorage.getItem('username');

  try {
    const navbarDiv = document.getElementById('Navbar');
    currentPath = window.location.pathname;

    navbarDiv.innerHTML = `
<!-- Nav bar - source code: https://getbootstrap.com/docs/5.3/components/navbar/ --> 
<nav class="navbar navbar-expand-lg bg-blue" data-bs-theme="dark">
  <a class="navbar-brand" href="/">Space Station 76</a>
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      <li class="nav-item">
        <a class="nav-link" id="homeLink" href="/">Home</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" id="comicLink" href="/comic">Comic</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" id="announceLink" href="/announcements">Announcements</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" id="btsLink" href="/behindthescenes">Behind-the-Scenes</a>
      </li>
      <li class="nav-item" id="loginLink">
        <a class="nav-link" href="/login">Log In</a>
      </li>
    </ul>
  </div>
</nav>
`
    homeLink = document.getElementById('homeLink');
    comicLink = document.getElementById('comicLink');
    announceLink = document.getElementById('announceLink');
    btsLink = document.getElementById('btsLink');
    loginLink = document.getElementById('loginLink');

    if (token) {
      loginLink.innerHTML = '<a class="nav-link" onclick="logout()" href="javascript:void(0);">' + user + ' - Log Out</a>';
    }

    //Highlights the nav link if user is currently on its corresponding page
    switch (currentPath) {
      case "/":
        homeLink.classList.add('active');
        break;
      case "/comic":
        comicLink.classList.add('active');
        break;
      case "/announcements":
        announceLink.classList.add('active');
        break;
      case "/behindthescenes":
        btsLink.classList.add('active');
        break;
      case "/login":
        loginLink.innerHTML = '<a class="nav-link active" href="/login">Log In</a>';
        break;
      default:
        break;
    }
  } catch (error) {
    document.getElementById('Navbar').innerHTML = 'Error loading nav bar';
  }
});