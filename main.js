// Menu mobile
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('main-nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});
nav.addEventListener('click', e => {
  if (e.target.closest('a')) {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }
});

// Destaque vermelho acompanha o card em foco/hover
const cards = document.querySelectorAll('.service-card');
cards.forEach(card => {
  const activate = () => {
    cards.forEach(c => c.classList.toggle('is-active', c === card));
  };
  card.addEventListener('mouseenter', activate);
  card.addEventListener('focusin', activate);
});

// Botão "Saber mais detalhes" já seleciona o serviço no formulário
const serviceSelect = document.getElementById('f-servico');
document.querySelectorAll('[data-service]').forEach(btn => {
  btn.addEventListener('click', () => {
    serviceSelect.value = btn.dataset.service;
    // Pisca o campo depois que a rolagem chega ao formulário
    serviceSelect.classList.remove('is-flash');
    setTimeout(() => serviceSelect.classList.add('is-flash'), 700);
  });
});
serviceSelect.addEventListener('animationend', () => serviceSelect.classList.remove('is-flash'));

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
const animate = (el, frames, options) => REDUCED.matches ? null : el.animate(frames, options);
const EASE = 'cubic-bezier(.2, .7, .2, 1)';

// FAQ: abre e fecha com altura animada
document.querySelectorAll('.faq details').forEach(details => {
  const summary = details.querySelector('summary');
  const body = details.querySelector('p');
  summary.addEventListener('click', e => {
    if (REDUCED.matches) return;
    e.preventDefault();
    if (details.dataset.busy) return;
    details.dataset.busy = '1';
    const closing = details.open;
    if (!closing) details.open = true;
    const h = body.offsetHeight;
    const frames = [
      { height: '0px', opacity: 0, transform: 'translateY(-6px)' },
      { height: h + 'px', opacity: 1, transform: 'none' },
    ];
    const anim = body.animate(closing ? frames.reverse() : frames, { duration: closing ? 220 : 320, easing: EASE });
    body.style.overflow = 'hidden';
    anim.onfinish = () => {
      if (closing) details.open = false;
      body.style.overflow = '';
      delete details.dataset.busy;
    };
  });
});

// Menu marca a seção visível
const navLinks = [...nav.querySelectorAll('a')];
const spy = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    navLinks.forEach(a => {
      if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean).forEach(s => spy.observe(s));

// Obras: perfil de sondagem de cada caso (dados ilustrativos)
const CASES = [
  {
    place: 'São Paulo, SP',
    title: 'Edifício residencial de 22 pavimentos',
    text: 'A argila mole até 12 m e o lençol raso mudaram o projeto: as estacas desceram até 28 m, apoiadas no silte compacto.',
    depth: 35,
    water: 3.2,
    layers: [
      { to: 2.5, type: 'aterro', name: 'Aterro', n: [3, 6] },
      { to: 12, type: 'argila', name: 'Argila siltosa mole', n: [1, 4] },
      { to: 20, type: 'areia', name: 'Areia fina', n: [8, 16] },
      { to: 35, type: 'silte', name: 'Silte arenoso compacto', n: [18, 42] },
    ],
    data: [['12', 'furos SPT'], ['35 m', 'mais profundo'], ['9 dias', 'até o relatório']],
    quote: 'O perfil deixou claro onde apoiar as estacas. Não precisamos de sondagem complementar.',
    author: 'Marina Okada, Horizonte Construtora',
  },
  {
    place: 'Cajamar, SP',
    title: 'Galpão logístico de 40.000 m²',
    text: 'Terreno grande e uniforme. Os 28 furos mostraram solo resistente a partir de 6 m, o que liberou fundação rasa em boa parte do galpão.',
    depth: 18,
    water: 6.5,
    layers: [
      { to: 1.5, type: 'aterro', name: 'Aterro', n: [4, 7] },
      { to: 6, type: 'silte', name: 'Silte argiloso', n: [6, 12] },
      { to: 12, type: 'areia', name: 'Areia média compacta', n: [15, 26] },
      { to: 18, type: 'argila', name: 'Silte arenoso muito compacto', n: [30, 50] },
    ],
    data: [['28', 'furos SPT'], ['18 m', 'mais profundo'], ['7 dias', 'até o relatório']],
    quote: 'A planta de locação veio junto com o relatório. Facilitou muito a vida do projetista.',
    author: 'Ricardo Lemos, Lemos Engenharia',
  },
  {
    place: 'Guarulhos, SP',
    title: 'Ponte sobre córrego urbano',
    text: 'Argila orgânica muito mole perto do córrego. Aos 21 m o SPT parou na rocha, e seguimos com sondagem rotativa para avaliar o gnaisse.',
    depth: 30,
    water: 1.8,
    layers: [
      { to: 4, type: 'areia', name: 'Areia argilosa', n: [4, 8] },
      { to: 12, type: 'argila', name: 'Argila orgânica', n: [0, 2] },
      { to: 21, type: 'silte', name: 'Areia grossa com pedregulhos', n: [14, 35] },
      { to: 30, type: 'rocha', name: 'Rocha (gnaisse), rotativa', n: null },
    ],
    data: [['6', 'furos mistos'], ['30 m', 'mais profundo'], ['21 m', 'início da rotativa']],
    quote: 'Percussão e rotativa com a mesma equipe economizaram uma mobilização inteira.',
    author: 'Paula Antunes, Consórcio Via Leste',
  },
];

const fmt = n => n.toLocaleString('pt-BR');
const $id = id => document.getElementById(id);

// Gerador simples e determinístico para os valores de N_SPT
function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function renderCase(index, first = false) {
  const c = CASES[index];
  const rand = rng(index + 7);
  const pct = m => `${(m / c.depth) * 100}%`;
  let html = '<div class="log-scale">';
  for (let m = 0; m <= c.depth; m += 5) html += `<span style="top:${pct(m)}">${m}</span>`;
  html += '</div><div class="log-profile">';
  let from = 0;
  for (const l of c.layers) {
    html += `<span class="layer ${l.type}" style="top:${pct(from)};height:${pct(l.to - from)}"></span>`;
    from = l.to;
  }
  html += '</div><div class="log-spt">';
  from = 0;
  for (const l of c.layers) {
    if (!l.n) {
      html += `<span class="spt-rock" style="top:${pct(from)};height:${pct(l.to - from)}">rotativa</span>`;
    } else {
      for (let m = Math.ceil(from); m < l.to; m++) {
        const t = (m - from) / Math.max(l.to - from, 1);
        const n = Math.round(l.n[0] + (l.n[1] - l.n[0]) * (0.55 * t + 0.45 * rand()));
        html += `<span class="spt" style="top:${pct(m + 0.5)};--n:${Math.min(n, 50) / 50};--d:${((m / c.depth) * 0.5).toFixed(2)}s"><i>${n}</i></span>`;
      }
    }
    from = l.to;
  }
  html += `</div><span class="log-water" style="top:${pct(c.water)}"><em>NA ${fmt(c.water)} m</em></span>`;
  $id('log-body').innerHTML = html;
  $id('log-body').style.setProperty('--rows', c.depth);

  from = 0;
  $id('case-legend').innerHTML = c.layers.map(l => {
    const li = `<li><span class="swatch ${l.type}"></span>${fmt(from)}–${fmt(l.to)} m <b>${l.name}</b></li>`;
    from = l.to;
    return li;
  }).join('');
  $id('log-caption').textContent = `Perfil até ${c.depth} m: ` + c.layers.map(l => l.name).join(', ') + `. Nível d'água a ${fmt(c.water)} m.`;
  $id('case-place').textContent = c.place;
  $id('case-title').textContent = c.title;
  $id('case-text').textContent = c.text;
  $id('case-data').innerHTML = c.data.map(([v, k]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $id('case-quote').innerHTML = `<p>“${c.quote}”</p><cite>${c.author}</cite>`;

  // Na primeira vez o perfil fica escondido até a seção entrar na tela
  if (first) $id('log-body').querySelectorAll('.spt').forEach(b => b.classList.add('is-hidden'));
  else playLog(true);
}

// Perfil "perfura" de cima para baixo, barras crescem em sequência
// e a linha do nível d'água se desenha
function playLog(withInfo) {
  const body = $id('log-body');
  const bars = body.querySelectorAll('.spt');
  bars.forEach(b => b.classList.add('is-hidden'));
  requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach(b => b.classList.remove('is-hidden'))));
  animate(body.querySelector('.log-profile'), [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 700, easing: EASE });
  animate(body.querySelector('.log-water'), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 500, delay: 450, easing: EASE, fill: 'backwards' });
  if (withInfo) {
    animate(document.querySelector('.case-info'), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EASE });
  }
}

