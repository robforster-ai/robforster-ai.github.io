/* RF // THE MATRIX + THE SPRAWL — cyberspace grid & cityscape layer
   "Lines of light ranged in the nonspace of the mind, clusters and
   constellations of data. Like city lights, receding."
   Dead-channel static resolves into a receding grid horizon as the
   visitor scrolls; a procedural city wakes on the far shore, window
   by window, and scroll velocity pushes pulses of light through its
   towers. 2D canvas — no external dependency, no per-frame shadowBlur.
   Loaded only on pages with `particles: true` front matter.
   Degrades gracefully: reduced motion gets a single lit frame,
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

  /* deterministic PRNG so the field is stable across resizes */
  var seed = 20260712;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  var liveSeed = 777;
  function rndLive() { liveSeed = (liveSeed * 16807) % 2147483647; return liveSeed / 2147483647; }

  var CYAN = [77, 219, 232], GOLD = [201, 162, 75], ICE = [57, 255, 157];
  function col(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  var COUNT = mobile ? 480 : 1150;
  var COLS = 17, ROWS = 12;          // floor lattice the chaos resolves into
  var FOCAL = 420;                    // perspective focal length
  var chaos = new Float32Array(COUNT * 2);
  var order = new Float32Array(COUNT * 2);
  var goldDot = new Uint8Array(COUNT);

  /* ── the sprawl ── */
  var cityLayers = [];   // {para, dim, sil (offscreen), beacons:[{x,y,ph}], refl:[{x,w}]}
  var cityWindows = [];  // {x,y,layer,c,r,tw,sp}
  var landmark = null;
  var pulses = [];       // {x,t,v}
  var energy = 0, lastY = 0, accum = 0;

  function horizonBase() { return H * 0.42; }

  function project(colI, rowI) {
    /* floor point (x, z) seen from a camera above the plane */
    var z = 1.6 + rowI * 1.05;
    var x = (colI - (COLS - 1) / 2) * 1.15;
    var camH = 2.6;
    return [
      W / 2 + (x * FOCAL) / z,
      horizonBase() + (camH * FOCAL) / z
    ];
  }

  function buildCity() {
    var waterY = horizonBase();
    cityLayers = []; cityWindows = [];

    var defs = mobile
      ? [{ n: 16, hMin: 0.03, hMax: 0.09, wMin: 14, wMax: 34, para: 0.012, dim: 0.35, win: 0 },
         { n: 8,  hMin: 0.06, hMax: 0.17, wMin: 24, wMax: 52, para: 0.03,  dim: 1,    win: 46 }]
      : [{ n: 28, hMin: 0.03, hMax: 0.09, wMin: 14, wMax: 38, para: 0.008, dim: 0.35, win: 0 },
         { n: 15, hMin: 0.05, hMax: 0.14, wMin: 22, wMax: 50, para: 0.02,  dim: 0.6,  win: 22 },
         { n: 9,  hMin: 0.08, hMax: 0.20, wMin: 32, wMax: 70, para: 0.04,  dim: 1,    win: 52 }];

    defs.forEach(function (d, li) {
      var sil = document.createElement('canvas');
      sil.width = Math.max(W * DPR * 1.3, 10);
      sil.height = Math.max(waterY * DPR + 4, 10);
      var sx = sil.getContext('2d');
      sx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var beacons = [], refl = [];
      var span = W * 1.3;
      for (var i = 0; i < d.n; i++) {
        var bw = d.wMin + rnd() * (d.wMax - d.wMin);
        var bx = (i / d.n) * span + rnd() * (span / d.n) * 0.7;
        var bh = (d.hMin + rnd() * (d.hMax - d.hMin)) * H;
        var by = waterY - bh;
        var shade = 8 + li * 3;
        sx.fillStyle = 'rgb(' + shade + ',' + (shade + 5) + ',' + (shade + 12) + ')';
        sx.fillRect(bx, by, bw, bh);
        if (rnd() < (li === defs.length - 1 ? 0.5 : 0.15)) {
          var ax = bx + bw * (0.2 + rnd() * 0.6);
          var ah = 6 + rnd() * 10;
          sx.fillRect(ax - 0.75, by - ah, 1.5, ah);
          beacons.push({ x: ax, y: by - ah - 1, ph: rnd() * 6 });
        }
        if (li === defs.length - 1) refl.push({ x: bx + bw * 0.2, w: bw * 0.6 });
        if (d.win) {
          var wcols = Math.max(2, Math.floor(bw / 7));
          var wrows = Math.max(2, Math.floor(bh / 9));
          for (var r = 0; r < wrows; r++)
            for (var c = 0; c < wcols; c++) {
              if (rnd() > 0.42) continue;
              var cc = CYAN, roll = rnd();
              if (roll < 0.08) cc = GOLD; else if (roll < 0.10) cc = ICE;
              cityWindows.push({
                x: bx + 2 + c * (bw - 4) / wcols, y: by + 3 + r * (bh - 6) / wrows,
                layer: li, c: cc, r: rnd(), tw: rnd() * 6.28, sp: 0.3 + rnd() * 1.2
              });
            }
        }
      }
      cityLayers.push({ para: d.para, dim: d.dim, sil: sil, beacons: beacons, refl: refl });
    });

    /* landmark tower — the ICC on the far left */
    var lw = mobile ? 34 : 48, lh = H * 0.24;
    landmark = { x: W * 0.09, w: lw, y: waterY - lh, h: lh };
  }

  function layout() {
    seed = 20260712;
    for (var i = 0; i < COUNT; i++) {
      /* chaos: dead-channel scatter across the whole frame */
      chaos[i * 2] = rnd() * W;
      chaos[i * 2 + 1] = rnd() * H;
      /* order: a slot on the receding lattice */
      var colI = i % COLS;
      var rowI = ((i / COLS) | 0) % ROWS;
      var p = project(colI + (rnd() - 0.5) * 0.08, rowI + (rnd() - 0.5) * 0.08);
      order[i * 2] = p[0];
      order[i * 2 + 1] = p[1];
      goldDot[i] = rnd() < 0.085 ? 1 : 0;
    }
    buildCity();
  }

  function resize() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
  }
  addEventListener('resize', function () {
    resize();
    if (reduced) draw(0);
  });

  var mix = reduced ? 1 : 0;
  var targetMix = reduced ? 1 : 0;
  var fade = 1;             // recede once the visitor moves past the hero

  function readScroll() {
    targetMix = reduced ? 1 : Math.min(scrollY / (innerHeight * 0.9), 1);
    var past = Math.min(Math.max((scrollY - innerHeight * 0.9) / innerHeight, 0), 1);
    fade = 1 - past * 0.65;
    if (!reduced) {
      var d = Math.abs(scrollY - lastY);
      if (d > 0.5) {
        energy = Math.min(energy + d / 900, 1);
        accum += d;
        if (accum > innerHeight * 0.28 && pulses.length < 3) {
          accum = 0;
          pulses.push({ x: rndLive() * W * 1.2 - W * 0.1, t: 0, v: (rndLive() < 0.5 ? -1 : 1) * (W / 2.6) });
        }
      }
    }
    lastY = scrollY;
  }
  addEventListener('scroll', readScroll, { passive: true });

  var mx = 0, my = 0;
  if (!mobile && !reduced) {
    addEventListener('pointermove', function (e) {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    });
  }

  var ease = function (a, b, t) { return a + (b - a) * t; };

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = fade;

    var m = mix * mix * (3 - 2 * mix); // smooth-step the resolve
    var horizon = horizonBase() + my * 16;
    var cx = W / 2 + mx * 34;
    var drift = now * 0.00018;

    /* grid, city and horizon fade in with the resolve */
    if (m > 0.04) {
      var ga = m;
      var oy = my * 16; // city rides the pointer-parallax horizon

      /* sky glow above the horizon */
      var sky = ctx.createLinearGradient(0, horizon - H * 0.2, 0, horizon);
      sky.addColorStop(0, 'rgba(57,255,157,0)');
      sky.addColorStop(1, 'rgba(57,255,157,' + (0.05 * ga) + ')');
      ctx.fillStyle = sky;
      ctx.fillRect(0, horizon - H * 0.2, W, H * 0.2);

      /* the sprawl: silhouettes back to front, windows waking with m */
      for (var li = 0; li < cityLayers.length; li++) {
        var L = cityLayers[li];
        var ox = -(scrollY * L.para) - mx * 18 * (li + 1) - W * 0.05;
        ctx.globalAlpha = fade * ga * (0.55 + 0.45 * L.dim);
        ctx.drawImage(L.sil, ox, oy, W * 1.3, horizonBase() + 4);
        ctx.globalAlpha = fade;
        for (var b = 0; b < L.beacons.length; b++) {
          var bc = L.beacons[b];
          var on = reduced ? 1 : (Math.sin(now * 0.003 + bc.ph) > 0.2 ? 1 : 0.12);
          ctx.fillStyle = col(GOLD, 0.7 * on * L.dim * ga);
          ctx.fillRect(bc.x + ox - 1.25, bc.y + oy, 2.5, 2.5);
        }
      }

      /* landmark tower + rising gold crown sweep */
      var lm = landmark, lox = -(scrollY * 0.04) - mx * 54;
      ctx.fillStyle = 'rgba(12,16,24,' + (0.92 * ga) + ')';
      ctx.fillRect(lm.x + lox, lm.y + oy, lm.w, lm.h);
      if (!reduced) {
        var sweepY = lm.y + oy + lm.h - ((now * 0.03) % lm.h);
        var grad = ctx.createLinearGradient(0, sweepY - 22, 0, sweepY + 5);
        grad.addColorStop(0, 'rgba(201,162,75,0)');
        grad.addColorStop(1, col(GOLD, 0.45 * ga));
        ctx.fillStyle = grad;
        ctx.fillRect(lm.x + lox + 2, sweepY - 22, lm.w - 4, 26);
      }
      ctx.fillStyle = col(GOLD, 0.8 * ga);
      ctx.fillRect(lm.x + lox + lm.w / 2 - 0.75, lm.y + oy - 14, 1.5, 14);

      /* windows: the city wakes with the resolve; pulses ride scroll */
      for (var wi = 0; wi < cityWindows.length; wi++) {
        var w = cityWindows[wi];
        var L2 = cityLayers[w.layer];
        var ox2 = -(scrollY * L2.para) - mx * 18 * (w.layer + 1) - W * 0.05;
        var wx = w.x + ox2;
        if (wx < -10 || wx > W + 10) continue;

        var lit = w.r < (0.25 + 0.75 * m);
        if (!reduced && Math.sin(now * 0.0004 * w.sp + w.tw) > 0.997) lit = !lit;
        var boost = 0;
        for (var p = 0; p < pulses.length; p++) {
          var px = pulses[p].x + pulses[p].t * pulses[p].v;
          var dist = Math.abs(wx - px);
          if (dist < 70) { boost = Math.max(boost, 1 - dist / 70); lit = true; }
        }
        if (energy > 0.03 && ((wi * 2654435761 ^ (now / 90 | 0)) >>> 0) % 97 < energy * 22) lit = !lit;
        if (!lit) continue;

        var wa = (0.3 + 0.5 * m) * (0.55 + 0.45 * L2.dim) * ga + boost * 0.45;
        ctx.fillStyle = col(w.c, Math.min(wa, 0.95));
        var sz = w.layer === cityLayers.length - 1 ? 1.9 : 1.5;
        ctx.fillRect(wx, w.y + oy, sz, sz * 1.25);
      }

      /* harbour strip: the lattice runs out over water to the city */
      var near = cityLayers[cityLayers.length - 1];
      for (var rb = 0; rb < near.refl.length; rb++) {
        var rf = near.refl[rb];
        var rox = -(scrollY * near.para) - mx * 18 * cityLayers.length - W * 0.05;
        var wob = reduced ? 0 : Math.sin(now * 0.0012 + rf.x) * 3;
        var rgrad = ctx.createLinearGradient(0, horizon, 0, horizon + 34);
        rgrad.addColorStop(0, col(CYAN, 0.13 * ga));
        rgrad.addColorStop(1, 'rgba(77,219,232,0)');
        ctx.fillStyle = rgrad;
        ctx.fillRect(rf.x + rox + wob, horizon, rf.w, 34);
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
    var szp = mobile ? 1.6 : 1.8;
    for (var i = 0; i < COUNT; i++) {
      var j = i * 2;
      var wobp = Math.sin(drift * 60 + i) * 14 * (1 - m);
      var pxp = ease(chaos[j], order[j], m) + wobp;
      var pyp = ease(chaos[j + 1], order[j + 1], m) + wobp * 0.6;
      var a = 0.28 + 0.4 * m;
      ctx.fillStyle = goldDot[i]
        ? 'rgba(201,162,75,' + a + ')'
        : 'rgba(77,219,232,' + a + ')';
      ctx.fillRect(pxp - szp / 2, pyp - szp / 2, szp, szp);
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
    energy = Math.max(0, energy - dt * 0.55);
    for (var p = pulses.length - 1; p >= 0; p--) {
      pulses[p].t += dt;
      var px = pulses[p].x + pulses[p].t * pulses[p].v;
      if (px < -W * 0.2 || px > W * 1.4) pulses.splice(p, 1);
    }
    draw(now);
    requestAnimationFrame(tick);
  }

  resize();
  lastY = scrollY;
  readScroll();
  if (reduced) {
    draw(0); // single lit frame
  } else {
    requestAnimationFrame(tick);
  }
}());
