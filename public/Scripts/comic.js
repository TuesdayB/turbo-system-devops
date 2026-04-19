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

currPageIndex = 1;
totalPages = 1;
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
                document.getElementById('comicViewer').innerHTML = `<img src='${comic.pageLink}' class='comicPageDisplay'>`

                if (!comic) {
                    comicPageList.innerHTML = '<p class="text-muted">No comics found.</p>';
                    return;
                }
            } catch (error) {
                showMessage(`❌ Error loading comics: ${error.message}`, 'danger');
            }

        } else{
                document.getElementById('comicViewer').innerHTML = `
                <h1>${info.title}</h1><br>
                <img src='${info.pageLink}' class='comicPageDisplay'><br>
                <p>Posted by ${info.postedBy} on ${info.postedAt}</p>`;

                if (!info) {
                    comicPageList.innerHTML = '<p class="text-muted">No comics found.</p>';
                    return;
                }
        }


    } catch (error) {
        showMessage(`❌ Error loading comics: ${error.message}`, 'danger');
    }
}

document.getElementById('first').addEventListener('click', (e) => {
    window.location.href='?page=1';
});

document.getElementById('prev').addEventListener('click', (e) => {
    if(currPageIndex >= 2){
        window.location.href=`?page=${currPageIndex-1}`;
    }
});

document.getElementById('next').addEventListener('click', (e) => {
    if(currPageIndex <= totalPages - 1){
        window.location.href=`?page=${parseInt(currPageIndex) + 1}`;
    }
});

document.getElementById('last').addEventListener('click', (e) => {
window.location.href=`?page=${totalPages}`;
});

loadPage();