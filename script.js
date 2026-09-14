// Cursor trail — receipt-style characters that follow the mouse
window.cursorWild = false;

(function () {
  const CHARS      = ['·', '·', '·', '·', '*', '─', '+', '|'];
  const WILD_CHARS = ['!', '#', '$', '%', '&', '@', '~', '*', '?', '+', '=', '<', '>'];
  const MAX_ALPHA  = 110;
  const LIFETIME   = 55;
  const COLORS = [
    [56,  106, 223],
    [34,   71, 138],
    [122, 159, 212],
    [155, 180, 217],
    [160, 148, 210],
    [130, 120, 200],
    [56,  106, 223],
    [122, 159, 212],
  ];
  const WILD_COLORS = [
    [255,  80,  80],
    [255, 160,  30],
    [255, 210,  50],
    [60,  200, 100],
    [80,  180, 255],
    [200,  80, 255],
    [255,  80, 180],
    [255, 255, 255],
  ];

  const sketch = (p) => {
    let particles = [];
    let ringX, ringY;

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
      p.frameRate(60);
      ringX = p.windowWidth / 2;
      ringY = p.windowHeight / 2;
    };

    function drawStar4(x, y, outer, inner) {
      const verts = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4) - Math.PI / 2;
        const r = i % 2 === 0 ? outer : inner;
        verts.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r]);
      }
      const n = verts.length;
      p.curveTightness(0);
      p.beginShape();
      p.curveVertex(verts[n - 1][0], verts[n - 1][1]);
      for (let i = 0; i < n; i++) p.curveVertex(verts[i][0], verts[i][1]);
      p.curveVertex(verts[0][0], verts[0][1]);
      p.curveVertex(verts[1][0], verts[1][1]);
      p.endShape();
    }

    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);

    p.mouseMoved = () => {
      const wild = window.cursorWild;
      if (p.frameCount % (wild ? 1 : 3) === 0) {
        const count  = wild ? 4 : 1;
        const chars  = wild ? WILD_CHARS : CHARS;
        const colors = wild ? WILD_COLORS : COLORS;
        for (let i = 0; i < count; i++) {
          particles.push({
            x:    p.mouseX + (wild ? p.random(-10, 10) : 0),
            y:    p.mouseY + (wild ? p.random(-10, 10) : 0),
            char: chars[Math.floor(Math.random() * chars.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            life: wild ? LIFETIME * 1.4 : LIFETIME,
            size: wild ? p.random(16, 28) : 13,
            dx:   wild ? p.random(-3, 3)  : p.random(-0.3, 0.3),
            dy:   wild ? p.random(-4, 4)  : p.random(-0.8, -0.2),
          });
        }
      }
    };

    p.draw = () => {
      p.clear();
      const wild = window.cursorWild;
      const cx = p.mouseX, cy = p.mouseY;
      const dt   = Math.min(p.deltaTime / 16.67, 3);
      const LERP = 1 - Math.pow(0.88, dt);
      ringX += (cx - ringX) * LERP;
      ringY += (cy - ringY) * LERP;

      const starCol = wild
        ? WILD_COLORS[Math.floor(p.frameCount / 3) % WILD_COLORS.length]
        : [34, 71, 138];
      p.noFill();
      p.stroke(starCol[0], starCol[1], starCol[2], 200);
      p.strokeWeight(wild ? 2 : 1.2);
      drawStar4(ringX, ringY, wild ? 28 : 17, wild ? 11 : 7);

      p.noStroke();
      p.fill(starCol[0], starCol[1], starCol[2], 230);
      p.ellipse(cx, cy, wild ? 8 : 5, wild ? 8 : 5);

      p.noStroke();
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt    = particles[i];
        const maxL  = wild ? LIFETIME * 1.4 : LIFETIME;
        const alpha = (pt.life / maxL) * MAX_ALPHA;
        p.textSize(pt.size || 13);
        p.fill(pt.color[0], pt.color[1], pt.color[2], alpha);
        p.text(pt.char, pt.x, pt.y);
        pt.x += pt.dx;
        pt.y += pt.dy;
        pt.life--;
        if (pt.life <= 0) particles.splice(i, 1);
      }
      p.textSize(13);
    };
  };

  new p5(sketch);
})();

// Easter egg — 3 rapid clicks on 🧾 triggers wild trail + "you found it!"
// Uses sessionStorage so the count survives page navigations
window.addEventListener('DOMContentLoaded', function () {
  var icon = document.querySelector('.home-icon');
  if (!icon) return;

  // On page load check if we're mid-sequence
  var now = Date.now();
  var count = parseInt(sessionStorage.getItem('receiptClicks') || '0', 10);
  var last  = parseInt(sessionStorage.getItem('receiptLastClick') || '0', 10);
  if (now - last > 800) { count = 0; sessionStorage.setItem('receiptClicks', '0'); }
  if (count >= 3) { sessionStorage.setItem('receiptClicks', '0'); triggerEasterEgg(); }

  icon.addEventListener('click', function (e) {
    e.preventDefault();
    var ts    = Date.now();
    var prev  = parseInt(sessionStorage.getItem('receiptLastClick') || '0', 10);
    var c     = parseInt(sessionStorage.getItem('receiptClicks') || '0', 10);
    if (ts - prev > 800) c = 0;
    c++;
    sessionStorage.setItem('receiptClicks', c);
    sessionStorage.setItem('receiptLastClick', ts);

    if (c >= 3) {
      sessionStorage.setItem('receiptClicks', '0');
      triggerEasterEgg();
    } else {
      var page = window.location.pathname.split('/').pop();
      if (page !== 'index.html' && page !== '' && page !== '/') {
        window.location.href = 'index.html';
      }
    }
  });

  function triggerEasterEgg() {
    window.cursorWild = true;
    var toast = document.createElement('div');
    toast.textContent = 'you found it! 🎉';
    toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);' +
      'background:#386adf;color:#fff;font-family:monospace;font-size:13px;' +
      'padding:8px 18px;border-radius:20px;z-index:99999;pointer-events:none;' +
      'opacity:1;transition:opacity 0.5s ease;';
    document.body.appendChild(toast);
    setTimeout(function () {
      window.cursorWild = false;
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 500);
    }, 3000);
  }
});

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

  const currentPage = window.location.pathname.split('/').pop();
  const navbar = document.querySelector('.navbar');
  const hero = document.querySelector('.hero');

  // Pad hero on receipt pages so content clears the fixed navbar
  if (
    currentPage === 'index.html' ||
    currentPage === 'contact.html' ||
    currentPage === '' ||
    currentPage === '/'
  ) {
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

// Page transitions — fade out before navigating, CSS handles fade in
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.body.style.transition = 'opacity 0.25s ease';

    document.querySelectorAll('a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      if (link.classList.contains('home-icon')) return; // handled by easter egg
      if (link.target === '_blank') return;
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      link.addEventListener('click', function (e) {
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(function () {
          window.location.href = href;
        }, 260);
      });
    });
  });
}());

// Folder nav — persists open/closed state across pages via localStorage
(function () {
  var btn   = document.getElementById('folder-nav-btn');
  var links = document.getElementById('folder-nav-links');
  if (!btn || !links) return;

  var open = localStorage.getItem('folderNavOpen') === 'true';

  function applyState() {
    btn.textContent = open ? '📂' : '📁';
    btn.setAttribute('aria-expanded', open);
    links.classList.toggle('open', open);
    links.setAttribute('aria-hidden', !open);
  }

  applyState();

  btn.addEventListener('click', function () {
    open = !open;
    localStorage.setItem('folderNavOpen', open);
    applyState();
  });
}());