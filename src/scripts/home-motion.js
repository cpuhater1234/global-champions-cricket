
(() => {
  const hero = document.getElementById('homeHero');
  const scene = document.getElementById('foundationScene');
  const ground = scene && scene.querySelector('.foundation-brand-logo');
  if (!hero || !scene || !ground || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!fine.matches) return;
  hero.addEventListener('pointermove', (event) => {
    const r = hero.getBoundingClientRect();
    const x = ((event.clientX - r.left) / r.width - .5) * 2;
    const y = ((event.clientY - r.top) / r.height - .5) * 2;
    ground.style.transform = `translate(${(x * 2.4).toFixed(2)}px, ${(y * 1.8).toFixed(2)}px) scale(1.004)`;
  });
  hero.addEventListener('pointerleave', () => { ground.style.transform = ''; });
})();
