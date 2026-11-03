(() => {
  'use strict';
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.remove('no-js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = $('.hdr'), nav = $('#nav'), burger = $('.burger');
  const updateHeader = () => header?.classList.toggle('solid', window.scrollY > 40);
  const closeNav = () => { nav?.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false'); };
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#nav a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  if ('IntersectionObserver' in window) {
    const links = new Map($$('#nav a[href^="#"]').map(a => [a.hash.slice(1), a]));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting || !links.has(entry.target.id)) return;
      links.forEach(a => a.classList.remove('on'));
      links.get(entry.target.id).classList.add('on');
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
  }
  const parallax = $$('[data-parallax]');
  let ticking = false;
  function renderScroll() {
    ticking = false; updateHeader();
    if (reduce) return;
    const vh = window.innerHeight;
    parallax.forEach(el => {
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      el.style.transform = `translate3d(0,${((box.top + box.height / 2 - vh / 2) * -speed).toFixed(1)}px,0)`;
    });
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(renderScroll); } }, {passive:true});
  window.addEventListener('resize', renderScroll); renderScroll();
  $$('.fade').forEach(img => {
    if (img.complete) img.classList.add('ld');
    else { img.addEventListener('load', () => img.classList.add('ld'), {once:true}); img.addEventListener('error', () => img.classList.add('ld'), {once:true}); }
  });
  const config = window.SITE_CONFIG || {};
  const address = typeof config.contractAddress === 'string' ? config.contractAddress.trim() : '';
  const validAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
  $$('[data-config="contract"]').forEach(el => el.textContent = validAddress ? address : 'Coming soon');
  if (validAddress) {
    $$('[data-swap-link]').forEach(el => el.href = 'https://app.uniswap.org/swap?chain=mainnet&outputCurrency=' + encodeURIComponent(address));
    $$('[data-explorer-link]').forEach(el => { el.href = 'https://etherscan.io/token/' + encodeURIComponent(address); el.hidden = false; });
    $$('[data-contract-note]').forEach(el => el.textContent = 'Verify the address and token before swapping.');
  }
  ['supply','liquidity'].forEach(key => {
    const value = key === 'supply' ? config.totalSupply : config.liquidity;
    if (typeof value === 'string' && value.trim()) {
      $$(`[data-config="${key}"]`).forEach(el => el.textContent = value.trim());
      $$(`[data-config-description="${key}"]`).forEach(el => el.textContent = "Details provided by the project.");
    }
  });
  $$('[data-copy-contract]').forEach(button => {
    button.disabled = !validAddress;
    if (!validAddress) return;
    button.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(address);
        else {
          const field = document.createElement('textarea');
          field.value = address; field.style.cssText = 'position:fixed;opacity:0'; document.body.append(field); field.select();
          const copied = document.execCommand('copy'); field.remove(); if (!copied) throw new Error('Copy failed');
        }
        button.textContent = 'Copied';
      } catch (_) { button.textContent = 'Copy failed'; }
      setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    });
  });
})();
