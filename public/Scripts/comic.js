hasAdmin = false;
username = null;

let currPageIndex = 1;
let totalPages = 1;
let pageId = null;
let commentId = null;

window.addEventListener('load', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('jwtToken');

    if (!token) {
        console.log('loaded guest');
    } else {

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
                username = result.user.username;
                console.log('loaded user');
            } else {
                showMessage(`❌ Failed: ${result.error}`, 'danger');
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }
    }
    loadPage();
});

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
    // const username = localStorage.getItem('username');

    if (!token) {
        return false;
    } else {
        return true;
    }
}

// Source - https://stackoverflow.com/a/2880929
// Posted by Andy E, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-18, License - CC BY-SA 4.0

let urlParams = {};
(window.onpopstate = function () {
    let match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, " "));
        },
        query = window.location.search.substring(1);

    while (match = search.exec(query)) {
        if (decode(match[1]) in urlParams) {
            if (!Array.isArray(urlParams[decode(match[1])])) {
                urlParams[decode(match[1])] = [urlParams[decode(match[1])]];
            }
            urlParams[decode(match[1])].push(decode(match[2]));
        } else {
            urlParams[decode(match[1])] = decode(match[2]);
        }
    }
})();

function resetForm(formID) {
    commentId = null;
    document.getElementById(formID).reset();
}

function fillCommentUpdateForm(id, commentBody) {
    commentId = id;
    document.getElementById('commentBody').value = commentBody;
    showMessage('📝 Comment data loaded', 'info');
}

async function loadPage() {
    try {
        const response = await fetch(`/api/comics/1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const info = await response.json();
        totalPages = info.totalPages;

        if (urlParams.page && urlParams.page >= 1 && urlParams.page <= totalPages) {
            currPageIndex = urlParams.page;
            try {
                const response = await fetch(`/api/comics/${currPageIndex}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const comic = await response.json();
                pageId = comic._id;
                document.getElementById('comicViewer').innerHTML = `
                <h1>${comic.title}</h1><br>
                <img src='${comic.pageLink}' class='comicPageDisplay'><br>
                <small>Posted by ${comic.postedBy} on ${comic.readableDate}</small>`;

                if (!comic) {
                    comicPageList.innerHTML = '<p class="text-muted">No comics found.</p>';
                    return;
                }
            } catch (error) {
                showMessage(`❌ Error loading comics: ${error.message}`, 'danger');
            }

        } else {
            pageId = info._id;
            document.getElementById('comicViewer').innerHTML = `
                <h1>${info.title}</h1><br>
                <img src='${info.pageLink}' class='comicPageDisplay'><br>
                <small>Posted by ${info.postedBy} on ${info.postedAt}</small>`;

            if (!info) {
                comicPageList.innerHTML = '<p class="text-muted">No comics found.</p>';
                return;
            }
        }

        await loadComments(pageId);
    } catch (error) {
        showMessage(`❌ Error loading comics: ${error.message}`, 'danger');
    }
}

async function loadComments(pageId) {
    try {
        const response = await fetch(`/api/comments/${pageId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const comments = await response.json();

        const commentViewer = document.getElementById('commentViewer');

        if (comments.length === 0) {
            commentViewer.innerHTML = '<p class="text-muted">No comments found.</p>';
            return;
        }
        commentViewer.innerHTML = comments.map(comment => `
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        ${comment.postedBy ? `<small class="text-muted">${comment.postedBy}` : ''} - ${new Date(comment.postedAt).toLocaleString()}</small>
                        <p>${comment.commentBody}</p>
                    </div>
                    <div>
                        <button id="editComment" class="edit-btn btn-sm"
                        data-comment-id=${comment._id}
                        data-comment-body='${comment.commentBody}'
                        data-comment-user='${comment.postedBy}'
                        ${(username === comment.postedBy) ? '' : 'hidden'}>Edit</button>

                        <button id="deleteComment" class="delete-btn btn-sm"
                        data-id=${comment._id}
                        data-body='${comment.commentBody}' 
                        data-user='${comment.postedBy}'
                        ${(hasAdmin || (username === comment.postedBy)) ? '' : 'hidden'}>Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.edit-btn').forEach(span => {
            span.addEventListener('click', function () {
                const commenterUsername = this.getAttribute('data-comment-user');
                if (commenterUsername === username || hasAdmin) {
                    const id = this.getAttribute('data-comment-id');
                    const commentBody = this.getAttribute('data-comment-body');
                    document.getElementById('commentSubmit').innerHTML = "Edit Comment";
                    fillCommentUpdateForm(id, commentBody);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {

                const commenterUsername = this.getAttribute('data-user');
                if (commenterUsername === username || hasAdmin) {
                    const id = this.getAttribute('data-id');
                    const commentBody = this.getAttribute('data-body');
                    deleteComment(id, commentBody);
                }
            });
        });
    } catch (error) {
        showMessage(`❌ Error loading comments: ${error.message}`, 'danger');
    }
}

//CREATE/UPDATE - New comment or Edit existing comment
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }

    const comment = {
        pageId: pageId,
        commentBody: document.getElementById('commentBody').value,
    };
    if (commentId) {
        const id = commentId;
        try {
            const response = await fetch(`/api/comments/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(comment)
            });
            
            const result = await response.json();
            console.log(JSON.stringify(result));
            if (response.ok) {
                showMessage(`✅ Comment updated successfully!`, 'success');
                resetForm('commentForm');
                loadComments(pageId);
                document.getElementById('commentSubmit').innerHTML = "Submit";
            } else {
                showMessage(`❌ Error: ${result.error}`, 'danger');
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }
    } else {
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(comment)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(`✅ Comment added successfully!`, 'success');
                resetForm('commentForm');
                loadComments(pageId);
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

//DELETE - Delete comment
async function deleteComment(id, commentBody) {
    if (!confirm(`Are you sure you want to delete comment "${commentBody}"?`)) {
        return;
    }
    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }
    try {
        const response = await fetch(`/api/comments/${id}`, {
            method: 'DELETE',
            headers: headers
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Comment "${commentBody}" deleted successfully!`, 'success');
            loadComments(pageId); // Refresh the list
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}

document.getElementById('first').addEventListener('click', (e) => {
    window.location.href = '?page=1';
});

document.getElementById('prev').addEventListener('click', (e) => {
    if (currPageIndex >= 2) {
        window.location.href = `?page=${currPageIndex - 1}`;
    }
});

document.getElementById('next').addEventListener('click', (e) => {
    if (currPageIndex <= totalPages - 1) {
        window.location.href = `?page=${parseInt(currPageIndex) + 1}`;
    }
});

document.getElementById('last').addEventListener('click', (e) => {
    window.location.href = `?page=${totalPages}`;
});

