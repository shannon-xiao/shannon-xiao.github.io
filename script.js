// Cursor trail — receipt-style characters that follow the mouse
(function () {
  const CHARS = ['·', '·', '·', '·', '*', '─', '+', '|'];
  const MAX_ALPHA = 110;
  const LIFETIME = 55;
  // blues + lavenders pulled from site palette
  const COLORS = [
    [56,  106, 223],  // #386adf — bright blue
    [34,   71, 138],  // #22478a — navy
    [122, 159, 212],  // #7a9fd4 — periwinkle
    [155, 180, 217],  // light periwinkle
    [160, 148, 210],  // lavender
    [130, 120, 200],  // muted violet-lavender
    [56,  106, 223],  // weight bright blue a bit more
    [122, 159, 212],  // weight periwinkle a bit more
  ];

  const sketch = (p) => {
    let particles = [];

    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvas.position(0, 0);
      canvas.style('pointer-events', 'none');
      canvas.style('z-index', '9999');
      canvas.style('position', 'fixed');
      canvas.style('top', '0');
      canvas.style('left', '0');
      p.textFont('monospace');
      p.textSize(13);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.mouseMoved = () => {
      if (p.frameCount % 3 === 0) {
        particles.push({
          x: p.mouseX,
          y: p.mouseY,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: LIFETIME,
          dx: p.random(-0.3, 0.3),
          dy: p.random(-0.8, -0.2),
        });
      }
    };

    p.draw = () => {
      p.clear();
      p.noStroke();
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        const alpha = (pt.life / LIFETIME) * MAX_ALPHA;
        p.fill(pt.color[0], pt.color[1], pt.color[2], alpha);
        p.text(pt.char, pt.x, pt.y);
        pt.x += pt.dx;
        pt.y += pt.dy;
        pt.life--;
        if (pt.life <= 0) particles.splice(i, 1);
      }
    };
  };

  new p5(sketch);
})();

// Smooth scroll to section on page load if hash exists
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash) {
    setTimeout(() => {
      const targetId = window.location.hash.substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = targetSection.offsetTop - navbarHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  // Make navbar fixed on receipt pages (index + contact)
  const currentPage = window.location.pathname.split('/').pop();
  const navbar = document.querySelector('.navbar');
  const hero = document.querySelector('.hero');

  // If on index.html, root, or contact.html — fix navbar and pad hero
  if (
    currentPage === 'index.html' ||
    currentPage === 'contact.html' ||
    currentPage === '' ||
    currentPage === '/'
  ) {
    navbar.style.position = 'fixed';
    if (hero) {
      hero.style.paddingTop = '120px';
    }
  }

  // Fade in projects page content on load
  if (currentPage === 'projects.html') {
    const projects = document.querySelector('.projects');
    if (projects) {
      projects.style.opacity = '0';
      projects.style.transition = 'opacity 1s ease-in';
      setTimeout(() => {
        projects.style.opacity = '1';
      }, 100);
    }
  }

  // Receipt print animation on index and contact pages
  initReceiptPrint('receipt-image');
  initReceiptPrint('contact-receipt-image');
});

// Reveals the receipt top-to-bottom like a thermal printer.
// No-ops silently if the image ID doesn't exist on the current page.
function initReceiptPrint(imageId) {
  const img = document.getElementById(imageId);
  if (!img) return;
  const container = img.parentElement;

  // Hide only on receipt pages — inline style so it doesn't bleed to other pages
  container.style.clipPath = 'inset(0 0 100% 0)';

  function startPrint() {
    // Drop 'loading' so overlay-text is opacity:1 — clip-path handles the reveal
    container.classList.remove('loading');
    setTimeout(() => {
      // Inject scan line first so it animates in sync with the reveal
      const line = document.createElement('div');
      line.className = 'scan-line';
      container.appendChild(line);

      container.classList.add('printing');
      container.addEventListener('animationend', () => {
        container.style.clipPath = '';
        container.classList.remove('printing');
        line.remove();
      }, { once: true });
    }, 150);
  }

  if (img.complete) {
    startPrint();
  } else {
    img.addEventListener('load', startPrint);
  }
}