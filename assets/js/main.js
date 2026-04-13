document.addEventListener('DOMContentLoaded', function () {

  /* ── Theme Toggle Button ─────────────────────────────────── */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ── Scroll Reveal ───────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback for older browsers
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Mobile Menu ─────────────────────────────────────────── */
  var hamburger = document.getElementById('navHamburger');
  var overlay   = document.getElementById('navOverlay');
  var closeBtn  = document.getElementById('navOverlayClose');

  function openMenu() {
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMenu() {
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (closeBtn)  closeBtn.addEventListener('click', closeMenu);

  // Close on overlay link click
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Use Case Dual Filter ────────────────────────────────── */
  var activeBiz  = 'all';
  var activeProc = 'all';

  var bizPills  = document.querySelectorAll('[data-filter-biz]');
  var procPills = document.querySelectorAll('[data-filter-proc]');
  var ucCards   = document.querySelectorAll('[data-biz]');
  var ucCount   = document.getElementById('ucCount');
  var ucNoRes   = document.getElementById('ucNoResults');

  function runFilter() {
    var visible = 0;
    ucCards.forEach(function (card) {
      var biz  = card.getAttribute('data-biz');
      var proc = card.getAttribute('data-proc');
      var show = (activeBiz === 'all' || biz === activeBiz) &&
                 (activeProc === 'all' || proc === activeProc);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (ucCount) ucCount.textContent = visible + ' use case' + (visible !== 1 ? 's' : '') + ' shown';
    if (ucNoRes) ucNoRes.style.display = visible === 0 ? 'block' : 'none';
  }

  bizPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      bizPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      activeBiz = pill.getAttribute('data-filter-biz');
      runFilter();
    });
  });

  procPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      procPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      activeProc = pill.getAttribute('data-filter-proc');
      runFilter();
    });
  });

  // Writing archive category filter
  var catPills  = document.querySelectorAll('[data-filter-cat]');
  var postCards = document.querySelectorAll('[data-category]');

  catPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      catPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var cat = pill.getAttribute('data-filter-cat');
      postCards.forEach(function (card) {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ── Nav Anchor Fade Pulse ───────────────────────────────── */
  var navLinks = document.querySelectorAll('.nav-links a');
  var currentPath = window.location.pathname;

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && currentPath !== '/' && href !== '/' && currentPath.startsWith(href)) {
      link.classList.add('active');
    } else if (href === currentPath) {
      link.classList.add('active');
    }
  });

});
