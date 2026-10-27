(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const windowLayer = $('#windowLayer');
  const launcher = $('#appLauncher');
  const toastEl = $('#toast');
  let zIndex = 12;
  let toastTimer;

  const savedNotes = () => localStorage.getItem('nexora-notes') || '';
  const savedAccent = () => localStorage.getItem('nexora-accent') || '#a78bfa';
  const appNames = {
    files: ['Archivos', '▰', 'icon-folder'],
    notes: ['Notas', '✎', 'icon-notes'],
    calculator: ['Calculadora', '＋', 'icon-calc'],
    terminal: ['Terminal', '›_', 'icon-terminal'],
    settings: ['Ajustes', '⚙', 'icon-settings'],
    about: ['Acerca de NEXORA', 'N', 'icon-about']
  };

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2300);
  }

  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit', hour12:false});
    const day = now.toLocaleDateString('es-ES', {day:'2-digit'});
    const month = now.toLocaleDateString('es-ES', {month:'short'}).replace('.', '').toUpperCase();
    $('#topClock').textContent = time;
    $('#dockTime').textContent = time;
    $('#dockDate').textContent = `${day} ${month}`;
    $('#dateDay').textContent = day;
    $('#dateMonth').textContent = now.toLocaleDateString('es-ES', {month:'long', year:'numeric'}).toUpperCase();
  }
  updateClock();
  setInterval(updateClock, 1000);

  function appContent(id) {
    if (id === 'files') return `
      <h2>Tu espacio</h2><p class="muted">Este explorador es una demostración local. Puedes abrir las herramientas de NEXORA desde aquí.</p>
      <div class="file-grid">
        <button class="file-tile" data-open="notes"><span>📝</span><b>Mis notas</b></button>
        <button class="file-tile" data-open="settings"><span>🎨</span><b>Personalización</b></button>
        <button class="file-tile" data-open="about"><span>💠</span><b>Sistema</b></button>
        <button class="file-tile" data-action="sample-file"><span>📄</span><b>Bienvenido.txt</b></button>
      </div>`;
    if (id === 'notes') return `
      <h2>Notas rápidas</h2><p class="muted">Tus notas se guardan automáticamente en este navegador.</p>
      <textarea id="noteArea" class="note-area" placeholder="Escribe aquí una idea..."></textarea>
      <div class="button-row"><button class="small-button" data-action="save-note">Guardar nota</button><button class="small-button" data-action="clear-note">Borrar contenido</button></div>`;
    if (id === 'calculator') return `
      <h2>Calculadora</h2><p class="muted">Operaciones básicas para tus cálculos rápidos.</p>
      <div class="calc"><input id="calcDisplay" class="calc-display" value="0" aria-label="Pantalla de calculadora" readonly>
      <div class="calc-grid">
        <button data-calc="clear">AC</button><button data-calc="back">⌫</button><button data-calc="value">(</button><button class="calc-op" data-calc="value">)</button>
        <button data-calc="value">7</button><button data-calc="value">8</button><button data-calc="value">9</button><button class="calc-op" data-calc="value">÷</button>
        <button data-calc="value">4</button><button data-calc="value">5</button><button data-calc="value">6</button><button class="calc-op" data-calc="value">×</button>
        <button data-calc="value">1</button><button data-calc="value">2</button><button data-calc="value">3</button><button class="calc-op" data-calc="value">−</button>
        <button data-calc="value">0</button><button data-calc="value">.</button><button class="calc-eq" data-calc="equals">=</button><button class="calc-op" data-calc="value">+</button>
      </div></div>`;
    if (id === 'terminal') return `
      <h2>Terminal NEXORA</h2><p class="muted">Consola de demostración: los comandos no ejecutan acciones en tu ordenador.</p>
      <div class="terminal-box" id="terminalOutput"><div>NEXORA OS [versión 0.1 preview]</div><div>Escribe <b>help</b> para ver los comandos disponibles.</div></div>
      <form class="terminal-line" id="terminalForm"><span>nexora &gt;</span><input id="terminalInput" autocomplete="off" placeholder="Escribe un comando..." aria-label="Comando"></form>`;
    if (id === 'settings') return `
      <h2>Personaliza tu espacio</h2><p class="muted">Ajusta el aspecto de NEXORA. Los cambios se guardan en este navegador.</p>
      <div class="setting-row"><div><b>Color de acento</b><small>Elige el color principal de la interfaz.</small></div>
        <div class="swatches">
          <button class="swatch" style="background:#a78bfa" data-accent="#a78bfa" aria-label="Violeta" aria-pressed="false"></button>
          <button class="swatch" style="background:#65d7f2" data-accent="#65d7f2" aria-label="Azul" aria-pressed="false"></button>
          <button class="swatch" style="background:#f58bb7" data-accent="#f58bb7" aria-label="Rosa" aria-pressed="false"></button>
          <button class="swatch" style="background:#72e5b4" data-accent="#72e5b4" aria-label="Verde" aria-pressed="false"></button>
          <button class="swatch" style="background:#ffb86b" data-accent="#ffb86b" aria-label="Naranja" aria-pressed="false"></button>
        </div>
      </div>
      <div class="setting-row"><div><b>Brillo del escritorio</b><small>Ajusta la intensidad del fondo.</small></div><input class="range-input" id="brightness" type="range" min="60" max="130" value="100" aria-label="Brillo"></div>
      <div class="setting-row"><div><b>Restablecer ajustes</b><small>Volver al aspecto inicial.</small></div><button class="setting-button" data-action="reset-settings">Restablecer</button></div>`;
    return `<div style="display:flex;align-items:center;gap:15px;margin-bottom:20px"><span class="app-icon icon-about" style="width:58px;height:58px;font-size:25px">N</span><div><h2>NEXORA OS</h2><div style="color:var(--accent);font-size:11px">Versión 0.1 · Preview</div></div></div>
      <p class="muted">Un concepto de escritorio web creado con HTML, CSS y JavaScript. Este proyecto funciona en el navegador y guarda algunas preferencias localmente.</p>
      <div class="setting-row"><div><b>Estado</b><small>Interfaz cargada correctamente.</small></div><span style="color:#72e5b4">● Preparado</span></div>
      <div class="setting-row"><div><b>Aplicaciones incluidas</b><small>Archivos, Notas, Calculadora, Terminal y Ajustes.</small></div></div>
      <p class="muted" style="font-size:10px;margin-top:18px">NEXORA OS es un proyecto independiente y no está afiliado a SerumOS.</p>`;
  }

  function openApp(id) {
    launcher.classList.add('hidden');
    if (id === 'apps') { launcher.classList.toggle('hidden'); return; }
    const existing = $(`[data-window="${id}"]`, windowLayer);
    if (existing) { existing.style.zIndex = ++zIndex; existing.classList.remove('minimized'); return; }
    const info = appNames[id];
    if (!info) return;
    const win = document.createElement('section');
    win.className = 'app-window';
    win.dataset.window = id;
    win.style.zIndex = ++zIndex;
    win.innerHTML = `
      <div class="window-titlebar">
        <span class="window-app-mark ${info[2]}">${info[1]}</span>
        <span class="window-title">${info[0]}</span>
        <div class="window-controls"><button class="minimize" data-window-action="minimize" aria-label="Minimizar">Minimizar</button><button class="maximize" data-window-action="maximize" aria-label="Maximizar">Maximizar</button><button class="close" data-window-action="close" aria-label="Cerrar">Cerrar</button></div>
      </div><div class="window-content">${appContent(id)}</div>`;
    windowLayer.appendChild(win);
    if (id === 'notes') $('#noteArea', win).value = savedNotes();
    if (id === 'settings') syncSettings(win);
    makeDraggable(win);
    win.addEventListener('pointerdown', () => win.style.zIndex = ++zIndex);
  }

  function syncSettings(win) {
    const accent = savedAccent();
    $$('.swatch', win).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.accent === accent)));
  }

  function makeDraggable(win) {
    const bar = $('.window-titlebar', win);
    let startX=0, startY=0, origX=0, origY=0, dragging=false;
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('.window-controls') || win.classList.contains('maximized')) return;
      dragging = true;
      const rect = win.getBoundingClientRect();
      startX=e.clientX; startY=e.clientY; origX=rect.left; origY=rect.top;
      win.style.left=`${rect.left}px`; win.style.top=`${rect.top}px`; win.style.transform='none';
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', e => {
      if (!dragging) return;
      const x=Math.max(0,Math.min(window.innerWidth-win.offsetWidth,origX+e.clientX-startX));
      const y=Math.max(58,Math.min(window.innerHeight-110,origY+e.clientY-startY));
      win.style.left=`${x}px`; win.style.top=`${y}px`;
    });
    bar.addEventListener('pointerup', () => dragging=false);
    bar.addEventListener('pointercancel', () => dragging=false);
  }

  function runTerminal(command, win) {
    const output = $('#terminalOutput', win);
    const line = document.createElement('div');
    line.textContent = `nexora > ${command}`;
    output.appendChild(line);
    const result = document.createElement('div');
    const parts = command.trim().split(/\s+/);
    const cmd = (parts[0] || '').toLowerCase();
    const responses = {
      help: 'Comandos: help, date, time, clear, about, apps, echo [texto]',
      date: new Date().toLocaleDateString('es-ES', {dateStyle:'full'}),
      time: new Date().toLocaleTimeString('es-ES'),
      about: 'NEXORA OS 0.1 Preview — escritorio web.',
      apps: 'Aplicaciones: files, notes, calculator, settings, about.',
      clear: ''
    };
    if (cmd === 'clear') output.innerHTML = '';
    else if (cmd === 'echo') result.textContent = parts.slice(1).join(' ');
    else result.textContent = responses[cmd] || (cmd ? `Comando desconocido: ${cmd}. Escribe help.` : '');
    if (result.textContent) output.appendChild(result);
    output.scrollTop = output.scrollHeight;
  }

  document.addEventListener('click', e => {
    const open = e.target.closest('[data-open]');
    if (open) { openApp(open.dataset.open); return; }
    const closeLauncher = e.target.closest('#closeLauncher');
    if (closeLauncher) { launcher.classList.add('hidden'); return; }
    const windowAction = e.target.closest('[data-window-action]');
    if (windowAction) {
      const win = windowAction.closest('.app-window');
      const action = windowAction.dataset.windowAction;
      if (action === 'close') win.remove();
      if (action === 'minimize') win.classList.toggle('minimized'), win.style.display = win.classList.contains('minimized') ? 'none' : 'flex';
      if (action === 'maximize') {
        win.classList.toggle('maximized');
        if (!win.classList.contains('maximized')) { win.style.left='50%';win.style.top='48%';win.style.transform='translate(-50%,-50%)'; }
      }
      return;
    }
    const action = e.target.closest('[data-action]');
    if (action) {
      const win = action.closest('.app-window');
      if (action.dataset.action === 'save-note') { localStorage.setItem('nexora-notes', $('#noteArea', win).value); toast('Nota guardada en este navegador'); }
      if (action.dataset.action === 'clear-note') { $('#noteArea', win).value=''; localStorage.setItem('nexora-notes',''); toast('Contenido borrado'); }
      if (action.dataset.action === 'sample-file') toast('Bienvenido a NEXORA OS · versión 0.1');
      if (action.dataset.action === 'reset-settings') {
        localStorage.removeItem('nexora-accent'); document.documentElement.style.setProperty('--accent','#a78bfa');
        $('#brightness',win).value=100; $('.desktop').style.filter='none'; syncSettings(win); toast('Ajustes restablecidos');
      }
      return;
    }
    const accent = e.target.closest('[data-accent]');
    if (accent) {
      document.documentElement.style.setProperty('--accent', accent.dataset.accent);
      localStorage.setItem('nexora-accent', accent.dataset.accent);
      syncSettings(accent.closest('.app-window')); toast('Color actualizado'); return;
    }
    const calc = e.target.closest('[data-calc]');
    if (calc) {
      const display = $('#calcDisplay', calc.closest('.app-window'));
      let value = display.value === '0' ? '' : display.value;
      if (calc.dataset.calc === 'clear') display.value='0';
      else if (calc.dataset.calc === 'back') display.value=value.slice(0,-1) || '0';
      else if (calc.dataset.calc === 'value') {
        const map = {'÷':'/','×':'*','−':'-'};
        display.value = value + (map[calc.textContent] || calc.textContent);
      } else if (calc.dataset.calc === 'equals') {
        try {
          const expr = display.value;
          if (!/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('invalid');
          const result = Function(`"use strict"; return (${expr})`)();
          display.value = Number.isFinite(result) ? String(Math.round((result + Number.EPSILON)*1e10)/1e10) : 'Error';
        } catch { display.value='Error'; }
      }
      return;
    }
  });

  $('#homeButton').addEventListener('click', () => launcher.classList.toggle('hidden'));
  $('#dockClock').addEventListener('click', () => toast(new Date().toLocaleDateString('es-ES',{dateStyle:'full'})));
  document.addEventListener('input', e => {
    if (e.target.id === 'noteArea') localStorage.setItem('nexora-notes', e.target.value);
    if (e.target.id === 'brightness') $('.desktop').style.filter = `brightness(${e.target.value}%)`;
  });
  document.addEventListener('submit', e => {
    if (e.target.id === 'terminalForm') {
      e.preventDefault();
      const win = e.target.closest('.app-window');
      runTerminal($('#terminalInput',win).value, win);
      $('#terminalInput',win).value='';
    }
  });
  const accent = savedAccent();
  document.documentElement.style.setProperty('--accent', accent);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') launcher.classList.add('hidden');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); launcher.classList.toggle('hidden'); }
  });
})();