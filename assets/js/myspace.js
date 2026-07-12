/* RF // MYSPACE MODE — theme flip, 2005 edition
   The footer button toggles html.myspace; the choice persists in
   localStorage ('rf-theme') and is applied pre-paint by an inline
   script in head.html. On the homepage the mode also injects the
   profile extras: Top 8, profile song, wall comments, hit counter,
   and a sparkle cursor. All of it is display-gated on html.myspace
   so toggling never needs a reload. */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isOn() { return root.classList.contains('myspace'); }

  /* ── toggle button ──────────────────────────────────── */
  var btn = document.getElementById('msToggle');
  function paintButton() {
    if (!btn) return;
    btn.textContent = isOn() ? '⟵ BACK TO CYBERDECK' : '★ MYSPACE_MODE';
    btn.setAttribute('aria-pressed', String(isOn()));
  }
  if (btn) {
    btn.addEventListener('click', function () {
      root.classList.toggle('myspace');
      try { localStorage.setItem('rf-theme', isOn() ? 'myspace' : 'cyber'); } catch (e) {}
      paintButton();
      if (isOn()) buildExtras();
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    paintButton();
  }

  /* ── homepage extras ────────────────────────────────── */
  var built = false;
  function buildExtras() {
    if (built) return;
    var hero = document.querySelector('.v4-hero, .hero');
    var footer = document.querySelector('.footer');
    if (!hero || !footer) return; // extras are a homepage thing
    built = true;

    var TOP8 = [
      ['📋', 'The Runbook', 'ride or die'],
      ['🏢', 'The Org-Chart', "it's complicated"],
      ['🧑‍✈️', 'One Owner', 'can say no'],
      ['📊', 'The Spine', 'measures everything'],
      ['🤖', 'The Agent', 'needs a manager'],
      ['🗂️', 'RACI', "knows who's paged"],
      ['⏳', 'Ninety Days', 'before you scale'],
      ['🕶️', 'W. Gibson', 'tuned to a dead channel']
    ];
    var COMMENTS = [
      ['🧑‍💼', 'The CFO', 'Jun 26 2026 3:14 PM', "the bill came due lol. where's my P&amp;L line rob 👀"],
      ['🤖', 'Autonomous Agent #7', 'Jul 8 2026 9:02 AM', 'who holds my kill switch?? asking for a friend 😅 pls respond'],
      ['📋', 'The Runbook', 'Jul 11 2026 11:47 PM', 'write me FIRST next time. backfill the model to ME. ♥']
    ];

    var wrap = document.createElement('section');
    wrap.className = 'ms-extras container';
    wrap.innerHTML =
      '<div class="msx-network">rob forster is in your extended network</div>' +

      '<div class="msx-box"><h3>♫ rob’s profile song</h3>' +
      '<div class="msx-player" id="msxPlayer">' +
      '<button type="button" id="msxPlay" aria-label="Play profile song" aria-pressed="false">▶</button>' +
      '<span class="np" id="msxNp" role="status">— paused — "dead channel (extended mix)"</span>' +
      '<span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' +
      '</div></div>' +

      '<div class="msx-box"><h3>rob forster’s Friend Space (Top 8)</h3><div class="msx-in"><div class="msx-top8">' +
      TOP8.map(function (f) {
        return '<div class="msx-friend"><div class="fp">' + f[0] + '</div><b>' + f[1] + '</b>' + f[2] + '</div>';
      }).join('') +
      '</div></div></div>' +

      '<div class="msx-box"><h3>rob forster’s Friends Comments</h3><div class="msx-in">' +
      COMMENTS.map(function (c) {
        return '<div class="msx-comment"><div class="ca">' + c[0] + '</div><div>' +
          '<span class="who">' + c[1] + '</span> <span class="when">' + c[2] + '</span>' +
          '<div>' + c[3] + '</div></div></div>';
      }).join('') +
      '</div></div>' +

      '<div class="msx-counter">You are visitor number&nbsp; <span class="num" id="msxCounter">00013370</span></div>';

    footer.parentNode.insertBefore(wrap, footer);

    /* profile song — never autoplays; classic MySpace was not so kind */
    var player = document.getElementById('msxPlayer');
    var play = document.getElementById('msxPlay');
    var np = document.getElementById('msxNp');
    play.addEventListener('click', function () {
      var on = player.classList.toggle('on');
      play.textContent = on ? '❚❚' : '▶';
      play.setAttribute('aria-pressed', String(on));
      play.setAttribute('aria-label', on ? 'Pause profile song' : 'Play profile song');
      np.textContent = on
        ? '♫ now playing: "dead channel (extended mix)" ♫'
        : '— paused — "dead channel (extended mix)"';
    });

    /* hit counter ticks for that fresh-guestbook feel */
    if (!reduced) {
      var n = 13370;
      var counter = document.getElementById('msxCounter');
      setInterval(function () {
        if (!isOn()) return;
        n += 1;
        counter.textContent = String(n).padStart(8, '0');
      }, 4000);
    }
  }
  if (isOn()) buildExtras();

  /* ── sparkle cursor trail (the 2005 essential) ──────── */
  if (reduced || matchMedia('(hover: none)').matches) return;

  var cv = document.createElement('canvas');
  cv.id = 'msx-sparkle';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d');
  if (!ctx) return;

  function size() { cv.width = innerWidth; cv.height = innerHeight; }
  size();
  addEventListener('resize', size);

  var parts = [];
  var COLORS = ['#ff0099', '#99ff00', '#00ccff', '#ffff00', '#ffffff'];
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  var raf = null;
  addEventListener('pointermove', function (e) {
    if (!isOn()) return;
    for (var i = 0; i < 2; i++) {
      parts.push({
        x: e.clientX, y: e.clientY,
        vx: (rnd() - 0.5) * 1.6, vy: (rnd() - 0.5) * 1.6 - 0.4,
        life: 1, c: COLORS[(rnd() * COLORS.length) | 0], s: 1.5 + rnd() * 2.5
      });
    }
    if (parts.length > 220) parts.splice(0, parts.length - 220);
    if (!raf) raf = requestAnimationFrame(draw);
  });

  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.03;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.s * 2); ctx.lineTo(p.x + p.s * 0.6, p.y - p.s * 0.6);
      ctx.lineTo(p.x + p.s * 2, p.y); ctx.lineTo(p.x + p.s * 0.6, p.y + p.s * 0.6);
      ctx.lineTo(p.x, p.y + p.s * 2); ctx.lineTo(p.x - p.s * 0.6, p.y + p.s * 0.6);
      ctx.lineTo(p.x - p.s * 2, p.y); ctx.lineTo(p.x - p.s * 0.6, p.y - p.s * 0.6);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(draw) : null;
  }
}());
