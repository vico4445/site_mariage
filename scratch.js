(function () {
  const canvas = document.getElementById('scratch-canvas');
  const ctx = canvas.getContext('2d');
  const hint = document.getElementById('hint');

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawScratchLayer();
  }

  function drawScratchLayer() {
    ctx.fillStyle = '#c8b89a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < canvas.width * canvas.height / 40; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }

    ctx.fillStyle = 'rgba(74,64,53,0.7)';
    ctx.font = `italic ${Math.floor(canvas.width / 18)}px 'Cormorant Garamond', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Grattez pour découvrir', canvas.width / 2, canvas.height / 2);
  }

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
    for (let i = 3; i < pixels.length; i += 32) {
      if (pixels[i] < 128) transparent++;
    }
    const total = pixels.length / 32;
    if (transparent / total > 0.55) {
      canvas.style.transition = 'opacity 0.6s ease';
      canvas.style.opacity = '0';
      hint.classList.add('hidden');
      setTimeout(() => { canvas.style.display = 'none'; }, 700);
    }
  }

  canvas.addEventListener('mousedown', (e) => { isScratching = true; scratch(getPos(e)); });
  canvas.addEventListener('mousemove', (e) => { if (isScratching) scratch(getPos(e)); });
  window.addEventListener('mouseup', () => { isScratching = false; });

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isScratching = true; scratch(getPos(e)); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isScratching) scratch(getPos(e)); }, { passive: false });
  window.addEventListener('touchend', () => { isScratching = false; });

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
})();
