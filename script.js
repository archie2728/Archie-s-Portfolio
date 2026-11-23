// Lightweight portfolio interactions: mobile nav scroll behavior and image focus.
document.querySelectorAll('.gallery img').forEach(img => {
  img.addEventListener('click', () => img.classList.toggle('focused'));
});
