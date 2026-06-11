/* RF // SIGNAL FIELD — three.js particle layer
   Chaos resolves into an ordered lattice as the visitor scrolls.
   Loaded only on pages with `particles: true` front matter.
   Degrades gracefully: reduced motion gets a static ordered frame,
   mobile gets a lighter field, WebGL failure exits silently. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

(function () {
  'use strict';

  let renderer;
  try {
    const canvas = document.createElement('canvas');
    canvas.id = 'rf-particles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch (e) {
    return; // no WebGL — site works fine without the field
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 768px)').matches;

  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06090f, 0.045);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 11);

  const COUNT = mobile ? 840 : 2100;
  const GRID = Math.round(Math.cbrt(COUNT));

  const chaos = new Float32Array(COUNT * 3);
  const order = new Float32Array(COUNT * 3);
  const pos = new Float32Array(COUNT * 3);
  const cols = new Float32Array(COUNT * 3);
  const cyan = new THREE.Color(0x4ddbe8);
  const gold = new THREE.Color(0xc9a24b);

  let i = 0;
  for (let x = 0; x < GRID && i < COUNT; x++)
    for (let y = 0; y < GRID && i < COUNT; y++)
      for (let z = 0; z < GRID && i < COUNT; z++, i++) {
        const s = 8.5 / (GRID - 1);
        order[i * 3] = (x - (GRID - 1) / 2) * s;
        order[i * 3 + 1] = (y - (GRID - 1) / 2) * s * 0.62;
        order[i * 3 + 2] = (z - (GRID - 1) / 2) * s - 1;

        const r = 7 + Math.random() * 9;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        chaos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        chaos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
        chaos[i * 3 + 2] = r * Math.cos(ph) * 0.6 - 2;

        const c = Math.random() < 0.085 ? gold : cyan;
        cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
      }
  pos.set(reduced ? order : chaos);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const mat = new THREE.PointsMaterial({
    size: mobile ? 0.055 : 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let mix = reduced ? 1 : 0;
  let targetMix = reduced ? 1 : 0;
  let mx = 0, my = 0;

  const BASE_OPACITY = 0.65;
  addEventListener('scroll', function () {
    targetMix = reduced ? 1 : Math.min(scrollY / (innerHeight * 0.9), 1);
    // Recede once the visitor moves past the hero so content sits on calm ground
    const past = Math.min(Math.max((scrollY - innerHeight * 0.9) / innerHeight, 0), 1);
    mat.opacity = BASE_OPACITY * (1 - past * 0.65);
  }, { passive: true });

  if (!mobile && !reduced) {
    addEventListener('pointermove', function (e) {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    });
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  const ease = (a, b, t) => a + (b - a) * t;
  let t0 = performance.now();
  let running = true;

  // Pause the loop when the tab is hidden — battery courtesy
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running && !reduced) { t0 = performance.now(); requestAnimationFrame(tick); }
  });

  function tick(now) {
    if (!running) return;
    const dt = Math.min((now - t0) / 1000, 0.05);
    t0 = now;
    mix = ease(mix, targetMix, 1 - Math.pow(0.001, dt));

    const m = mix * mix * (3 - 2 * mix); // smooth-step the resolve
    const arr = geo.attributes.position.array;
    const drift = now * 0.00018;
    for (let i = 0; i < COUNT; i++) {
      const j = i * 3;
      const wob = Math.sin(drift * 60 + i) * 0.035 * (1 - m);
      arr[j] = ease(chaos[j], order[j], m) + wob;
      arr[j + 1] = ease(chaos[j + 1], order[j + 1], m) + wob * 0.6;
      arr[j + 2] = ease(chaos[j + 2], order[j + 2], m);
    }
    geo.attributes.position.needsUpdate = true;

    points.rotation.y = drift + mx * 0.25;
    points.rotation.x = my * 0.12;
    camera.position.x = ease(camera.position.x, mx * 1.2, 0.05);
    camera.position.y = ease(camera.position.y, 1.2 - my * 0.8, 0.05);
    camera.lookAt(0, 0, -1);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  if (reduced) {
    points.rotation.y = 0.2;
    renderer.render(scene, camera); // single ordered frame
  } else {
    requestAnimationFrame(tick);
  }
}());
