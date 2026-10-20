(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- THEME (saved in localStorage) ---------- */
  var tBtn = $('#theme'), meta = $('meta[name=theme-color]');
  function setTheme(t, save) {
    root.dataset.theme = t;
    tBtn.setAttribute('aria-pressed', t === 'light');
    meta.content = t === 'light' ? '#f5f7fb' : '#070b16';
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
  }
  setTheme(root.dataset.theme || 'dark', false);
  tBtn.addEventListener('click', function () {
    root.classList.add('theming');
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    setTimeout(function () { root.classList.remove('theming'); }, 500);
  });

  /* ---------- MOBILE MENU ---------- */
  var links = $('#links'), burger = $('#burger');
  function menu(open) {
    links.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  }
  burger.addEventListener('click', function (e) { e.stopPropagation(); menu(!links.classList.contains('open')); });
  $$('a', links).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  d.addEventListener('click', function (e) { if (!links.contains(e.target)) menu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });
  matchMedia('(min-width:861px)').addEventListener('change', function () { menu(false); });

  /* ---------- SCROLL REVEAL + SKILL COUNT-UP ---------- */
  function count(el) {
    var end = +el.dataset.n, t0 = null;
    if (reduce) return;
    (function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + '%';
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
        var n = $('[data-n]', e.target);
        if (n) count(n);
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- ACTIVE SECTION (nav + status bar) ---------- */
  var sbSec = $('#sbSec');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        $$('a', links).forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
        sbSec.textContent = e.target.dataset.name;
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- SCROLL PROGRESS (status bar + navbar border) ---------- */
  var nav = $('#nav'), sbar = $('#sbar'), sbPct = $('#sbPct'), ticking = false;
  function onScroll() {
    var max = root.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(100, Math.round(scrollY / max * 100)) : 0;
    sbPct.textContent = p;
    sbar.style.setProperty('--sp', p + '%');
    nav.classList.toggle('scrolled', scrollY > 10);
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- CARD SPOTLIGHT + CURSOR GLOW ---------- */
  d.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.spot');
    if (c) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }
  }, { passive: true });
  var glow = $('#glow');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    d.addEventListener('pointermove', function (e) {
      glow.classList.add('on');
      glow.style.transform = 'translate(' + (e.clientX - 200) + 'px,' + (e.clientY - 200) + 'px)';
    }, { passive: true });
  }

  /* ---------- TERMINAL TYPING ---------- */
  $$('.tl').forEach(function (l, i) {
    if (reduce) l.classList.add('show');
    else setTimeout(function () { l.classList.add('show'); }, 800 + i * 600);
  });

  /* ---------- PLACEHOLDER PROJECT LINK ---------- */
  var pl = $('#projLink');
  if (pl && pl.getAttribute('href') === '#') {
    pl.addEventListener('click', function (e) { e.preventDefault(); });
  }

  /* ---------- FOOTER YEAR ---------- */
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
