# Wedding Site — Implementation Plan

## Goal

Static one-page wedding website. Central feature: scratch-off canvas that reveals the Save the Date message. No framework, no dependencies. Pure HTML/CSS/JS.

---

## File Structure to Create

```
site_mariage/
├── index.html
├── style.css
├── scratch.js
```

No build step. No package.json. Must work with `file://` protocol and `python3 -m http.server`.

---

## 1. `index.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Céline & Victor — Save the Date</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <!-- Decorative dried flowers (SVG, positioned absolute) -->
  <div class="flowers" aria-hidden="true">
    <!-- top-left -->
    <svg class="flower flower--tl" ...></svg>
    <!-- top-right -->
    <svg class="flower flower--tr" ...></svg>
    <!-- bottom-left -->
    <svg class="flower flower--bl" ...></svg>
    <!-- bottom-right -->
    <svg class="flower flower--br" ...></svg>
  </div>

  <!-- Scratch card container -->
  <main class="card-wrapper">
    <!-- Revealed text (under the canvas) -->
    <div class="message" id="message">
      <p>Save the date</p>
      <p class="names">Céline &amp; Victor</p>
      <p>se marient le <strong>10 juillet 2027</strong></p>
      <p>et vous convient à célébrer ce beau moment avec eux.</p>
      <p class="soon">Plus d'infos à venir.</p>
    </div>

    <!-- Canvas overlay (scratch layer) -->
    <canvas id="scratch-canvas"></canvas>
  </main>

  <!-- Hint text -->
  <p class="hint" id="hint">Grattez pour découvrir ✦</p>

  <script src="scratch.js"></script>
</body>
</html>
```

---

## 2. `style.css`

### Color palette
- Background: `#f5f0e8` (warm beige)
- Card bg: `#faf7f2` (off-white)
- Text: `#4a4035` (dark warm brown)
- Accent beige: `#c8b89a`
- Accent green: `#7a8c6e` (sage)
- Gold accent: `#d4c4a0`

### Layout
- `body`: `min-height: 100vh`, `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content: center`, `background: #f5f0e8`, `overflow: hidden`, `position: relative`
- `.card-wrapper`: `position: relative`, `width: min(480px, 90vw)`, `border-radius: 16px`, `box-shadow: 0 4px 32px rgba(74,64,53,0.10)`, `overflow: hidden`
- `.message`: `padding: 3rem 2.5rem`, `font-family: 'Cormorant Garamond', serif`, `text-align: center`, `line-height: 1.8`, `font-size: clamp(1rem, 2.5vw, 1.25rem)`, `background: #faf7f2`, `color: #4a4035`
- `.message .names`: `font-size: 2em`, `font-style: italic`, `font-weight: 500`, `margin: 0.5rem 0`
- `.message strong`: `font-weight: 500`
- `.message .soon`: `margin-top: 1.5rem`, `font-size: 0.85em`, `color: #9a8c7e`, `font-style: italic`
- `canvas#scratch-canvas`: `position: absolute`, `top: 0`, `left: 0`, `width: 100%`, `height: 100%`, `cursor: crosshair`, `touch-action: none`

### Hint text
- `.hint`: `margin-top: 1rem`, `font-family: 'Cormorant Garamond', serif`, `color: #9a8c7e`, `font-size: 0.9rem`, `font-style: italic`, `letter-spacing: 0.05em`, `transition: opacity 0.5s`
- `.hint.hidden`: `opacity: 0`, `pointer-events: none`

### Decorative flowers
- `.flowers`: `position: fixed`, `inset: 0`, `pointer-events: none`, `z-index: 0`
- `.card-wrapper`, `.hint`: `position: relative`, `z-index: 1`
- Each `.flower`: `position: absolute`, sized ~180-220px
- `.flower--tl`: `top: -40px; left: -30px; transform: rotate(15deg)`
- `.flower--tr`: `top: -20px; right: -40px; transform: rotate(-20deg) scaleX(-1)`
- `.flower--bl`: `bottom: -30px; left: -20px; transform: rotate(-10deg)`
- `.flower--br`: `bottom: -40px; right: -30px; transform: rotate(25deg) scaleX(-1)`

