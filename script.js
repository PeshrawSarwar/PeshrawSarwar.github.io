const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open', open); });
navigation.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', (event) => { if (!event.target.closest('.site-header')) closeMenu(); });
window.matchMedia('(min-width: 641px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('.copy-email').addEventListener('click', async () => { const status = document.querySelector('#copy-status'); try { await navigator.clipboard.writeText('peshrawsarwar@gmail.com'); status.textContent = 'Email address copied.'; } catch { status.textContent = 'Select and copy: peshrawsarwar@gmail.com'; } });
if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { entries.forEach(entry => { const link = navigation.querySelector(`a[href="#${entry.target.id}"]`); if (link) { if (entry.isIntersecting) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); } }); }, { rootMargin: '-15% 0px -55% 0px' }); document.querySelectorAll('main section[id]').forEach(section => observer.observe(section)); }

// Progressive motion: content stays visible if animation is unavailable.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionTargets = document.querySelectorAll('.section-label, .about-grid > *, .section-heading, .career, .expertise > h2, .expertise-grid > article, .learning-grid > *, .contact-heading, .contact-grid');
const runningMotion = new Set();
function animateElement(element, frames, options) {
  if (motionPreference.matches || !element.animate) return;
  const animation = element.animate(frames, options);
  runningMotion.add(animation);
  const cleanup = () => runningMotion.delete(animation);
  animation.addEventListener('finish', cleanup, { once: true });
  animation.addEventListener('cancel', cleanup, { once: true });
  return animation;
}
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      // Do not animate focused content or replay items restored above the viewport.
      if (entry.boundingClientRect.top < 0 || entry.target.contains(document.activeElement)) return;
      animateElement(entry.target,
        [{ opacity: 0.25, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  motionTargets.forEach(target => revealObserver.observe(target));
}
// Mouse, touch, and keyboard activation receive the same short feedback.
document.addEventListener('click', event => {
  const control = event.target.closest('.button, .nav-contact, .menu-toggle, .copy-email, .contact-grid a');
  if (!control) return;
  animateElement(control,
    [{ scale: '1' }, { scale: '.97', offset: .35 }, { scale: '1' }],
    { duration: 260, easing: 'ease-out' });
});
motionPreference.addEventListener('change', event => {
  if (event.matches) [...runningMotion].forEach(animation => animation.cancel());
});
// Keyboard focus must never wait for a section's entrance animation.
document.addEventListener('focusin', event => {
  [...runningMotion].forEach(animation => {
    const target = animation.effect?.target;
    if (target?.contains(event.target)) animation.cancel();
  });
});