const tabs = [...document.querySelectorAll('.case-list [role="tab"]')];
function selectTab(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  });
  renderCase(+tab.dataset.case);
  moveMarker(tab);
}

// Quadrado vermelho desliza até a obra selecionada
const marker = document.createElement('span');
marker.className = 'case-marker';
marker.setAttribute('aria-hidden', 'true');
document.querySelector('.case-list').append(marker);
function moveMarker(tab) {
  marker.style.transform = `translateY(${tab.offsetTop + tab.offsetHeight / 2 - 4}px)`;
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', e => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = tabs[(i + step + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });
});
renderCase(0, true);
moveMarker(tabs[0]);
addEventListener('resize', () => moveMarker(tabs.find(t => t.tabIndex === 0)));
document.fonts.ready.then(() => moveMarker(tabs.find(t => t.tabIndex === 0)));

// Estimativa mínima de furos pela NBR 8036
const area = $id('f-area');
const estimate = $id('estimate');
function minimumBorings(m2) {
  if (m2 <= 200) return 2;
  if (m2 <= 400) return 3;
  if (m2 <= 1200) return Math.ceil(m2 / 200);
  if (m2 <= 2400) return 6 + Math.ceil((m2 - 1200) / 400);
  return null;
}
let lastEstimate;
area.addEventListener('input', () => {
  const m2 = parseFloat(area.value);
  if (!m2 || m2 <= 0) { estimate.textContent = ''; lastEstimate = undefined; return; }
  const n = minimumBorings(m2);
  estimate.innerHTML = n
    ? `Pela NBR 8036, pelo menos <strong>${n} furos</strong>.`
    : 'Acima de 2.400 m², a quantidade de furos é definida com o projeto.';
  // Número "salta" só quando muda
  if (n && n !== lastEstimate) estimate.querySelector('strong').classList.add('is-pop');
  lastEstimate = n;
});

