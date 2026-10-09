/* ========================================================
   晴れ猫 · CLIPSULE — Main JavaScript
   桌面端交互: 滚动揭示、自定义光标、3D倾斜、花瓣画布、Toast通知
   仅在桌面端(≥768px)初始化，移动端不加载任何交互
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;

  // 移动端不执行任何桌面端交互
  if (!isDesktop) return;

  // 1. 滚动揭示 + 动态指标条 + 数字计数器
  const animatedSections = new Set();
  const fadeElements = document.querySelectorAll('.fade-up');

  const triggerSectionAnimation = (section) => {
    if (animatedSections.has(section)) return;
    animatedSections.add(section);

    // 填充动态百分比条
    const bars = section.querySelectorAll('.dynamic-bar');
    bars.forEach((bar, index) => {
      const targetW = bar.getAttribute('data-width');
      setTimeout(() => {
        bar.style.transition = 'width 1.25s cubic-bezier(0.16, 1, 0.3, 1)';
        bar.style.width = targetW;
      }, index * 100);
    });

    // 数字从0计数到目标值
    const counters = section.querySelectorAll('.counter-number');
    counters.forEach((counter, idx) => {
      const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
      let current = 0;
      const duration = 1200;
      const stepTime = Math.max(16, Math.floor(duration / target));
      setTimeout(() => {
        const timer = setInterval(() => {
          current += Math.ceil(target / (duration / 40));
          if (current >= target) {
            counter.innerText = target;
            clearInterval(timer);
          } else {
            counter.innerText = current;
          }
        }, stepTime);
      }, idx * 80);
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          triggerSectionAnimation(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeElements.forEach(el => observer.observe(el));
  } else {
    fadeElements.forEach(el => {
      el.classList.add('in-view');
      triggerSectionAnimation(el);
    });
  }

  // 2. 自定义光标 (Avant-Garde Viewfinder Cursor)
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorRing = document.getElementById('custom-cursor-ring');
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let targetSnapX = null, targetSnapY = null;

  if (!isReduced && cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    window.addEventListener('mousedown', () => document.body.classList.add('cursor-clicking'));
    window.addEventListener('mouseup', () => document.body.classList.remove('cursor-clicking'));

    const renderCursor = () => {
      const destX = (targetSnapX !== null) ? targetSnapX : mouseX;
      const destY = (targetSnapY !== null) ? targetSnapY : mouseY;
      ringX += (destX - ringX) * 0.18;
      ringY += (destY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // 磁性吸附效果
    const interactiveElements = document.querySelectorAll('a, button, .cursor-interactive, .tactile-tag, .bloom-trigger');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        if (el.classList.contains('interactive-btn') || el.classList.contains('tactile-tag')) {
          const rect = el.getBoundingClientRect();
          targetSnapX = rect.left + rect.width / 2;
          targetSnapY = rect.top + rect.height / 2;
        }
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        targetSnapX = null;
        targetSnapY = null;
      });
    });
  }

  // 3. 3D 透视倾斜 + 动态高光
  if (!isReduced && window.matchMedia('(pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll('.interactive-card');
    tiltCards.forEach(card => {
      const glare = card.querySelector('.glare-overlay');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`;

        if (glare) {
          const xPercent = (x / rect.width) * 100;
          const yPercent = (y / rect.height) * 100;
          glare.style.opacity = '0.7';
          glare.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255, 255, 255, 0.35) 0%, transparent 65%)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        if (glare) {
          glare.style.opacity = '0';
        }
      });
    });
  }

  // 4. 玫瑰绽放涟漪微交互
  const bloomTriggers = document.querySelectorAll('.bloom-trigger');
  bloomTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const rect = trigger.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'bloom-ripple';
      const size = Math.max(rect.width, rect.height) * 0.9;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      trigger.appendChild(ripple);
      setTimeout(() => ripple.remove(), 950);
    });
  });

  // 5. 花瓣 & 玫瑰金粉尘画布动画
  const canvas = document.getElementById('petals-canvas');
  if (canvas && !isReduced) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let pointerX = -999, pointerY = -999;
    window.addEventListener('mousemove', (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
    });

    const petalsCount = Math.min(22, Math.floor(width / 65));
    const particlesCount = 20;
    const petals = [];
    const dustParticles = [];

    for (let i = 0; i < petalsCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 6 + Math.random() * 8,
        speedY: 0.35 + Math.random() * 0.65,
        speedX: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        opacity: 0.18 + Math.random() * 0.28,
        color: Math.random() > 0.4 ? 'rgba(224, 83, 112,' : 'rgba(244, 140, 160,'
      });
    }

    for (let j = 0; j < particlesCount; j++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 1.5,
        speedY: 0.15 + Math.random() * 0.35,
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: 0.2 + Math.random() * 0.35,
        color: Math.random() > 0.5 ? 'rgba(224, 83, 112,' : 'rgba(212, 163, 115,'
      });
    }

    const renderPetals = () => {
      ctx.clearRect(0, 0, width, height);

      dustParticles.forEach(dp => {
        dp.y += dp.speedY;
        dp.x += dp.speedX;
        if (dp.y > height + 10) { dp.y = -10; dp.x = Math.random() * width; }
        if (dp.x > width + 10) dp.x = -10;
        if (dp.x < -10) dp.x = width + 10;
        ctx.fillStyle = `${dp.color} ${dp.opacity})`;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, dp.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      petals.forEach(p => {
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.x += (dx / dist) * force * 1.8;
          p.y += (dy / dist) * force * 1.8;
        }
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * 0.45 + p.speedX;
        p.angle += p.spin;
        if (p.y > height + 25) { p.y = -20; p.x = Math.random() * width; }
        if (p.x > width + 25) p.x = -20;
        if (p.x < -25) p.x = width + 25;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(renderPetals);
    };
    requestAnimationFrame(renderPetals);
  }

  // 6. 纸飞机动画 & Toast通知
  const toast = document.getElementById('editorial-toast');
  const interactiveBtns = document.querySelectorAll('.interactive-btn');
  let toastTimer = null;

  interactiveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('.send-icon, .cta-icon');
      if (icon) {
        icon.classList.add('animating-plane');
        setTimeout(() => icon.classList.remove('animating-plane'), 800);
      }
      if (toast) {
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toast.classList.remove('show');
        }, 3600);
      }
    });
  });
});
