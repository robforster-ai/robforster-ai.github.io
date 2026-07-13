/* RF // CYBERDECK — global JS
   - live UTC clock in topbar
   - mobile nav overlay
   - filter pills (writing, use-cases)
*/
(function () {
  'use strict';

  /* ── live clock ─────────────────────────────────────── */
  var clk = document.getElementById('clk');
  if (clk) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var tick = function () {
      var d = new Date();
      clk.textContent = d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate())
        + ' / ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC';
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ── mobile menu ────────────────────────────────────── */
  var hamburger = document.getElementById('navHamburger');
  var overlay = document.getElementById('navOverlay');
  var overlayClose = document.getElementById('navOverlayClose');
  if (hamburger && overlay) {
    hamburger.addEventListener('click', function () { overlay.classList.add('open'); });
  }
  if (overlayClose && overlay) {
    overlayClose.addEventListener('click', function () { overlay.classList.remove('open'); });
  }
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { overlay.classList.remove('open'); });
    });
  }

  /* ── writing filter ─────────────────────────────────── */
  var catFilters = document.querySelectorAll('[data-filter-cat]');
  if (catFilters.length) {
    catFilters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter-cat');
        catFilters.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.post-card').forEach(function (card) {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ── use-cases filters (biz × proc) ─────────────────── */
  var bizPills = document.querySelectorAll('[data-filter-biz]');
  var procPills = document.querySelectorAll('[data-filter-proc]');
  if (bizPills.length || procPills.length) {
    var state = { biz: 'all', proc: 'all' };
    var ucCount = document.getElementById('ucCount');
    var ucNoResults = document.getElementById('ucNoResults');

    function applyFilters() {
      var visible = 0;
      document.querySelectorAll('.uc-card').forEach(function (card) {
        var cardBiz = card.getAttribute('data-biz');
        var cardProc = card.getAttribute('data-proc');
        var match = (state.biz === 'all' || cardBiz === state.biz)
                 && (state.proc === 'all' || cardProc === state.proc);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (ucCount) ucCount.innerHTML = '<b>' + visible + '</b> use cases shown';
      if (ucNoResults) ucNoResults.style.display = visible === 0 ? 'block' : 'none';
    }

    bizPills.forEach(function (btn) {
      btn.addEventListener('click', function () {
        bizPills.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.biz = btn.getAttribute('data-filter-biz');
        applyFilters();
      });
    });
    procPills.forEach(function (btn) {
      btn.addEventListener('click', function () {
        procPills.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.proc = btn.getAttribute('data-filter-proc');
        applyFilters();
      });
    });
  }
}());

/* ── scroll-reveal micro-animations ─────────────────────── */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js-anim');

  var targets = document.querySelectorAll('.sec, .featured, .post-card, .ribbon, .uc-card');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(function (el) { io.observe(el); });
}());

/* ============================================================
   RF // NEUROMANCER LAYER — ICE decode, phosphor boot, bleed
   ============================================================ */

/* ── shared ICE decode engine ───────────────────────────── */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GLYPHS = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF<>/[]{}*#'.split('');
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function pick() { return GLYPHS[(rnd() * GLYPHS.length) | 0]; }
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Time-based so a resolve always lands in ~0.6–1.4s at any frame rate.
     mode 'text'  — mutates a text node's value only (safe around child spans)
     mode 'spans' — rebuilds innerHTML so unresolved glyphs glow ICE green */
  function decode(target, opts) {
    opts = opts || {};
    var node = opts.mode === 'text' ? target : null;
    var final = node ? node.nodeValue : (opts.final || target.textContent);
    var chars = final.split('');
    if (reduced || !chars.length) {
      if (node) { node.nodeValue = final; }
      if (opts.done) opts.done();
      return;
    }
    var duration = Math.min(Math.max(chars.length * 0.05, 0.6), 1.4);
    var rate = chars.length / duration;
    var start = performance.now() + (opts.delay || 0);
    function step(now) {
      if (now < start) { requestAnimationFrame(step); return; }
      var locked = Math.floor(((now - start) / 1000) * rate);
      if (node) {
        var out = '';
        for (var i = 0; i < chars.length; i++) {
          out += (chars[i] === ' ' || i < locked) ? chars[i] : pick();
        }
        node.nodeValue = out;
      } else {
        var html = '';
        for (var k = 0; k < chars.length; k++) {
          if (chars[k] === ' ') { html += ' '; }
          else if (k < locked) { html += escapeHtml(chars[k]); }
          else { html += '<span class="dcx">' + escapeHtml(pick()) + '</span>'; }
        }
        target.innerHTML = html;
      }
      if (locked < chars.length) { requestAnimationFrame(step); }
      else {
        if (node) { node.nodeValue = final; } else { target.textContent = final; }
        if (opts.done) opts.done();
      }
    }
    requestAnimationFrame(step);
  }

  window.RF = window.RF || {};
  window.RF.decode = decode;
  window.RF.reduced = reduced;

  /* ── section headings decrypt on first sight (all pages) ── */
  if (reduced || !('IntersectionObserver' in window)) return;
  var heads = document.querySelectorAll('.sec-h h2');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      /* ICE doesn't run in 2005 — MySpace mode keeps plain headings */
      if (document.documentElement.classList.contains('myspace')) return;
      decode(entry.target, {});
    });
  }, { threshold: 0.4 });
  heads.forEach(function (h) {
    /* only plain-text headings are safe to scramble */
    if (h.children.length === 0) io.observe(h);
  });
}());

/* ── phosphor terminal boot ─────────────────────────────── */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  document.querySelectorAll('.term').forEach(function (term) {
    var lines = Array.prototype.slice.call(term.querySelectorAll('p'));
    if (!lines.length) return;
    lines.forEach(function (p) { p.classList.add('boot-hide'); });

    var booted = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || booted) return;
        booted = true;
        io.disconnect();
        boot();
      });
    }, { threshold: 0.3 });
    io.observe(term);

    function boot() {
      var li = 0;
      function next() {
        if (li >= lines.length) return;
        var p = lines[li++];
        var cmd = p.querySelector('.out');
        p.classList.remove('boot-hide');
        if (!cmd || typeof cmd.animate !== 'function') { setTimeout(next, 110); return; }
        /* command lines type themselves — a steps() clip reveal, so
           the DOM text never changes and AT/find-in-page see it whole */
        var n = Math.max(cmd.textContent.length, 1);
        var anim = cmd.animate(
          [{ clipPath: 'inset(-10% 100% -10% -2%)' }, { clipPath: 'inset(-10% -2% -10% -2%)' }],
          { duration: n * 42, easing: 'steps(' + n + ', end)', fill: 'forwards' }
        );
        anim.onfinish = function () { setTimeout(next, 240); };
      }
      next();
    }
  });
}());

/* ── signal bleed: wrap CTA/button labels for slice glitch ── */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.cta-link, .btn').forEach(function (el) {
    /* only plain-text labels are safe to wrap */
    if (el.children.length !== 0 || !el.textContent.trim()) return;
    var t = el.textContent;
    var gl = document.createElement('span');
    gl.className = 'gl';
    gl.setAttribute('data-t', t);
    gl.textContent = t;
    el.textContent = '';
    el.appendChild(gl);
  });
}());
