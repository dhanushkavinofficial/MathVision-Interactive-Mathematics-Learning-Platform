/* ══════════════════════════════════════════
   MathVision – app.js
   All features: Arithmetic, Fractions, Number Systems,
   Primes, Percentage, Geometry, Coordinate, Graph,
   Formulas, Quiz, Challenge, Converter, Mult Table, Stats
══════════════════════════════════════════ */

/* ── NAVBAR SCROLL ── */
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 40);
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.mv-card, .formula-card, .section-head').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = +el.dataset.target;
  const step = target / 60;
  let cur = 0;
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.floor(cur);
    if (cur >= target) clearInterval(t);
  }, 18);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ── HERO CANVAS – rotating math symbols ── */
(function heroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const symbols = ['∑', 'π', '∫', '√', '∞', 'Δ', 'θ', '∂', 'λ', 'α', '≠', '±'];
  const nodes = symbols.map((s, i) => ({
    sym: s,
    angle: (i / symbols.length) * Math.PI * 2,
    r: 120 + (i % 3) * 28,
    speed: 0.004 + (i % 4) * 0.001,
    size: 18 + (i % 3) * 6,
    opacity: 0.35 + Math.random() * 0.4
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // glow center
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
    grad.addColorStop(0, 'rgba(99,102,241,0.22)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.fill();

    // center symbol
    ctx.fillStyle = 'rgba(99,102,241,0.9)';
    ctx.font = "bold 52px 'Playfair Display', serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('∑', cx, cy);

    // orbit rings
    [80, 120, 160].forEach((r, ri) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(99,102,241,${0.08 + ri * 0.03})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // orbiting symbols
    nodes.forEach(n => {
      n.angle += n.speed;
      const x = cx + n.r * Math.cos(n.angle);
      const y = cy + n.r * Math.sin(n.angle);
      ctx.fillStyle = `rgba(129,140,248,${n.opacity})`;
      ctx.font = `bold ${n.size}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.sym, x, y);
    });

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════
   1. ARITHMETIC VISUALIZER
══════════════════════════════════════════ */
function runArithmetic() {
  const a = parseInt(document.getElementById('arith-a').value) || 0;
  const b = parseInt(document.getElementById('arith-b').value) || 0;
  const op = document.getElementById('arith-op').value;
  const vis = document.getElementById('arith-visual');
  const res = document.getElementById('arith-result');

  let result, label;
  if (op === '+') { result = a + b; label = '+'; }
  else if (op === '-') { result = a - b; label = '−'; }
  else if (op === '*') { result = a * b; label = '×'; }
  else { result = b !== 0 ? (a / b).toFixed(4) : 'undefined'; label = '÷'; }

  const maxDots = 20;

  function dotGroup(n, cls = '') {
    const count = Math.min(Math.abs(n), maxDots);
    const div = document.createElement('div');
    div.className = 'dot-group';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = cls;
      s.style.animationDelay = `${i * 0.04}s`;
      div.appendChild(s);
    }
    if (Math.abs(n) > maxDots) {
      const more = document.createElement('span');
      more.style.cssText = 'font-size:0.75rem;color:var(--muted);align-self:center;';
      more.textContent = `+${Math.abs(n) - maxDots}`;
      div.appendChild(more);
    }
    return div;
  }

  function sign(txt) {
    const s = document.createElement('div');
    s.className = 'arith-op-sign';
    s.textContent = txt;
    return s;
  }

  vis.innerHTML = '';
  vis.appendChild(dotGroup(a));
  vis.appendChild(sign(label));
  vis.appendChild(dotGroup(b, 'green'));
  vis.appendChild(sign('='));

  if (op === '*') {
    const rg = dotGroup(Math.min(a * b, maxDots), 'amber');
    vis.appendChild(rg);
  } else if (op !== '/') {
    vis.appendChild(dotGroup(Math.max(0, Number(result)), 'amber'));
  }

  res.textContent = `${a} ${label} ${b} = ${result}`;
  saveToStorage('last_arithmetic', { a, op, b, result });
}

/* ══════════════════════════════════════════
   2. FRACTION VISUALIZER
══════════════════════════════════════════ */
function runFraction() {
  const num = parseInt(document.getElementById('frac-num').value) || 1;
  const den = parseInt(document.getElementById('frac-den').value) || 1;
  const canvas = document.getElementById('fracCanvas');
  const ctx = canvas.getContext('2d');
  const R = 85, cx = 90, cy = 90;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background circle
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(99,102,241,0.1)'; ctx.fill();
  ctx.strokeStyle = 'rgba(99,102,241,0.25)'; ctx.lineWidth = 2; ctx.stroke();

  // filled arc
  const fraction = Math.min(num / den, 1);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(99,102,241,0.75)'; ctx.fill();

  // inner circle label
  ctx.fillStyle = '#f8fafc';
  ctx.font = "bold 18px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`${num}/${den}`, cx, cy);

  const dec = (num / den).toFixed(4);
  const pct = (fraction * 100).toFixed(1);
  document.getElementById('frac-result').innerHTML = `
    <div class="frac-stat"><span class="fkey">Fraction</span><span class="fval">${num}/${den}</span></div>
    <div class="frac-stat"><span class="fkey">Decimal</span><span class="fval">${dec}</span></div>
    <div class="frac-stat"><span class="fkey">Percentage</span><span class="fval">${pct}%</span></div>
    <div class="frac-stat"><span class="fkey">Filled</span><span class="fval">${Math.min(100, pct)}%</span></div>
  `;
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function simplifyFraction() {
  let num = parseInt(document.getElementById('frac-num').value) || 1;
  let den = parseInt(document.getElementById('frac-den').value) || 1;
  const g = gcd(Math.abs(num), Math.abs(den));
  const sn = num / g, sd = den / g;
  document.getElementById('frac-result').innerHTML = `
    <div class="frac-stat"><span class="fkey">Original</span><span class="fval">${num}/${den}</span></div>
    <div class="frac-stat"><span class="fkey">Simplified</span><span class="fval">${sn}/${sd}</span></div>
    <div class="frac-stat"><span class="fkey">GCD</span><span class="fval">${g}</span></div>
  `;
  document.getElementById('frac-num').value = sn;
  document.getElementById('frac-den').value = sd;
  runFraction();
}

/* ══════════════════════════════════════════
   3. NUMBER SYSTEM EXPLORER
══════════════════════════════════════════ */
function exploreNumber() {
  const raw = document.getElementById('ns-input').value.trim();
  const n = parseFloat(raw);
  if (isNaN(n)) {
    document.getElementById('ns-result').innerHTML = '<span class="ns-badge no">Invalid Number</span>';
    return;
  }
  const checks = [
    { label: '🌿 Natural Number (ℕ)',  pass: Number.isInteger(n) && n > 0 },
    { label: '0️⃣ Whole Number',         pass: Number.isInteger(n) && n >= 0 },
    { label: '🔢 Integer (ℤ)',          pass: Number.isInteger(n) },
    { label: '🔣 Rational Number (ℚ)',  pass: isFinite(n) },
    { label: '🌀 Real Number (ℝ)',      pass: isFinite(n) },
    { label: '✨ Positive',             pass: n > 0 },
    { label: '🔄 Negative',            pass: n < 0 },
    { label: '🎯 Perfect Square',       pass: Number.isInteger(n) && Number.isInteger(Math.sqrt(n)) },
    { label: '⚡ Prime',               pass: isPrime(Math.abs(n)) && Number.isInteger(n) },
  ];
  document.getElementById('ns-result').innerHTML =
    checks.map(c => `<span class="ns-badge ${c.pass ? 'yes' : 'no'}">${c.pass ? '✓' : '✗'} ${c.label}</span>`).join('');
}

/* ══════════════════════════════════════════
   4. PRIME LABORATORY
══════════════════════════════════════════ */
function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) if (n % i === 0 || n % (i + 2) === 0) return false;
  return true;
}

function checkPrime() {
  const n = parseInt(document.getElementById('pc-input').value);
  const el = document.getElementById('pc-result');
  if (isNaN(n) || n < 2) { el.textContent = 'Enter a number ≥ 2'; return; }
  el.innerHTML = isPrime(n)
    ? `<span style="color:#10b981">✓ ${n} is a PRIME number</span>`
    : `<span style="color:#f87171">✗ ${n} is NOT prime</span> — factors: ${primeFactors(n).join(' × ')}`;
}

function generatePrimes() {
  const limit = parseInt(document.getElementById('pg-input').value) || 50;
  const primes = [];
  for (let i = 2; i <= Math.min(limit, 500); i++) if (isPrime(i)) primes.push(i);
  document.getElementById('pg-result').innerHTML =
    primes.map(p => `<span class="prime-chip">${p}</span>`).join('');
}

function primeFactors(n) {
  const factors = [];
  let d = 2;
  while (n > 1) {
    while (n % d === 0) { factors.push(d); n = Math.floor(n / d); }
    d++;
    if (d * d > n && n > 1) { factors.push(n); break; }
  }
  return factors;
}

function factorize() {
  const n = parseInt(document.getElementById('pf-input').value);
  const el = document.getElementById('pf-result');
  if (isNaN(n) || n < 2) { el.textContent = 'Enter a number ≥ 2'; return; }
  const factors = primeFactors(n);
  el.innerHTML = buildFactorTree(n, factors);
}

function buildFactorTree(n, factors) {
  if (factors.length === 1) return `<div style="color:var(--amber)">${n} → prime ✓</div>`;
  const lines = [];
  let cur = n;
  for (let i = 0; i < factors.length; i++) {
    const f = factors[i];
    const rest = cur / f;
    lines.push(`${cur} = <span style="color:var(--indigo2)">${f}</span> × ${rest > 1 ? rest : '<span style="color:#10b981">' + f + '</span>'}`);
    cur = rest;
    if (cur <= 1) break;
  }
  lines.push(`Prime factorization: <strong>${factors.join(' × ')}</strong>`);
  return lines.join('<br/>');
}

/* ══════════════════════════════════════════
   5. PERCENTAGE VISUALIZER
══════════════════════════════════════════ */
function calcPercent() {
  const val = parseFloat(document.getElementById('pct-val').value) || 0;
  const total = parseFloat(document.getElementById('pct-total').value) || 1;
  const pct = (val / total * 100).toFixed(2);
  document.getElementById('pct-bar-wrap').innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:4px">
      <span class="mv-label">${val} of ${total}</span>
      <span style="font-family:'JetBrains Mono',monospace;color:var(--amber)">${pct}%</span>
    </div>
    <div class="pct-bar-track"><div class="pct-bar-fill" id="pct-fill" style="width:0%"></div></div>
    <p style="color:var(--muted);font-size:0.82rem;margin-top:6px">${val} is ${pct}% of ${total}</p>
  `;
  setTimeout(() => { document.getElementById('pct-fill').style.width = Math.min(pct, 100) + '%'; }, 50);
}

function calcPL() {
  const cp = parseFloat(document.getElementById('pl-cp').value) || 0;
  const sp = parseFloat(document.getElementById('pl-sp').value) || 0;
  const diff = sp - cp;
  const pct = ((Math.abs(diff) / cp) * 100).toFixed(2);
  const type = diff >= 0 ? 'Profit' : 'Loss';
  const color = diff >= 0 ? '#10b981' : '#f87171';
  document.getElementById('pl-result').innerHTML =
    `<span style="color:${color}">${type} of ₹${Math.abs(diff).toFixed(2)} (${pct}%)</span>`;
}

function calcDiscount() {
  const orig = parseFloat(document.getElementById('disc-orig').value) || 0;
  const pct = parseFloat(document.getElementById('disc-pct').value) || 0;
  const disc = (orig * pct / 100).toFixed(2);
  const final = (orig - disc).toFixed(2);
  document.getElementById('disc-result').innerHTML =
    `Discount: <span>₹${disc}</span> &nbsp;|&nbsp; Final Price: <span style="color:#10b981">₹${final}</span>`;
}

/* ══════════════════════════════════════════
   6. GEOMETRY VISUALIZER
══════════════════════════════════════════ */
function updateGeoInputs() {
  const shape = document.getElementById('geo-shape').value;
  const cont = document.getElementById('geo-inputs');
  const fields = {
    circle:    [['r', 'Radius']],
    square:    [['a', 'Side']],
    rectangle: [['w', 'Width'], ['h', 'Height']],
    triangle:  [['a', 'Side (equilateral)']],
    pentagon:  [['a', 'Side']],
    hexagon:   [['a', 'Side']]
  };
  cont.innerHTML = (fields[shape] || []).map(([id, label]) =>
    `<div class="col"><label class="mv-label">${label}</label><input type="number" id="geo-${id}" class="mv-input" value="100" min="1" max="300"/></div>`
  ).join('');
}

function drawGeo() {
  const shape = document.getElementById('geo-shape').value;
  const canvas = document.getElementById('geoCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;

  ctx.strokeStyle = 'rgba(99,102,241,0.85)';
  ctx.fillStyle   = 'rgba(99,102,241,0.15)';
  ctx.lineWidth   = 2.5;

  let area = 0, perimeter = 0;

  if (shape === 'circle') {
    const r = Math.min(parseFloat(document.getElementById('geo-r').value) || 100, 120);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    area = Math.PI * r * r;
    perimeter = 2 * Math.PI * r;

  } else if (shape === 'square') {
    const a = Math.min(parseFloat(document.getElementById('geo-a').value) || 100, 220);
    ctx.fillRect(cx - a/2, cy - a/2, a, a);
    ctx.strokeRect(cx - a/2, cy - a/2, a, a);
    area = a * a; perimeter = 4 * a;

  } else if (shape === 'rectangle') {
    const w = Math.min(parseFloat(document.getElementById('geo-w').value) || 160, 240);
    const h = Math.min(parseFloat(document.getElementById('geo-h').value) || 100, 200);
    ctx.fillRect(cx - w/2, cy - h/2, w, h);
    ctx.strokeRect(cx - w/2, cy - h/2, w, h);
    area = w * h; perimeter = 2 * (w + h);

  } else if (shape === 'triangle') {
    const a = Math.min(parseFloat(document.getElementById('geo-a').value) || 150, 230);
    const hh = a * Math.sqrt(3) / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh/2);
    ctx.lineTo(cx - a/2, cy + hh/2);
    ctx.lineTo(cx + a/2, cy + hh/2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    area = (Math.sqrt(3)/4) * a * a; perimeter = 3 * a;

  } else {
    const n = shape === 'pentagon' ? 5 : 6;
    const a = Math.min(parseFloat(document.getElementById('geo-a').value) || 100, 110);
    const R_circ = a / (2 * Math.sin(Math.PI / n));
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const ang = (2 * Math.PI * i / n) - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + R_circ * Math.cos(ang), cy + R_circ * Math.sin(ang));
      else ctx.lineTo(cx + R_circ * Math.cos(ang), cy + R_circ * Math.sin(ang));
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    area = (n * a * a) / (4 * Math.tan(Math.PI / n));
    perimeter = n * a;
  }

  document.getElementById('geo-result').innerHTML = `
    <div class="geo-stat"><span class="gkey">Shape</span><span class="gval">${shape.charAt(0).toUpperCase()+shape.slice(1)}</span></div>
    <div class="geo-stat"><span class="gkey">Area</span><span class="gval">${area.toFixed(2)} u²</span></div>
    <div class="geo-stat"><span class="gkey">Perimeter / Circumference</span><span class="gval">${perimeter.toFixed(2)} u</span></div>
  `;
}

// Initialize geo inputs on load
updateGeoInputs();

/* ══════════════════════════════════════════
   7. COORDINATE PLANE
══════════════════════════════════════════ */
const coordPoints = [];

function drawCoordGrid() {
  const canvas = document.getElementById('coordCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const origin = { x: W/2, y: H/2 };
  const scale = 30;

  // Grid
  ctx.strokeStyle = 'rgba(99,102,241,0.1)'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += scale) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y <= H; y += scale) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Axes
  ctx.strokeStyle = 'rgba(99,102,241,0.45)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(W, origin.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, H); ctx.stroke();

  // Labels
  ctx.fillStyle = 'rgba(148,163,184,0.6)';
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  for (let i = -7; i <= 7; i++) {
    if (i !== 0) {
      ctx.fillText(i, origin.x + i * scale, origin.y + 14);
      ctx.fillText(-i, origin.x + 10, origin.y - i * scale);
    }
  }
  ctx.fillStyle = 'rgba(148,163,184,0.8)';
  ctx.fillText('X', W - 10, origin.y - 8);
  ctx.fillText('Y', origin.x + 10, 10);

  // Points
  coordPoints.forEach(p => {
    const px = origin.x + p.x * scale;
    const py = origin.y - p.y * scale;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.stroke();
    // Crosshairs
    ctx.strokeStyle = 'rgba(245,158,11,0.3)'; ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(origin.x, py); ctx.lineTo(px, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, origin.y); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);
    // Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillText(`(${p.x},${p.y})`, px + 10, py - 8);
  });
}

function plotPoint() {
  const x = parseFloat(document.getElementById('coord-x').value) || 0;
  const y = parseFloat(document.getElementById('coord-y').value) || 0;
  coordPoints.push({ x, y });
  drawCoordGrid();
  const list = document.getElementById('coord-points-list');
  list.innerHTML = coordPoints.map(p => `<span class="coord-chip">(${p.x}, ${p.y})</span>`).join('');
}

function clearCoord() {
  coordPoints.length = 0;
  drawCoordGrid();
  document.getElementById('coord-points-list').innerHTML = '';
}

// Draw initial grid
drawCoordGrid();

/* ══════════════════════════════════════════
   8. GRAPH PLOTTER
══════════════════════════════════════════ */
function loadPreset() {
  const val = document.getElementById('graph-preset').value;
  if (val) document.getElementById('graph-eq').value = val;
}

function plotGraph() {
  const expr = document.getElementById('graph-eq').value.trim();
  const canvas = document.getElementById('graphCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W/2, cy = H/2, scaleX = 40, scaleY = 40;

  // Grid
  ctx.strokeStyle = 'rgba(99,102,241,0.1)'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += scaleX) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y <= H; y += scaleY) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Axes
  ctx.strokeStyle = 'rgba(99,102,241,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

  // Axis labels
  ctx.fillStyle = 'rgba(148,163,184,0.7)';
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  for (let i = -7; i <= 7; i++) {
    if (i !== 0) { ctx.fillText(i, cx + i*scaleX, cy+14); ctx.fillText(-i, cx+14, cy - i*scaleY); }
  }

  // Plot curve
  const fn = (x) => {
    try { return Function('x', `"use strict"; return (${expr})`)(x); }
    catch { return NaN; }
  };

  ctx.strokeStyle = 'rgba(245,158,11,0.9)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  let first = true;
  for (let px = 0; px <= W; px++) {
    const x = (px - cx) / scaleX;
    const y = fn(x);
    if (isFinite(y)) {
      const py = cy - y * scaleY;
      if (first) { ctx.moveTo(px, py); first = false; }
      else ctx.lineTo(px, py);
    } else { first = true; }
  }
  ctx.stroke();

  // Equation label
  ctx.fillStyle = 'rgba(245,158,11,0.9)';
  ctx.font = "bold 13px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText(`y = ${expr}`, 10, 20);
}

/* ══════════════════════════════════════════
   9. FORMULA LIBRARY
══════════════════════════════════════════ */
const FORMULAS = [
  { cat: 'arithmetic', name: 'Sum of n Natural Numbers', formula: 'n(n+1)/2', example: 'n=10 → 55' },
  { cat: 'arithmetic', name: 'Sum of n² Natural Numbers', formula: 'n(n+1)(2n+1)/6', example: 'n=5 → 55' },
  { cat: 'arithmetic', name: 'Power Rule', formula: 'aⁿ × aᵐ = aⁿ⁺ᵐ', example: '2³ × 2² = 2⁵ = 32' },
  { cat: 'algebra', name: 'Quadratic Formula', formula: 'x = (−b ± √(b²−4ac)) / 2a', example: 'x²−5x+6=0 → x=2,3' },
  { cat: 'algebra', name: 'AM-GM Inequality', formula: '(a+b)/2 ≥ √(ab)', example: 'a=4,b=9 → 6.5 ≥ 6' },
  { cat: 'algebra', name: 'Binomial Theorem', formula: '(a+b)ⁿ = Σ C(n,k)aⁿ⁻ᵏbᵏ', example: '(1+x)² = 1+2x+x²' },
  { cat: 'algebra', name: 'Difference of Squares', formula: 'a²−b² = (a+b)(a−b)', example: '9−4 = (3+2)(3−2) = 5' },
  { cat: 'geometry', name: 'Area of Circle', formula: 'A = πr²', example: 'r=7 → A≈153.94' },
  { cat: 'geometry', name: 'Circumference of Circle', formula: 'C = 2πr', example: 'r=7 → C≈43.98' },
  { cat: 'geometry', name: 'Area of Triangle', formula: 'A = ½ × b × h', example: 'b=6,h=4 → A=12' },
  { cat: 'geometry', name: "Heron's Formula", formula: 'A = √(s(s−a)(s−b)(s−c))', example: 's = (a+b+c)/2' },
  { cat: 'geometry', name: "Pythagoras' Theorem", formula: 'a² + b² = c²', example: '3²+4²=5²' },
  { cat: 'trigonometry', name: 'Sine Rule', formula: 'a/sinA = b/sinB = c/sinC', example: 'For any triangle' },
  { cat: 'trigonometry', name: 'Cosine Rule', formula: 'c² = a² + b² − 2ab·cosC', example: 'Finds third side' },
  { cat: 'trigonometry', name: 'sin²θ + cos²θ', formula: '= 1', example: 'Pythagorean identity' },
  { cat: 'trigonometry', name: 'tan(θ)', formula: 'sin(θ)/cos(θ)', example: 'tan(45°) = 1' },
  { cat: 'statistics', name: 'Mean', formula: 'x̄ = Σxᵢ / n', example: '(10+20+30)/3 = 20' },
  { cat: 'statistics', name: 'Variance', formula: 'σ² = Σ(xᵢ−x̄)²/n', example: 'Spread of data' },
  { cat: 'statistics', name: 'Standard Deviation', formula: 'σ = √(Σ(xᵢ−x̄)²/n)', example: 'Square root of variance' },
  { cat: 'statistics', name: 'Probability', formula: 'P(E) = n(E)/n(S)', example: 'P(heads) = 1/2' },
];

function renderFormulas(filter = 'all') {
  const grid = document.getElementById('formula-grid');
  const items = filter === 'all' ? FORMULAS : FORMULAS.filter(f => f.cat === filter);
  grid.innerHTML = items.map(f => `
    <div class="col-md-6 col-lg-4">
      <div class="formula-card">
        <div class="f-cat">${f.cat}</div>
        <div class="f-name">${f.name}</div>
        <div class="f-formula">${f.formula}</div>
        <div class="f-example">Example: ${f.example}</div>
      </div>
    </div>
  `).join('');
}

function filterFormulas(cat, btn) {
  document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFormulas(cat);
}

renderFormulas();

/* ══════════════════════════════════════════
   10. QUIZ
══════════════════════════════════════════ */
const QUIZ_DATA = {
  beginner: [
    { q: 'What is 15 + 27?', opts: ['40','42','43','41'], ans: 1 },
    { q: 'What is 9 × 8?', opts: ['63','71','72','74'], ans: 2 },
    { q: '√144 = ?', opts: ['12','11','13','14'], ans: 0 },
    { q: 'What is 100 ÷ 4?', opts: ['24','25','26','30'], ans: 1 },
    { q: 'What is 2⁵?', opts: ['16','32','64','10'], ans: 1 },
    { q: 'LCM of 4 and 6?', opts: ['12','24','6','8'], ans: 0 },
    { q: 'Is 17 prime?', opts: ['Yes','No','Sometimes','Not defined'], ans: 0 },
    { q: '3/4 as a decimal?', opts: ['0.7','0.75','0.8','0.65'], ans: 1 },
    { q: 'Area of square with side 5?', opts: ['20','25','15','10'], ans: 1 },
    { q: 'GCD of 12 and 18?', opts: ['3','6','9','12'], ans: 1 },
  ],
  intermediate: [
    { q: 'Solve: x² − 5x + 6 = 0. Values of x?', opts: ['2,3','1,6','-2,-3','1,5'], ans: 0 },
    { q: 'sin(90°) = ?', opts: ['0','0.5','1','−1'], ans: 2 },
    { q: 'What is 15% of 240?', opts: ['32','36','40','38'], ans: 1 },
    { q: 'Area of circle with r=7? (π≈3.14)', opts: ['153.94','154','148','160'], ans: 0 },
    { q: 'Simplify: 3/9 + 1/3', opts: ['2/3','1/2','4/9','1/3'], ans: 0 },
    { q: 'If a=3,b=4, what is c in a²+b²=c²?', opts: ['5','6','7','8'], ans: 0 },
    { q: '(2x + 3)(x − 1) expanded?', opts: ['2x²+x−3','2x²−x+3','2x²+5x−3','x²+x−3'], ans: 0 },
    { q: 'log₁₀(1000) = ?', opts: ['2','3','4','10'], ans: 1 },
    { q: 'Mean of 2,4,6,8,10?', opts: ['5','6','7','4'], ans: 1 },
    { q: 'Next Fibonacci after 13?', opts: ['20','21','18','22'], ans: 1 },
  ],
  advanced: [
    { q: 'How many prime numbers exist between 1 and 100?', opts: ['22','25','24','26'], ans: 2 },
    { q: 'Sum of first 100 natural numbers?', opts: ['5000','5050','4950','5100'], ans: 1 },
    { q: 'If f(x) = x³ − 3x, find f\'(2)', opts: ['6','9','3','12'], ans: 1 },
    { q: 'Value of e (Euler\'s number) approx?', opts: ['2.512','2.718','2.817','3.141'], ans: 1 },
    { q: 'C(10, 3) = ?', opts: ['90','120','60','720'], ans: 1 },
    { q: 'In a GP 2,4,8,16... what is term 8?', opts: ['128','256','512','64'], ans: 1 },
    { q: 'tan(135°) = ?', opts: ['1','−1','0','√2'], ans: 1 },
    { q: '∫x dx = ?', opts: ['x²/2','x²','2x','x/2'], ans: 0 },
    { q: 'Mode of: 3,5,7,5,3,5,9?', opts: ['3','5','7','9'], ans: 1 },
    { q: 'Variance of 2,4,6,8,10?', opts: ['6','7','8','5'], ans: 2 },
  ]
};

let quizState = { level: 'beginner', idx: 0, score: 0, timer: null, timerSec: 0, questions: [] };

function setQuizLevel(level, btn) {
  quizState.level = level;
  document.querySelectorAll('#quiz-setup .btn-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const hs = loadFromStorage('quiz_hs_' + level);
  document.getElementById('quiz-highscore').innerHTML = hs
    ? `🏆 High Score (${level}): <strong>${hs}/10</strong>` : '';
}

function startQuiz() {
  const qs = [...QUIZ_DATA[quizState.level]].sort(() => Math.random() - 0.5).slice(0, 10);
  quizState = { ...quizState, idx: 0, score: 0, questions: qs };
  document.getElementById('quiz-setup').style.display = 'none';
  document.getElementById('quiz-active').style.display = '';
  document.getElementById('quiz-result').style.display = 'none';
  showQuestion();
}

function showQuestion() {
  if (quizState.idx >= quizState.questions.length) { endQuiz(); return; }
  const q = quizState.questions[quizState.idx];
  const total = quizState.questions.length;

  document.getElementById('quiz-qnum').textContent = `Q ${quizState.idx+1}/${total}`;
  document.getElementById('quiz-progress-bar').style.width = `${(quizState.idx/total)*100}%`;
  document.getElementById('quiz-question').textContent = q.q;

  const opts = document.getElementById('quiz-options');
  opts.innerHTML = q.opts.map((o, i) =>
    `<button class="quiz-opt-btn" onclick="answerQuiz(${i})">${o}</button>`
  ).join('');

  // Timer
  clearInterval(quizState.timer);
  quizState.timerSec = 30;
  const timerEl = document.getElementById('quiz-timer');
  timerEl.textContent = `⏱ 30s`;
  timerEl.classList.remove('danger');

  quizState.timer = setInterval(() => {
    quizState.timerSec--;
    timerEl.textContent = `⏱ ${quizState.timerSec}s`;
    if (quizState.timerSec <= 10) timerEl.classList.add('danger');
    if (quizState.timerSec <= 0) { clearInterval(quizState.timer); autoNext(); }
  }, 1000);
}

function autoNext() {
  const btns = document.querySelectorAll('.quiz-opt-btn');
  const q = quizState.questions[quizState.idx];
  btns.forEach(b => b.disabled = true);
  btns[q.ans].classList.add('correct');
  setTimeout(() => { quizState.idx++; showQuestion(); }, 1200);
}

function answerQuiz(chosen) {
  clearInterval(quizState.timer);
  const q = quizState.questions[quizState.idx];
  const btns = document.querySelectorAll('.quiz-opt-btn');
  btns.forEach(b => b.disabled = true);
  if (chosen === q.ans) {
    btns[chosen].classList.add('correct');
    quizState.score++;
  } else {
    btns[chosen].classList.add('wrong');
    btns[q.ans].classList.add('correct');
  }
  setTimeout(() => { quizState.idx++; showQuestion(); }, 1000);
}

function endQuiz() {
  clearInterval(quizState.timer);
  document.getElementById('quiz-active').style.display = 'none';
  document.getElementById('quiz-result').style.display = '';
  const s = quizState.score, t = quizState.questions.length;
  document.getElementById('quiz-score-display').textContent = `${s}/${t}`;
  const msgs = [['⭐ Amazing!','Perfect score!'], ['🎉 Great!','Really solid.'], ['👍 Good','Keep practicing.'], ['📚 Try again','Review the topics.']];
  const [emoji, msg] = s === t ? msgs[0] : s >= 7 ? msgs[1] : s >= 5 ? msgs[2] : msgs[3];
  document.getElementById('quiz-score-msg').textContent = `${emoji} ${msg}`;
  document.getElementById('quiz-score-detail').textContent = `You scored ${s} out of ${t} on ${quizState.level} level.`;

  const prev = loadFromStorage('quiz_hs_' + quizState.level) || 0;
  if (s > prev) saveToStorage('quiz_hs_' + quizState.level, s);
}

function restartQuiz() {
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-setup').style.display = '';
}

/* ══════════════════════════════════════════
   11. MATH CHALLENGE ARENA
══════════════════════════════════════════ */
let challengeState = { streak: 0, timer: null, answer: 0, timerSec: 30 };

function genChallenge() {
  const types = ['add','sub','mul','pct','sqrt_check'];
  const type = types[Math.floor(Math.random() * types.length)];
  let q, a;
  if (type === 'add') {
    const x = Math.floor(Math.random()*100)+1, y = Math.floor(Math.random()*100)+1;
    q = `${x} + ${y} = ?`; a = x + y;
  } else if (type === 'sub') {
    const x = Math.floor(Math.random()*100)+50, y = Math.floor(Math.random()*50)+1;
    q = `${x} − ${y} = ?`; a = x - y;
  } else if (type === 'mul') {
    const x = Math.floor(Math.random()*12)+2, y = Math.floor(Math.random()*12)+2;
    q = `${x} × ${y} = ?`; a = x * y;
  } else if (type === 'pct') {
    const p = [10,20,25,50][Math.floor(Math.random()*4)];
    const n = Math.floor(Math.random()*20+1)*10;
    q = `What is ${p}% of ${n}?`; a = (p * n) / 100;
  } else {
    const roots = [1,4,9,16,25,36,49,64,81,100,121,144];
    const r2 = roots[Math.floor(Math.random()*roots.length)];
    q = `√${r2} = ?`; a = Math.sqrt(r2);
  }
  return { q, a };
}

function startChallenge() {
  document.getElementById('challenge-idle').style.display = 'none';
  document.getElementById('challenge-active').style.display = '';
  challengeState.streak = 0;
  nextChallenge();
}

function nextChallenge() {
  const { q, a } = genChallenge();
  challengeState.answer = a;
  document.getElementById('ch-question').textContent = q;
  document.getElementById('ch-answer').value = '';
  document.getElementById('challenge-feedback').textContent = '';
  document.getElementById('challenge-feedback').className = 'challenge-feedback mt-3';
  document.getElementById('ch-streak').innerHTML = challengeState.streak > 0
    ? `🔥 Streak: <strong>${challengeState.streak}</strong>` : '';

  clearInterval(challengeState.timer);
  challengeState.timerSec = 30;
  const timerEl = document.getElementById('ch-timer-num');
  const ring = document.getElementById('ch-timer-ring');
  timerEl.textContent = 30;
  ring.classList.remove('danger');

  challengeState.timer = setInterval(() => {
    challengeState.timerSec--;
    timerEl.textContent = challengeState.timerSec;
    if (challengeState.timerSec <= 10) ring.classList.add('danger');
    if (challengeState.timerSec <= 0) {
      clearInterval(challengeState.timer);
      showChFeedback(false, `Time's up! Answer: ${challengeState.answer}`);
    }
  }, 1000);
}

function submitChallenge() {
  clearInterval(challengeState.timer);
  const val = parseFloat(document.getElementById('ch-answer').value);
  const correct = Math.abs(val - challengeState.answer) < 0.01;
  if (correct) {
    challengeState.streak++;
    showChFeedback(true, `✓ Correct! +1 streak`);
  } else {
    challengeState.streak = 0;
    showChFeedback(false, `✗ Wrong. Answer: ${challengeState.answer}`);
  }
}

function showChFeedback(ok, msg) {
  const el = document.getElementById('challenge-feedback');
  el.textContent = msg;
  el.className = 'challenge-feedback mt-3 ' + (ok ? 'correct' : 'wrong');
  setTimeout(nextChallenge, 1500);
}

/* ══════════════════════════════════════════
   12. UNIT CONVERTER
══════════════════════════════════════════ */
const UNIT_MAP = {
  length: { m:1, km:1e-3, cm:100, mm:1000, ft:3.28084, 'in':39.3701, mi:6.2137e-4 },
  weight: { kg:1, g:1000, mg:1e6, lb:2.20462, oz:35.274 },
  time:   { seconds:1, minutes:1/60, hours:1/3600, days:1/86400, weeks:1/604800 },
};

function convertUnit(type) {
  if (type === 'temp') { convertTemp(); return; }
  const pfx = { length: 'len', weight: 'wt', time: 'tm' }[type];
  const val = parseFloat(document.getElementById(`${pfx}-val`).value) || 0;
  const from = document.getElementById(`${pfx}-from`).value;
  const to   = document.getElementById(`${pfx}-to`).value;
  const map  = UNIT_MAP[type];
  const base = val / map[from];
  const res  = base * map[to];
  document.getElementById(`${pfx}-result`).textContent =
    `${val} ${from} = ${res.toFixed(6).replace(/\.?0+$/, '')} ${to}`;
}

function convertTemp() {
  const val  = parseFloat(document.getElementById('tp-val').value) || 0;
  const from = document.getElementById('tp-from').value;
  const to   = document.getElementById('tp-to').value;
  let celsius;
  if (from === '°C') celsius = val;
  else if (from === '°F') celsius = (val - 32) * 5/9;
  else celsius = val - 273.15;
  let result;
  if (to === '°C') result = celsius;
  else if (to === '°F') result = celsius * 9/5 + 32;
  else result = celsius + 273.15;
  document.getElementById('tp-result').textContent =
    `${val} ${from} = ${result.toFixed(4)} ${to}`;
}

/* ══════════════════════════════════════════
   13. MULTIPLICATION TABLE
══════════════════════════════════════════ */
function genTable() {
  const n = parseInt(document.getElementById('mt-num').value) || 1;
  const el = document.getElementById('mt-result');
  el.innerHTML = Array.from({length: 20}, (_, i) => i+1).map(i =>
    `<div class="mt-row">${n} × ${i} = <span class="mt-ans">${n*i}</span></div>`
  ).join('');
}

/* ══════════════════════════════════════════
   14. STATISTICS CALCULATOR
══════════════════════════════════════════ */
function calcStats() {
  const raw = document.getElementById('stat-input').value;
  const nums = raw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  if (nums.length < 2) {
    document.getElementById('stat-result').innerHTML = '<p style="color:var(--muted)">Enter at least 2 numbers.</p>';
    return;
  }
  const sorted = [...nums].sort((a,b) => a-b);
  const mean = nums.reduce((a,b) => a+b, 0) / nums.length;
  const n = nums.length;
  const median = n % 2 === 0
    ? (sorted[n/2-1] + sorted[n/2]) / 2
    : sorted[Math.floor(n/2)];
  const freq = {};
  nums.forEach(x => freq[x] = (freq[x]||0)+1);
  const maxFreq = Math.max(...Object.values(freq));
  const mode = Object.entries(freq).filter(([,v]) => v === maxFreq).map(([k]) => k).join(', ');
  const range = sorted[sorted.length-1] - sorted[0];
  const variance = nums.reduce((s,x) => s + (x-mean)**2, 0) / n;
  const stddev = Math.sqrt(variance);

  const stats = [
    { label: 'Mean', val: mean.toFixed(2) },
    { label: 'Median', val: median.toFixed(2) },
    { label: 'Mode', val: mode },
    { label: 'Range', val: range.toFixed(2) },
    { label: 'Variance', val: variance.toFixed(2) },
    { label: 'Std Dev', val: stddev.toFixed(2) },
    { label: 'Count', val: n },
    { label: 'Sum', val: nums.reduce((a,b)=>a+b,0).toFixed(2) },
  ];

  document.getElementById('stat-result').innerHTML =
    stats.map(s => `<div class="stat-box"><div class="sb-label">${s.label}</div><div class="sb-val">${s.val}</div></div>`).join('');
  saveToStorage('last_stats', { nums, mean, median, mode, range });
}

/* ══════════════════════════════════════════
   LOCAL STORAGE
══════════════════════════════════════════ */
function saveToStorage(key, val) {
  try { localStorage.setItem('mv_' + key, JSON.stringify(val)); } catch(e) {}
}
function loadFromStorage(key) {
  try { const v = localStorage.getItem('mv_' + key); return v ? JSON.parse(v) : null; } catch { return null; }
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
window.addEventListener('load', () => {
  runArithmetic();
  runFraction();
  plotGraph();
  calcPercent();
  drawGeo();
  genTable();
});