// Formulário: valida e abre o e-mail com a mensagem pronta
const form = $id('quote-form');
const status = $id('form-status');
form.addEventListener('submit', e => {
  e.preventDefault();
  form.classList.add('was-validated');
  const invalid = form.querySelector(':invalid');
  if (invalid) {
    form.querySelectorAll(':invalid').forEach(field => animate(field, [
      { transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(4px)' },
      { transform: 'translateX(-2px)' }, { transform: 'translateX(0)' },
    ], { duration: 360, easing: 'ease-out' }));
    invalid.focus();
    status.textContent = 'Faltou preencher algum campo.';
    status.className = 'form-status is-error';
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  const lines = [
    `Nome: ${data.nome}`,
    `Contato: ${data.contato}`,
    `Cidade: ${data.cidade}`,
    `Serviço: ${data.servico || 'Ainda não sei'}`,
    data.area && `Área construída: ${data.area} m²`,
    data.mensagem && `\n${data.mensagem}`,
  ].filter(Boolean);
  const subject = `Orçamento de sondagem em ${data.cidade}`;
  location.href = `mailto:contato@afssondagens.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  status.textContent = 'Abrimos seu e-mail com o pedido pronto. É só enviar.';
  status.className = 'form-status is-success';
  animate(status, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: EASE });
});

// Conteúdo aparece conforme a rolagem
const REVEAL = {
  up: [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }],
  fade: [{ opacity: 0 }, { opacity: 1 }],
  wipe: [
    { opacity: 0, transform: 'translateY(18px)', clipPath: 'inset(0 0 100% 0)' },
    { opacity: 1, transform: 'none', clipPath: 'inset(0 0 -20% 0)' },
  ],
  curtain: [{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }],
};
const DURATION = { up: 800, fade: 900, wipe: 900, curtain: 1100 };

function revealDelay(el) {
  if (el.dataset.delay) return +el.dataset.delay;
  const group = el.parentElement.closest('[data-reveal-stagger]');
  if (!group) return 0;
  return [...group.querySelectorAll('[data-reveal]')].indexOf(el) * 90;
}

function reveal(el) {
  el.classList.add('is-in');
  if (REDUCED.matches) return;
  const kind = el.dataset.reveal || 'up';
  const delay = revealDelay(el);
  const anims = [];
  if (kind === 'row') {
    // Linha tracejada se desenha e o conteúdo da linha sobe logo depois
    anims.push(el.animate([{ backgroundSize: '0% 1px' }, { backgroundSize: '100% 1px' }], { duration: 800, delay, easing: EASE, fill: 'backwards' }));
    [...el.children].forEach((child, i) => anims.push(child.animate(REVEAL.up, { duration: 700, delay: delay + 150 + i * 60, easing: EASE, fill: 'backwards' })));
  } else {
    anims.push(el.animate(REVEAL[kind], { duration: DURATION[kind], delay, easing: EASE, fill: 'backwards' }));
  }
  // Segurança: se o navegador não chegar a iniciar a animação (aba em segundo
  // plano, por exemplo), cancela para o conteúdo não ficar invisível
  setTimeout(() => anims.forEach(a => a.pending && a.cancel()), delay + 2000);
  if (el.id === 'case-panel') setTimeout(() => playLog(false), delay + 200);
}

const pending = new Set(document.querySelectorAll('[data-reveal]'));
const revealer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    revealer.unobserve(entry.target);
    pending.delete(entry.target);
    reveal(entry.target);
  }
}, { rootMargin: '0px 0px -10% 0px' });
pending.forEach(el => revealer.observe(el));

// Rolagem rápida ou clique no menu pode pular seções inteiras: o que ficou
// acima da tela aparece direto, sem animação
let sweeping = false;
addEventListener('scroll', () => {
  if (sweeping || !pending.size) return;
  sweeping = true;
  requestAnimationFrame(() => {
    sweeping = false;
    for (const el of pending) {
      if (el.getBoundingClientRect().bottom > 0) continue;
      revealer.unobserve(el);
      pending.delete(el);
      el.classList.add('is-in');
      if (el.id === 'case-panel') playLog(false);
    }
  });
}, { passive: true });
