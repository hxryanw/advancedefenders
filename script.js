/**
 * AdvanceDefenders — site interactions
 * Loader, particles, scroll reveals, nav, cursor glow, card spotlight
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year in footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Page loader ---------- */
  const loader = document.getElementById("page-loader");
  const LOADER_MIN_MS = 900;

  function hideLoader() {
    if (!loader) return;
    loader.classList.add("is-done");
    loader.setAttribute("aria-hidden", "true");
  }

  if (loader && !prefersReducedMotion) {
    const start = performance.now();
    window.addEventListener("load", function () {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, LOADER_MIN_MS - elapsed);
      setTimeout(hideLoader, wait);
    });
  } else if (loader) {
    hideLoader();
  }

  /* ---------- Mobile nav ---------- */
  const navToggle = document.querySelector(".nav__toggle");
  const navList = document.getElementById("nav-menu");

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      const open = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navList.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navList.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Smooth in-page navigation (progressive enhancement) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const header = document.querySelector(".site-header");
      const offset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 8;
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Cursor glow (fine pointers only) ---------- */
  const cursorGlow = document.getElementById("cursor-glow");
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (cursorGlow && finePointer && !prefersReducedMotion) {
    let raf = 0;
    let mx = 0;
    let my = 0;

    document.addEventListener(
      "mousemove",
      function (e) {
        mx = e.clientX;
        my = e.clientY;
        if (!cursorGlow.classList.contains("is-active")) {
          cursorGlow.classList.add("is-active");
        }
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          cursorGlow.style.transform = "translate(" + mx + "px," + my + "px)";
        });
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      cursorGlow.classList.remove("is-active");
    });
  }

  /* ---------- Service cards: CSS variables for radial hover ---------- */
  document.querySelectorAll(".service-card").forEach(function (card) {
    card.addEventListener(
      "mousemove",
      function (e) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", x + "%");
        card.style.setProperty("--my", y + "%");
      },
      { passive: true }
    );
  });

  /* ---------- Ambient particles (canvas) ---------- */
  const canvas = document.getElementById("particle-canvas");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationId = 0;
    let w = 0;
    let h = 0;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      const count = Math.min(80, Math.floor((w * h) / 18000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          a: Math.random() * 0.5 + 0.15,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, " + p.a + ")";
        ctx.fill();
      });
      animationId = requestAnimationFrame(tick);
    }

    window.addEventListener("resize", function () {
      cancelAnimationFrame(animationId);
      resize();
      animationId = requestAnimationFrame(tick);
    });

    resize();
    animationId = requestAnimationFrame(tick);
  }
})();
