// Redirect visiting root
if (window.location.pathname === "/" ) {
  window.location.href = "/index.html";
}

// Theme toggle (Bootstrap 5.3 uses data-bs-theme)
(function themeInit() {
  const pref = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-bs-theme', pref);

  const mainNav = document.getElementById('mainNav');
  const btn = document.getElementById('themeToggle');

  // Function to apply navbar styles based on theme
  function updateNavbarTheme(theme) {
    if (theme === 'light') {
      mainNav.classList.remove('navbar-dark', 'bg-body');
      mainNav.classList.add('navbar-light', 'bg-light');
      btn.classList.remove('btn-outline-light');
      btn.classList.add('btn-outline-dark');
    } else {
      mainNav.classList.remove('navbar-light', 'bg-light');
      mainNav.classList.add('navbar-dark', 'bg-body');
      btn.classList.remove('btn-outline-dark');
      btn.classList.add('btn-outline-light');
    }
  }

  // Apply theme on page load
  updateNavbarTheme(pref);

  // Theme toggle event
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-bs-theme');
      const next = current === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-bs-theme', next);
      localStorage.setItem('theme', next);

      updateNavbarTheme(next);
    });
  }
})();


// Smooth anchor scrolling for "Join Us" CTA
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// Certification verification logic
async function verifyCertificate() {
  const input = document.getElementById('certId');
  const result = document.getElementById('verifyResult');
  const id = (input.value || '').trim();
  if (!id) { result.innerHTML = '<div class="alert alert-warning">Please enter a Certificate ID.</div>'; return; }
  try {
    const res = await fetch('certificates.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load certificates.json');
    const data = await res.json();
    const item = data.find(x => (x.id || '').toLowerCase() === id.toLowerCase());
    if (item) {
      result.innerHTML = `
        <div class="card card-glow">
          <div class="card-body">
            <h5 class="card-title mb-2">Certificate Verified ✅</h5>
            <div><strong>Holder:</strong> ${item.name}</div>
            <div><strong>Title:</strong> ${item.title}</div>
            <div><strong>Event Name:</strong> ${item.eventname}</div>
            <div><strong>Issued:</strong> ${item.issued}</div>
            <div><strong>ID:</strong> ${item.id}</div>
            <div><strong>Authorised By:</strong> ${item.issuedby}</div>
          </div>
        </div>`;
    } else {
      result.innerHTML = '<div class="alert alert-danger">Certificate not found or invalid.</div>';
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = '<div class="alert alert-danger">Could not verify right now. Please try again later.</div>';
  }
}
window.verifyCertificate = verifyCertificate;

// GitHub Repositories loader
async function loadRepos() {
  const user = document.getElementById('ghUser').value.trim();
  const grid = document.getElementById('repoGrid');
  if (!user) return;
  grid.innerHTML = '<div class="text-secondary">Loading...</div>';
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      grid.innerHTML = '<div class="text-secondary">No public repositories found.</div>';
      return;
    }
    const cards = repos.map(r => {
      const desc = r.description ? r.description : 'No description';
      return `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 card-glow">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${r.name}</h5>
            <p class="card-text flex-grow-1">${desc}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge text-bg-dark">★ ${r.stargazers_count}</span>
              <a class="btn btn-outline-neon btn-sm" target="_blank" rel="noopener" href="${r.html_url}">View on GitHub</a>
            </div>
          </div>
        </div>
      </div>`;
    }).join('');
    grid.innerHTML = cards;
  } catch (e) {
    console.error(e);
    grid.innerHTML = '<div class="alert alert-danger">Failed to load repositories. You may be rate-limited by GitHub.</div>';
  }
}
window.loadRepos = loadRepos;

// BLOG loader
(function blogInit() {
  const params = new URLSearchParams(location.search);
  const file = params.get('post');
  if (file) {
    // Render a single post
    document.getElementById('blogList').classList.add('d-none');
    document.getElementById('blogPost').classList.remove('d-none');
    fetch('posts/posts.json')
      .then(r => r.json())
      .then(list => {
        const meta = list.find(p => p.file === file);
        if (meta) {
          document.getElementById('postTitle').textContent = meta.title;
          document.getElementById('postMeta').textContent = `${meta.date}`;
        }
      }).catch(()=>{});
    fetch(`posts/${file}`)
      .then(r => r.text())
      .then(md => {
        document.getElementById('postContent').innerHTML = marked.parse(md);
      })
      .catch(() => {
        document.getElementById('postContent').innerHTML = '<div class="alert alert-danger">Failed to load the post.</div>';
      });
  } else {
    // List posts
    fetch('posts/posts.json')
      .then(r => r.json())
      .then(list => {
        const container = document.getElementById('postsContainer');
        const items = list.map(p => `
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 card-glow">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${p.title}</h5>
                <div class="small text-secondary mb-2">${p.date}</div>
                <p class="card-text flex-grow-1">${p.excerpt}</p>
                <a class="btn btn-outline-neon btn-sm mt-2" href="blog.html?post=${encodeURIComponent(p.file)}">Read More</a>
              </div>
            </div>
          </div>`).join('');
        container.innerHTML = items;
      })
      .catch(() => {
        document.getElementById('postsContainer').innerHTML = '<div class="alert alert-danger">Failed to load posts.</div>';
      });
  }
})();

// ===============================
// Hall of Fame Loader
// ===============================
async function loadHallOfFame() {
  const ctfContainer = document.getElementById('ctfWinners');
  const achieversContainer = document.getElementById('achievers');

  try {
    const response = await fetch('halloffame.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load halloffame.json');

    const data = await response.json();

    // --------- CTF Winners ---------
    if (Array.isArray(data.ctf_winners) && data.ctf_winners.length > 0) {
      ctfContainer.innerHTML = data.ctf_winners.map(winner => `
        <div class="col-md-6 col-lg-4">
          <div class="card card-glow h-100">
            <div class="card-body">
              <h5 class="card-title">${winner.name}</h5>
              <p class="card-text mb-1"><strong>Event:</strong> ${winner.event}</p>
              <p class="card-text mb-1"><strong>Title:</strong> ${winner.title}</p>
              <p class="card-text mb-1"><strong>Score:</strong> ${winner.score}</p>
              <p class="card-text"><strong>Year:</strong> ${winner.year}</p>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      ctfContainer.innerHTML = `<div class="text-secondary">No CTF winners found.</div>`;
    }

    // --------- Achievement Winners ---------
    if (Array.isArray(data.achievers) && data.achievers.length > 0) {
      achieversContainer.innerHTML = data.achievers.map(achiever => `
        <div class="col-md-6 col-lg-4">
          <div class="card card-glow h-100 text-center">
            <img src="${achiever.photo}" alt="${achiever.name}" class="card-img-top p-3 rounded-circle" style="width:150px; height:150px; object-fit:cover; margin:auto;">
            <div class="card-body">
              <h5 class="card-title">${achiever.name}</h5>
              <p class="card-text">${achiever.description}</p>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      achieversContainer.innerHTML = `<div class="text-secondary">No achievement winners found.</div>`;
    }

  } catch (error) {
    console.error(error);
    ctfContainer.innerHTML = `<div class="alert alert-danger">Failed to load Hall of Fame data.</div>`;
    achieversContainer.innerHTML = `<div class="alert alert-danger">Failed to load Hall of Fame data.</div>`;
  }
}

// Load Hall of Fame data when the page loads
document.addEventListener('DOMContentLoaded', loadHallOfFame);

