/* RF // INTERACTIONS — GSAP micro-animation layer
   Loaded after gsap + ScrollTrigger CDN scripts, homepage only.
   Every effect is gated on prefers-reduced-motion and degrades
   to fully visible content when GSAP fails to load. */

(function () {
  'use strict';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap) return;

  document.documentElement.classList.add('gs');
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ── scroll progress hairline ── */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  if (window.ScrollTrigger) {
    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });
  }

  /* ── hero choreography: the ICE decode ──
     Lines snap into place already scrambled, then resolve —
     jacking in, not sliding up. Decode engine lives in
     cyberdeck.js (window.RF); falls back to the old slide
     if it's missing. */
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var canDecode = window.RF && typeof RF.decode === 'function' && !RF.reduced;

  if (canDecode) {
    tl.call(function () {
      RF.decode(document.querySelector('.v4-kicker'), {});
    }, null, 0.15)
      .to('.v4-h1 .ln > span', { y: 0, duration: 0.01 }, 0.25)
      .call(function () {
        /* scramble only the text nodes — the .dot span stays put */
        document.querySelectorAll('.v4-h1 .ln > span').forEach(function (span, i) {
          var node = span.firstChild;
          if (node && node.nodeType === 3) {
            RF.decode(node, { mode: 'text', delay: i * 220 });
          }
        });
      }, null, 0.25);
  } else {
    tl.from('.v4-kicker', { clipPath: 'inset(0 100% 0 0)', duration: 0.9 }, 0.15)
      .to('.v4-h1 .ln > span', { y: 0, duration: 1.1, stagger: 0.14, ease: 'power4.out' }, 0.3);
  }

  tl.from('.v4-lede', { y: 24, autoAlpha: 0, duration: 0.8 }, 0.85)
    .from('.cta-link', { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 1.0)
    .from('.stat-row', { y: 20, autoAlpha: 0, duration: 0.8 }, 1.15);

  /* ── stat counters ── */
  document.querySelectorAll('.stat .val[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var pad = parseInt(el.getAttribute('data-pad') || '0', 10);
    var obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 1.6,
      delay: 1.2,
      ease: 'power2.out',
      onUpdate: function () {
        var v = String(Math.round(obj.n));
        if (pad) v = v.padStart(pad, '0');
        el.textContent = v + suffix;
      }
    });
  });

  /* ── scroll reveals: section blocks and index rows ── */
  if (window.ScrollTrigger) {
    document.querySelectorAll('.blk .sec-h, .feat-v4, .term').forEach(function (el) {
      gsap.from(el, {
        y: 32, autoAlpha: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
    document.querySelectorAll('.idx-list, .uc-list, .tool-list').forEach(function (list) {
      var rows = list.querySelectorAll('.idx-row, .ucr, .tool-link');
      gsap.from(rows, {
        y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: list, start: 'top 84%', once: true }
      });
    });
  }

  /* ── magnetic links ── */
  if (!matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.mag').forEach(function (el) {
      var sx = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
      var sy = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        sx((e.clientX - (r.left + r.width / 2)) * 0.25);
        sy((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', function () { sx(0); sy(0); });
    });
  }
}());