### SVG flowers (dried flower style)
Create 1 reusable SVG shape, use in 4 positions. Design: a simple stem with 3-4 oval petals/seed heads on branches. Colors: `#c8b89a`, `#7a8c6e`, `#d4c4a0`. Stroke-based, thin lines, minimalist. Example SVG structure:

```svg
<svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Main stem -->
  <path d="M100 280 Q95 200 90 150 Q85 100 100 50" stroke="#c8b89a" stroke-width="2" />
  <!-- Branch 1 -->
  <path d="M95 160 Q70 140 50 120" stroke="#c8b89a" stroke-width="1.5" />
  <!-- Seed head branch 1 -->
  <ellipse cx="48" cy="118" rx="8" ry="14" fill="#7a8c6e" opacity="0.7" transform="rotate(-20 48 118)" />
  <!-- Branch 2 -->
  <path d="M92 130 Q115 110 130 90" stroke="#c8b89a" stroke-width="1.5" />
  <!-- Seed head branch 2 -->
  <ellipse cx="132" cy="88" rx="7" ry="12" fill="#d4c4a0" opacity="0.8" transform="rotate(15 132 88)" />
  <!-- Top flower -->
  <ellipse cx="100" cy="48" rx="10" ry="18" fill="#7a8c6e" opacity="0.6" />
  <ellipse cx="90" cy="55" rx="7" ry="12" fill="#c8b89a" opacity="0.7" transform="rotate(-30 90 55)" />
  <ellipse cx="110" cy="55" rx="7" ry="12" fill="#c8b89a" opacity="0.7" transform="rotate(30 110 55)" />
</svg>
```

Use 2-3 variants (slightly different shapes/branch angles) for the 4 corner positions.

---

## 3. `scratch.js`

Full logic:

```javascript
(function () {
  const canvas = document.getElementById('scratch-canvas');
  const ctx = canvas.getContext('2d');
  const hint = document.getElementById('hint');

  // Size canvas to match displayed size
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawScratchLayer();
  }

  function drawScratchLayer() {
    // Base fill: warm beige
    ctx.fillStyle = '#c8b89a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grain texture: random dots for tactile feel
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < canvas.width * canvas.height / 40; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }

    // Subtle text prompt on scratch layer
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = `italic ${Math.floor(canvas.width / 18)}px 'Cormorant Garamond', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Grattez pour découvrir', canvas.width / 2, canvas.height / 2);
  }

  // Scratch erasing
  let isScratching = false;
  const BRUSH_RADIUS = 28;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function scratch(pos) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    checkReveal();
  }

  function checkReveal() {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    // Sample every 8th pixel for performance
    for (let i = 3; i < pixels.length; i += 32) {
      if (pixels[i] < 128) transparent++;
    }
    const total = pixels.length / 32;
    if (transparent / total > 0.55) {
      // Auto-reveal: fade out canvas
      canvas.style.transition = 'opacity 0.6s ease';
      canvas.style.opacity = '0';
      hint.classList.add('hidden');
      setTimeout(() => { canvas.style.display = 'none'; }, 700);
    }
  }

  canvas.addEventListener('mousedown', (e) => { isScratching = true; scratch(getPos(e)); });
  canvas.addEventListener('mousemove', (e) => { if (isScratching) scratch(getPos(e)); });
  window.addEventListener('mouseup', () => { isScratching = false; });

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isScratching = true; scratch(getPos(e)); });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isScratching) scratch(getPos(e)); });
  window.addEventListener('touchend', () => { isScratching = false; });

  // Cursor: circle while hovering
  canvas.style.cursor = 'none';
  // Optional: custom cursor div could be added but crosshair is acceptable fallback

  // Init
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
})();
```

---

## Exact Message Text

```
Save the date
Céline & Victor
se marient le 10 juillet 2027
et vous convient à célébrer ce beau moment avec eux.
Plus d'infos à venir.
```

---

## Verification Checklist

1. `python3 -m http.server 8080` in `/home/victor/site_mariage/`, open `http://localhost:8080`
2. Canvas renders over message on load
3. Mouse scratch works — pixels erase correctly
4. Touch scratch works (mobile DevTools emulation)
5. Auto-reveal triggers smoothly at ~55% scratched
6. Page reload → canvas fully resets (no localStorage)
7. All 4 corner flowers visible, `pointer-events: none`
8. Fonts load (Cormorant Garamond)
9. Responsive: test at 375px width (iPhone SE)
