// Toggle Navigation Menu
function toggleNav() {
  const links = document.getElementById('navLinks');
  const toggle = document.getElementById('navToggle');
  links.classList.toggle('open');
  toggle.classList.toggle('active');
}

// Close nav on link click
document.querySelectorAll('#navLinks a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('navToggle').classList.remove('active');
  });
});

// ---- Projects (render from JSON) ----
async function loadProjectsIntoGrid(gridSelector, options = {}) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  // Keep header + just replace cards.
  const existingCards = Array.from(grid.querySelectorAll('.project-card'));
  existingCards.forEach(c => c.remove());

  const { filterIds = null } = options;

  try {
    const res = await fetch('./data/projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const projects = await res.json();
    const list = filterIds ? projects.filter(p => filterIds.includes(p.id)) : projects;

    const frag = document.createDocumentFragment();
    list.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'project-card reveal';

      const techTags = (p.tech || []).map(t => {
        const safe = String(t);
        return `<span class="tech-tag">${safe}</span>`;
      }).join('');

      const placeholder = p.image?.placeholder ?? '✨';
      const live = p.links?.live ?? '#';
      const github = p.links?.github ?? '#';

      // For future portfolio card: hide Live Demo if value is '#'
      const showLive = !(p.links?.hideLive === true || live === '#');

      const overlayLinks = [
        showLive ? `<a href="${live}" class="project-link-btn">Live Demo</a>` : '',
        `<a href="${github}" class="project-link-btn">GitHub</a>`
      ].filter(Boolean).join('');

      const featuresHtml = Array.isArray(p.features) && p.features.length
        ? `<ul class="project-features">${p.features.map(f => `<li>${String(f)}</li>`).join('')}</ul>`
        : '';

      card.innerHTML = `
        <div class="project-img">
          <div class="project-img-placeholder">${placeholder}</div>
          <div class="project-overlay">
            ${overlayLinks}
          </div>
        </div>
        <div class="project-body">
          <div class="project-num">${p.projectNum ?? `Project ${String(idx + 1).padStart(2, '0')}`}</div>
          <h3>${p.title ?? ''}</h3>
          <p>${(p.description ?? '').replace(/\n/g, '<br>')}</p>
          ${featuresHtml}
          <div class="project-tech">${techTags}</div>
        </div>
      `;

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  } catch (err) {
    console.error('Failed to load projects.json:', err);
    const fallback = document.createElement('div');
    fallback.className = 'project-card reveal';
    fallback.innerHTML = `<div class="project-body"><div class="project-num">Projects</div><h3>Unable to load</h3><p>Please ensure a local server is running (JSON fetch from file:// may be blocked).</p></div>`;
    grid.appendChild(fallback);
  }
}

// Scroll reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Render both sections (same design)
Promise.all([
  loadProjectsIntoGrid('#featuredProjectsGrid'),
  loadProjectsIntoGrid('#futureProjectsGrid', { filterIds: ['smart-quiz', 'e-learning', 'protfolio'] })
]).then(() => {
  document.querySelectorAll('#featuredProjectsGrid .reveal, #futureProjectsGrid .reveal')
    .forEach(el => observer.observe(el));
});

