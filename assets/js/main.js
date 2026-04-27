"use strict";

const yearNode = document.querySelector("#year");
const menuToggle = document.querySelector("#menuToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const typedTagline = document.querySelector("#typedTagline");
const neuralCanvas = document.querySelector("#neuralCanvas");
const counters = document.querySelectorAll(".counter");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");
    });
  });
}

if (typedTagline) {
  const text = typedTagline.getAttribute("data-text") || "";
  let index = 0;
  const speed = 42;

  const type = () => {
    typedTagline.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) {
      window.setTimeout(type, speed);
    }
  };

  window.setTimeout(type, 650);
}

if (neuralCanvas) {
  const ctx = neuralCanvas.getContext("2d");

  if (ctx) {
    const particles = [];
    const maxDistance = 130;
    let rafId = 0;

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = neuralCanvas.getBoundingClientRect();
      neuralCanvas.width = Math.floor(rect.width * ratio);
      neuralCanvas.height = Math.floor(rect.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const initParticles = () => {
      particles.length = 0;
      const { width, height } = neuralCanvas.getBoundingClientRect();
      const count = Math.max(20, Math.floor((width * height) / 14000));
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          r: Math.random() * 1.6 + 0.8,
        });
      }
    };

    const draw = () => {
      const { width, height } = neuralCanvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.32;
            ctx.strokeStyle = `rgba(0, 245, 212, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = "rgba(0, 245, 212, 0.88)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    handleResize();
    draw();
    window.addEventListener("resize", handleResize);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.cancelAnimationFrame(rafId);
      } else {
        draw();
      }
    });
  }
}

if (counters.length > 0) {
  const formatCount = (value, formatType) => {
    if (formatType === "compact") {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1).replace(".0", "")}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1).replace(".0", "")}K`;
      }
    }
    if (formatType === "comma") {
      return value.toLocaleString();
    }
    return String(value);
  };

  const animateCounter = (counter) => {
    const target = Number(counter.getAttribute("data-target") || "0");
    const suffix = counter.getAttribute("data-suffix") || "";
    const formatType = counter.getAttribute("data-format") || "plain";
    const duration = 1400;
    const startTime = performance.now();

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const currentValue = Math.round(target * eased);
      counter.textContent = `${formatCount(currentValue, formatType)}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => observer.observe(counter));
}
