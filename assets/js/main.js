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

  /* ── Geocities Mode ──────────────────────────────────────── */
  (function () {
    var btn = document.getElementById('geocitiesBtn');
    if (!btn) return;

    var geoActive = false;
    var sparkleThrottle = false;

    /* Marquee — inserted after nav */
    var marqueeWrap = document.createElement('div');
    marqueeWrap.className = 'geocities-marquee-wrap';
    var msg = '★ WELCOME TO ROB FORSTER\'S HOME PAGE ★ '
            + 'ENTERPRISE AI IS MY PASSION ★ '
            + 'Best viewed in Netscape Navigator 4.0 at 800×600 ★ '
            + 'Please sign my GUESTBOOK ★ '
            + 'Last updated: TODAY ★ '
            + 'NO HOTLINKING OR I WILL FIND YOU ★ '
            + 'Under construction since 1996 ★ '
            + 'Please enable JavaScript AND Flash Player ★ '
            + 'AI is totally RADICAL ★ '
            + 'This page is 100% Y2K compliant ★    ';
    var marqueeEl = document.createElement('marquee');
    marqueeEl.setAttribute('scrollamount', '5');
    marqueeEl.style.cssText = 'font-family:\'Comic Sans MS\',cursive;font-weight:bold;color:#ffff00;font-size:0.95rem;';
    marqueeEl.textContent = msg;
    marqueeWrap.appendChild(marqueeEl);

    var navEl = document.querySelector('.nav');
    if (navEl && navEl.parentNode) {
      navEl.parentNode.insertBefore(marqueeWrap, navEl.nextSibling);
    }

    /* Under Construction banner — inserted after hero */
    var construction = document.createElement('div');
    construction.className = 'geocities-construction';
    construction.innerHTML = '&#x1F6A7;&nbsp; THIS SITE IS UNDER CONSTRUCTION &nbsp;&#x1F6A7;'
      + '<br><span style="font-size:0.8rem;color:#000000;font-weight:normal;">'
      + 'Please come back when it\'s finished. (It\'s never finished.)</span>';

    var heroEl = document.querySelector('.hero');
    if (heroEl && heroEl.nextSibling) {
      heroEl.parentNode.insertBefore(construction, heroEl.nextSibling);
    }

    /* Visitor counter — inserted inside footer */
    var counter = document.createElement('div');
    counter.className = 'geocities-counter';
    counter.innerHTML = '&#x1F441; You are visitor number <strong>#001,337</strong>';
    var footerInner = document.querySelector('.footer-inner');
    if (footerInner) {
      footerInner.parentNode.insertBefore(counter, footerInner.nextSibling);
    }

    /* Cursor sparkle trail */
    var sparkleColors = ['#ff0000','#ff8800','#ffff00','#00ff00','#0000ff','#ff00ff','#00ffff','#ffffff'];

    function spawnSparkle(x, y) {
      var el = document.createElement('div');
      el.className = 'geo-sparkle';
      el.style.background = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      el.style.left = (x - 4) + 'px';
      el.style.top  = (y - 4) + 'px';
      document.body.appendChild(el);
      setTimeout(function () {
        el.style.opacity = '0';
        el.style.transform = 'scale(0) translateY(-' + (12 + Math.random() * 18) + 'px)';
      }, 30);
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 800);
    }

    document.addEventListener('mousemove', function (e) {
      if (!geoActive || sparkleThrottle) return;
      sparkleThrottle = true;
      spawnSparkle(e.clientX, e.clientY);
      setTimeout(function () { sparkleThrottle = false; }, 50);
    });

    /* Toggle */
    btn.addEventListener('click', function () {
      geoActive = !geoActive;
      document.body.classList.toggle('geocities', geoActive);
      btn.textContent = geoActive ? '\u2715 Exit Geocities Mode' : '\uD83D\uDCBE Geocities Mode';
    });
  }());

});
