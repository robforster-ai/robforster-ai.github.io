/* RF // THE MATRIX — cyberspace grid layer
   "Lines of light ranged in the nonspace of the mind, clusters and
   constellations of data. Like city lights, receding."
   Dead-channel static resolves into a receding grid horizon as the
   visitor scrolls. 2D canvas — no external dependency, no per-frame
   shadowBlur. Loaded only on pages with `particles: true` front matter.
   Degrades gracefully: reduced motion gets a single ordered frame,
   mobile gets a lighter field, canvas failure exits silently. */

(function () {
  'use strict';

  var canvas, ctx;
  try {
    canvas = document.createElement('canvas');
    canvas.id = 'rf-particles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d');
    if (!ctx) return;
  } catch (e) {
    return; // no canvas — site works fine without the field
  }

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = matchMedia('(max-width: 768px)').matches;
  var DPR = Math.min(devicePixelRatio || 1, 1.75);

  var W = 0, H = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
  }

  /* deterministic PRNG so the field is stable across resizes */
  var seed = 20260712;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  var COUNT = mobile ? 480 : 1150;
  var COLS = 17, ROWS = 12;          // floor lattice the chaos resolves into
  var FOCAL = 420;                    // perspective focal length
  var chaos = new Float32Array(COUNT * 2);
  var order = new Float32Array(COUNT * 2);
  var gold = new Uint8Array(COUNT);
  var spires = [];

  function project(col, row) {
    /* floor point (x, z) seen from a camera above the plane */
    var z = 1.6 + row * 1.05;
    var x = (col - (COLS - 1) / 2) * 1.15;
    var horizon = H * 0.42;
    var camH = 2.6;
    return [
      W / 2 + (x * FOCAL) / z,
      horizon + (camH * FOCAL) / z
    ];
  }

  function layout() {
    seed = 20260712;
    for (var i = 0; i < COUNT; i++) {
      /* chaos: dead-channel scatter across the whole frame */
      chaos[i * 2] = rnd() * W;
      chaos[i * 2 + 1] = rnd() * H;
      /* order: a slot on the receding lattice */
      var col = i % COLS;
      var row = ((i / COLS) | 0) % ROWS;
      var p = project(col + (rnd() - 0.5) * 0.08, row + (rnd() - 0.5) * 0.08);
      order[i * 2] = p[0];
      order[i * 2 + 1] = p[1];
      gold[i] = rnd() < 0.085 ? 1 : 0;
    }
    /* data spires: city lights on the horizon, fixed layout */
    spires.length = 0;
    for (var s = 0; s < (mobile ? 12 : 22); s++) {
      spires.push({
        x: rnd(), h: 0.10 + rnd() * 0.42,
        w: 2 + rnd() * (mobile ? 6 : 12),
        gold: rnd() < 0.16
      });
    }
  }

  var mix = reduced ? 1 : 0;
  var targetMix = reduced ? 1 : 0;
  var fade = 1;             // recede once the visitor moves past the hero
  var mx = 0, my = 0;       // pointer parallax

  function readScroll() {
    targetMix = reduced ? 1 : Math.min(scrollY / (innerHeight * 0.9), 1);
    var past = Math.min(Math.max((scrollY - innerHeight * 0.9) / innerHeight, 0), 1);
    fade = 1 - past * 0.65;
  }
  addEventListener('scroll', readScroll, { passive: true });

  if (!mobile && !reduced) {
    addEventListener('pointermove', function (e) {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    });
  }

  addEventListener('resize', function () {
    resize();
    if (reduced) draw(0);
  });

  var ease = function (a, b, t) { return a + (b - a) * t; };

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = fade;

    var m = mix * mix * (3 - 2 * mix); // smooth-step the resolve
    var horizon = H * 0.42 + my * 16;
    var cx = W / 2 + mx * 34;
    var drift = now * 0.00018;

    /* grid lines + horizon + spires fade in with the resolve */
    if (m > 0.04) {
      var ga = m;

      /* sky glow above the horizon */
      var sky = ctx.createLinearGradient(0, horizon - H * 0.2, 0, horizon);
      sky.addColorStop(0, 'rgba(57,255,157,0)');
      sky.addColorStop(1, 'rgba(57,255,157,' + (0.05 * ga) + ')');
      ctx.fillStyle = sky;
      ctx.fillRect(0, horizon - H * 0.2, W, H * 0.2);

      /* data spires — cheap halo, no shadowBlur */
      for (var s = 0; s < spires.length; s++) {
        var sp = spires[s];
        var sx = cx + (sp.x - 0.5) * W * 1.35;
        var sh = sp.h * H * 0.32 * ga;
        ctx.fillStyle = sp.gold
          ? 'rgba(201,162,75,' + (0.10 * ga) + ')'
          : 'rgba(77,219,232,' + (0.10 * ga) + ')';
        ctx.fillRect(sx - sp.w * 1.6, horizon - sh, sp.w * 3.2, sh);
        ctx.fillStyle = sp.gold
          ? 'rgba(201,162,75,' + (0.62 * ga) + ')'
          : 'rgba(77,219,232,' + (0.5 * ga) + ')';
        ctx.fillRect(sx - sp.w / 2, horizon - sh, sp.w, sh);
      }

      /* horizon line */
      ctx.strokeStyle = 'rgba(57,255,157,' + (0.55 * ga) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, horizon); ctx.lineTo(W, horizon); ctx.stroke();

      /* longitudinal lines converging on the vanishing point */
      for (var c = 0; c <= COLS; c++) {
        var fx = (c / COLS - 0.5) * W * 2.2 + cx;
        var la = (0.05 + 0.09 * (1 - Math.abs(c / COLS - 0.5) * 2)) * ga;
        ctx.strokeStyle = 'rgba(77,219,232,' + la + ')';
        ctx.beginPath(); ctx.moveTo(fx, H); ctx.lineTo(cx, horizon); ctx.stroke();
      }

      /* transverse lines flowing toward the viewer */
      var flow = reduced ? 0 : (now * 0.00004) % (1 / 14);
      for (var r = 0; r < 14; r++) {
        var f = (r / 14 + flow) % 1;
        var y = horizon + f * f * (H - horizon);
        ctx.strokeStyle = 'rgba(57,255,157,' + ((0.04 + 0.16 * f) * ga) + ')';
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    /* the particles themselves: static → lattice */
    var sz = mobile ? 1.6 : 1.8;
    for (var i = 0; i < COUNT; i++) {
      var j = i * 2;
      var wob = Math.sin(drift * 60 + i) * 14 * (1 - m);
      var px = ease(chaos[j], order[j], m) + wob;
      var py = ease(chaos[j + 1], order[j + 1], m) + wob * 0.6;
      var a = 0.28 + 0.4 * m;
      ctx.fillStyle = gold[i]
        ? 'rgba(201,162,75,' + a + ')'
        : 'rgba(77,219,232,' + a + ')';
      ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
    }

    ctx.globalAlpha = 1;
  }

  var running = true;
  var t0 = performance.now();

  /* Pause the loop when the tab is hidden — battery courtesy */
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running && !reduced) { t0 = performance.now(); requestAnimationFrame(tick); }
  });

  function tick(now) {
    if (!running) return;
    /* MySpace mode hides the canvas — idle the loop, don't draw to it */
    if (document.documentElement.classList.contains('myspace')) {
      t0 = now;
      requestAnimationFrame(tick);
      return;
    }
    var dt = Math.min((now - t0) / 1000, 0.05);
    t0 = now;
    mix = ease(mix, targetMix, 1 - Math.pow(0.001, dt));
    draw(now);
    requestAnimationFrame(tick);
  }

  resize();
  readScroll();
  if (reduced) {
    draw(0); // single ordered frame
  } else {
    requestAnimationFrame(tick);
  }
}());
