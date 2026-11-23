// Each essay can have its own illustration and story, while the article stays static.
(() => {
  const journey = document.querySelector('.journey');
  if (!journey) return;
  const stages = [
    ['01 · KNOWLEDGE IS THE FOUNDATION', 'University builds knowledge. Connecting that foundation to real challenges is the next step toward career readiness.'],
    ['02 · REAL PROJECTS, MEASURABLE OUTCOMES', 'Working on real business challenges lets students apply classroom learning, make decisions, and see the impact of their work.'],
    ['03 · LEARNING ALONGSIDE PROFESSIONALS', 'Ongoing mentorship connects students with industry experience, practical guidance, and perspectives beyond the classroom.'],
    ['04 · PRACTICE THROUGHOUT THE DEGREE', 'Industry-focused training builds technical skills alongside communication, teamwork, and problem-solving—not just during a short summer internship.'],
    ['05 · A SHARED INVESTMENT IN THE FUTURE', 'Long-term university–business partnerships can help graduates enter the workforce with relevant skills and meaningful experience.']
  ];
  const buttons = [...journey.querySelectorAll('[data-stage]')];
  const symbols = [...journey.querySelectorAll('[data-symbol]')];
  const motion = journey.querySelector('.journey-motion');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  let transition;
  function updateMotion() {
    journey.classList.toggle('is-paused', paused || preference.matches);
    motion.textContent = preference.matches ? 'Reduced motion' : paused ? 'Play motion' : 'Pause motion';
    motion.setAttribute('aria-pressed', String(paused || preference.matches));
    motion.disabled = preference.matches;
  }
  function selectStage(index) {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    symbols.forEach((symbol, i) => symbol.classList.toggle('is-selected', i === index));
    journey.querySelector('#journey-era').textContent = stages[index][0];
    journey.querySelector('#journey-copy').textContent = stages[index][1];
    transition?.cancel();
    if (!preference.matches && !paused) {
      transition = journey.querySelector('.journey-detail').animate(
        [{ opacity: .4, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 300, easing: 'ease-out' }
      );
    }
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectStage(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      selectStage(next);
    });
  });
  symbols.forEach((symbol, index) => symbol.addEventListener('click', () => selectStage(index)));
  motion.addEventListener('click', () => { paused = !paused; transition?.cancel(); updateMotion(); });
  preference.addEventListener('change', () => { paused = preference.matches; transition?.cancel(); updateMotion(); });
  let visible = true;
  const updateVisibility = () => journey.classList.toggle('is-offscreen', !visible || document.hidden);
  document.addEventListener('visibilitychange', updateVisibility);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateVisibility(); }).observe(journey);
  }
  updateMotion();
})();
