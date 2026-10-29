// Trilha que percorre a página: o quadrado vermelho anda pelos trechos
// conforme a rolagem, deixando a linha vermelha para trás e o tracejado à frente.
// Os trechos são separados de propósito, para não passar por cima do conteúdo;
// entre um trecho e outro o quadrado salta para o início do próximo.
(() => {
  const DESKTOP = window.matchMedia('(min-width: 1025px)');
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ANCHOR = 0.6;           // posição do quadrado na viewport (fração da altura)
  const HORIZONTAL_COST = 0.15; // rolagem gasta por px de trecho horizontal

  const NS = 'http://www.w3.org/2000/svg';
  const layer = document.createElement('div');
  layer.className = 'scroll-trace';
  layer.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(NS, 'svg');
  const square = document.createElementNS(NS, 'rect');
  square.setAttribute('class', 'trace-square');
  square.setAttribute('width', 14);
  square.setAttribute('height', 14);
  svg.append(square);
  layer.append(svg);
  document.body.append(layer);

  const $ = s => document.querySelector(s);
  const box = el => {
    const r = el.getBoundingClientRect();
    return { left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY, bottom: r.bottom + scrollY };
  };

  let pieces = [], steps = [], totalCost = 0, startY = 0;
  let current = 0, target = 0, ticking = false;

  // Trechos do design, medidos a partir do layout real
  function measure() {
    const heroTrace = box($('.hero-trace'));
    const introInner = box($('.intro-inner'));
    const btn = box($('.intro .btn'));
    const saibaMais = box($('.services-text .arrow-link'));
    const services = box($('.services'));
    const x0 = heroTrace.left + 7;
    const xRight = btn.right - 0.5;
    const xLeft = introInner.left + 0.5;
    const yLine = introInner.top + 200;
    return [
      // Hero: desce do "Confira mais"
      [[x0, heroTrace.top], [x0, heroTrace.bottom]],
      // Intro: sai de baixo do botão, corre para a esquerda e desce
      [[xRight, btn.bottom + 40], [xRight, yLine], [xLeft, yLine], [xLeft, yLine + 154]],
      // Serviços: desce reto do "Saiba mais" e termina logo após o fim da seção
      [[xLeft, saibaMais.bottom + 40], [xLeft, services.bottom + 34]],
    ];
  }

  function build() {
    pieces.forEach(p => { p.dashed.remove(); p.solid.remove(); });
    pieces = measure().map(points => {
      const dashed = document.createElementNS(NS, 'path');
      const solid = document.createElementNS(NS, 'path');
      dashed.setAttribute('class', 'trace-dashed');
      solid.setAttribute('class', 'trace-solid');
      const d = 'M' + points.map(p => p.join(' ')).join(' L');
      dashed.setAttribute('d', d);
      solid.setAttribute('d', d);
      svg.insertBefore(dashed, square);
      svg.insertBefore(solid, square);
      return { points, dashed, solid, length: 0 };
    });

    // Linha do tempo: segmentos de cada trecho + intervalos (gap) entre trechos.
    // Verticais custam menos que 1:1 para compensar os horizontais e manter
    // o quadrado perto da âncora na tela.
    steps = [];
    let vertical = 0, horizontalCost = 0;
    pieces.forEach((piece, i) => {
      if (i > 0) {
        const prev = pieces[i - 1].points.at(-1);
        const gap = piece.points[0][1] - prev[1];
        steps.push({ gap: true, piece, from: prev, length: gap });
        vertical += gap;
      }
      let offset = 0;
      for (let j = 1; j < piece.points.length; j++) {
        const [ax, ay] = piece.points[j - 1], [bx, by] = piece.points[j];
        const length = Math.hypot(bx - ax, by - ay);
        const isVertical = ax === bx;
        steps.push({ piece, ax, ay, bx, by, length, offset, isVertical });
        offset += length;
        if (isVertical) vertical += length; else horizontalCost += length * HORIZONTAL_COST;
      }
      piece.length = offset;
      piece.solid.style.strokeDasharray = offset;
    });
    const k = Math.max(0.4, (vertical - horizontalCost) / vertical);
    totalCost = 0;
    for (const s of steps) {
      s.cost = s.gap || s.isVertical ? s.length * k : s.length * HORIZONTAL_COST;
      totalCost += s.cost;
    }
    startY = pieces[0].points[0][1];

    const doc = document.documentElement;
    svg.setAttribute('width', doc.clientWidth);
    svg.setAttribute('height', doc.scrollHeight);

    target = progressFromScroll();
    current = target;
    render();
  }

  function progressFromScroll() {
    return Math.min(Math.max(scrollY + innerHeight * ANCHOR - startY, 0), totalCost);
  }

  function render() {
    const filled = new Map(pieces.map(p => [p, 0]));
    let spent = 0, x = 0, y = 0, visible = true, placed = false;
    for (const s of steps) {
      const f = Math.min(Math.max((current - spent) / s.cost, 0), 1);
      if (!s.gap) filled.set(s.piece, filled.get(s.piece) + s.length * f);
      if (!placed && (f < 1 || s === steps.at(-1))) {
        placed = true;
        if (s.gap) {
          // Espera no fim do trecho anterior, salta na metade do intervalo
          // e espera no início do próximo; some só durante o salto.
          [x, y] = f < 0.5 ? s.from : s.piece.points[0];
          visible = Math.abs(f - 0.5) > 0.06;
        } else {
          x = s.ax + (s.bx - s.ax) * f;
          y = s.ay + (s.by - s.ay) * f;
        }
      }
      spent += s.cost;
    }
    for (const p of pieces) p.solid.style.strokeDashoffset = p.length - filled.get(p);
    square.setAttribute('x', x - 7);
    square.setAttribute('y', y - 7);
    square.style.opacity = visible ? 1 : 0;
  }

  function tick() {
    const diff = target - current;
    current = REDUCED.matches || Math.abs(diff) < 0.5 ? target : current + diff * 0.18;
    render();
    ticking = current !== target;
    if (ticking) requestAnimationFrame(tick);
  }

  function onScroll() {
    if (!DESKTOP.matches) return;
    target = progressFromScroll();
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }

  function setup() {
    document.documentElement.classList.toggle('has-trace', DESKTOP.matches);
    if (DESKTOP.matches) build();
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', setup);
  DESKTOP.addEventListener('change', setup);
  document.fonts.ready.then(setup);
  addEventListener('load', setup);
  setup();
})();
