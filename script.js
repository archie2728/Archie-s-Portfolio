
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: .12 });

revealEls.forEach(el => observer.observe(el));

const nav = document.querySelector('.nav nav');

document.querySelector('.menu').addEventListener('click', () => {
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

const grid = document.getElementById('projectGrid');
const lightbox = document.getElementById('lightbox');

/* GALLERY STYLE */
const galleryStyle = document.createElement('style');

galleryStyle.textContent = `
.multi-gallery {
  width: 100%;
  max-height: 75vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 5px;
  scroll-behavior: smooth;
}

.multi-gallery img {
  display: block;
  width: 100%;
  height: auto;
  max-height: none;
  object-fit: contain;
  border-radius: 8px;
}

.multi-gallery::-webkit-scrollbar {
  width: 7px;
}

.multi-gallery::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 10px;
}

#lightbox.gallery-active > img {
  display: none !important;
}

#lightbox.gallery-active .multi-gallery {
  display: flex;
}

#lightbox .multi-gallery {
  display: none;
}
`;

document.head.appendChild(galleryStyle);

/* PROJECT VIEWER */

function bindProject(card) {
  card.addEventListener('click', () => {

    const images = card.dataset.gallery
      ? JSON.parse(card.dataset.gallery)
      : [card.dataset.image];

    const validImages = images.filter(Boolean);

    const img = lightbox.querySelector('img');
    const caption = lightbox.querySelector('.lightbox-caption');

    caption.textContent =
      card.dataset.title + ' — ' + card.dataset.description;

    // Remove old gallery if present
    const oldGallery = lightbox.querySelector('.multi-gallery');
    if (oldGallery) oldGallery.remove();

    if (validImages.length > 1) {

      lightbox.classList.add('gallery-active');

      const gallery = document.createElement('div');
      gallery.className = 'multi-gallery';

      validImages.forEach((url, index) => {
        const galleryImg = document.createElement('img');

        galleryImg.src = url;
        galleryImg.alt =
          `${card.dataset.title} screenshot ${index + 1}`;
        galleryImg.loading = 'lazy';

        gallery.appendChild(galleryImg);
      });

      img.insertAdjacentElement('afterend', gallery);

    } else {

      lightbox.classList.remove('gallery-active');

      img.src = validImages[0] || '';
      img.alt = card.dataset.title;
    }

    lightbox.classList.add('show');
  });
}

/* EXISTING STATIC PROJECTS */

document.querySelectorAll('.project').forEach(bindProject);

/* CLOSE LIGHTBOX */

lightbox.addEventListener('click', e => {
  if (
    e.target === lightbox ||
    e.target.classList.contains('lightbox-close')
  ) {
    lightbox.classList.remove('show');
    lightbox.classList.remove('gallery-active');
  }
});

/* LOAD SUPABASE PROJECTS */

async function loadSupabaseProjects() {

  const cfg = window.SUPABASE_CONFIG || {};

  if (
    !cfg.url ||
    cfg.url.includes('YOUR_') ||
    !cfg.publishableKey ||
    cfg.publishableKey.includes('YOUR_')
  ) return;

  try {

    const response = await fetch(
      `${cfg.url.replace(/\/$/, '')}/rest/v1/projects?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: cfg.publishableKey,
          Authorization: `Bearer ${cfg.publishableKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase request failed (${response.status})`);
    }

    const projects = await response.json();

    projects.forEach(project => {

      const galleryImages = Array.isArray(project.gallery_images)
        ? project.gallery_images.filter(Boolean)
        : [];

      const mainImage =
        project.image_url ||
        galleryImages[0];

      if (!project.title || !mainImage) return;

      const card = document.createElement('article');
      card.className = 'project reveal visible';

      card.dataset.title = project.title;
      card.dataset.description = project.description || '';
      card.dataset.image = mainImage;
      card.dataset.gallery = JSON.stringify(
        galleryImages.length ? galleryImages : [mainImage]
      );

      /* IMAGE */

      const imageWrap = document.createElement('div');
      imageWrap.className = 'project-img';

      const img = document.createElement('img');
      img.src = mainImage;
      img.alt = project.title;
      img.loading = 'lazy';

      const view = document.createElement('span');
      view.className = 'view';
      view.textContent = 'VIEW PROJECT ↗';

      imageWrap.append(img, view);

      /* PROJECT TEXT */

      const textWrap = document.createElement('div');
      textWrap.className = 'project-text';

      const details = document.createElement('div');

      const small = document.createElement('small');
      small.textContent =
        (project.category || 'PROJECT').toUpperCase();

      const heading = document.createElement('h3');
      heading.textContent = project.title;

      details.append(small, heading);

      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '↗';

      const desc = document.createElement('p');
      desc.textContent = project.description || '';

      /* TECHNOLOGIES */

      const chips = document.createElement('div');
      chips.className = 'chips';

      const tech = Array.isArray(project.technologies)
        ? project.technologies
        : typeof project.technologies === 'string'
          ? project.technologies
              .split(',')
              .map(x => x.trim())
              .filter(Boolean)
          : [];

      tech.forEach(t => {
        const chip = document.createElement('span');
        chip.textContent = t;
        chips.appendChild(chip);
      });

      textWrap.append(details, arrow, desc, chips);

      card.append(imageWrap, textWrap);

      grid.appendChild(card);

      bindProject(card);

    });

  } catch (error) {
    console.warn(
      'Could not load portfolio projects from Supabase:',
      error
    );
  }
}

loadSupabaseProjects();
