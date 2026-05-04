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
