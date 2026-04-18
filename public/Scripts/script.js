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

async function checkAdminStatus() {
  const token = localStorage.getItem('jwtToken');
  adminLink = document.getElementById('adminPanel');
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
      console.log(hasAdmin);
      if(hasAdmin){
        adminLink.removeAttribute("hidden");
      }

    } else {
      showMessage(`❌ Failed: ${result.error}`, 'danger');
    }
  } catch (error) {
    showMessage(`❌ Network error: ${error.message}`, 'danger');
  }
}

//loads nav bar
function loadNavBar() {
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
        <a class="nav-link" id="adminPanel" href="/admin" hidden>Admin Panel</a>
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
    loginLink = document.getElementById('loginLink');
    adminLink = document.getElementById('adminPanel');

    if (token) {
      loginLink.innerHTML = '<a class="nav-link" onclick="logout()" href="javascript:void(0);">' + user + ' - Log Out</a>';
      checkAdminStatus();
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
      case "/login":
        loginLink.innerHTML = '<a class="nav-link active" href="/login">Log In</a>';
        break;
      case "/admin":
        adminLink.classList.add('active');
        break;
      default:
        break;
    }
  } catch (error) {
    document.getElementById('Navbar').innerHTML = 'Error loading nav bar';
  }
};

loadNavBar();