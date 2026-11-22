const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const crosswordWords = [
  { answer: 'MEMORIADEMASSA', label: 'Memória de massa', clue: 'Armazeno grandes quantidades de informações por longos períodos.', hints: ['Armazeno grandes quantidades de informações por longos períodos.', 'Guardo seus documentos, fotos, vídeos e programas.', 'Preservo informações mesmo quando o computador está desligado.'] },
  { answer: 'MICROCONTROLADOR', label: 'Microcontrolador', clue: 'Controlo sistemas eletrônicos por meio de instruções programadas.', hints: ['Controlo sistemas eletrônicos por meio de instruções programadas.', 'Posso controlar sensores, motores e equipamentos automatizados.', 'Reúno processamento, memória e periféricos em um único chip.'] },
  { answer: 'ADDRESSBUS', label: 'Address bus', clue: 'Indico a localização onde uma informação deve ser acessada.', hints: ['Indico a localização onde uma informação deve ser acessada.', 'Aponto o endereço antes que uma informação seja buscada.', 'Transporto endereços entre os componentes do computador.'] },
  { answer: 'DATABUS', label: 'Data bus', clue: 'Transporto informações entre os componentes do computador.', hints: ['Transporto informações entre os componentes do computador.', 'Levo os dados solicitados até o processador.', 'Minha largura determina quantos bits podem ser transferidos simultaneamente em uma interface paralela.'] },
  { answer: 'QUADCORE', label: 'Quad core', clue: 'Permito executar tarefas simultaneamente utilizando quatro núcleos.', hints: ['Permito executar tarefas simultaneamente utilizando quatro núcleos.', 'Ajudo o computador a dividir diferentes tarefas entre unidades de processamento.', 'Possuo quatro núcleos integrados em um único processador.'] },
  { answer: 'EEPROM', label: 'EEPROM', clue: 'Armazeno informações que podem ser modificadas eletricamente.', hints: ['Armazeno informações que podem ser modificadas eletricamente.', 'Guardo configurações que permanecem salvas mesmo após desligar um equipamento.', 'Sou uma memória não volátil que permite apagar e regravar dados eletricamente.'] },
  { answer: 'CACHE', label: 'Cache', clue: 'Armazeno temporariamente informações para acelerar o processamento.', hints: ['Armazeno temporariamente informações para acelerar o processamento.', 'Facilito o acesso a informações utilizadas frequentemente pelo processador.', 'Sou pequena, rápida e geralmente integrada ao processador.'] },
  { answer: 'DMA', label: 'DMA', clue: 'Permito transferências de dados sem controle contínuo do processador.', hints: ['Permito transferências de dados sem controle contínuo do processador.', 'Ajudo dispositivos a transferirem informações enquanto a CPU realiza outras tarefas.', 'Realizo transferências diretamente entre periféricos e memória principal.'] },
  { answer: 'RAM', label: 'RAM', clue: 'Armazeno temporariamente os dados e programas em execução.', hints: ['Armazeno temporariamente os dados e programas em execução.', 'Ajudo a manter vários programas abertos simultaneamente.', 'Sou volátil e perco informações quando fico sem energia.'] },
  { answer: 'ROM', label: 'ROM', clue: 'Armazeno instruções e informações que precisam permanecer disponíveis.', hints: ['Armazeno instruções e informações que precisam permanecer disponíveis.', 'Conservo informações essenciais mesmo após desligar o equipamento.', 'Sou uma memória não volátil tradicionalmente utilizada para armazenar instruções permanentes.'] },
  { answer: 'ULA', label: 'ULA', clue: 'Realizo operações matemáticas e lógicas durante o processamento.', hints: ['Realizo operações matemáticas e lógicas durante o processamento.', 'Sou responsável por calcular resultados e comparar valores.', 'Executo operações como adição, subtração, AND e OR.'] },
  { answer: 'UC', label: 'UC', clue: 'Coordeno as operações realizadas pelos componentes do processador.', hints: ['Coordeno as operações realizadas pelos componentes do processador.', 'Organizo as etapas necessárias para executar uma instrução.', 'Interpreto instruções e envio sinais de controle aos demais componentes.'] }
];

function canPlace(word, row, col, direction, grid) {
  const dr = direction === 'down' ? 1 : 0, dc = direction === 'across' ? 1 : 0;
  let crossings = 0;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i, c = col + dc * i;
    if (r < 1 || c < 1 || r >= 39 || c >= 39) return false;
    const existing = grid[`${r},${c}`];
    if (existing && existing.letter !== word[i]) return false;
    if (existing) crossings++;
    if (!existing) {
      const sides = direction === 'across' ? [[r - 1, c], [r + 1, c]] : [[r, c - 1], [r, c + 1]];
      if (sides.some(([sr, sc]) => grid[`${sr},${sc}`])) return false;
    }
  }
  const before = grid[`${row - dr},${col - dc}`], after = grid[`${row + dr * word.length},${col + dc * word.length}`];
  return !before && !after && crossings > 0;
}

function buildCrossword() {
  const placements = [], grid = {};
  const ordered = [...crosswordWords].sort((a, b) => b.answer.length - a.answer.length);
  const put = (item, row, col, direction) => {
    item.row = row; item.col = col; item.direction = direction; placements.push(item);
    [...item.answer].forEach((letter, i) => { const r = row + (direction === 'down' ? i : 0), c = col + (direction === 'across' ? i : 0); grid[`${r},${c}`] = { letter, item }; });
  };
  put(ordered[0], 20, 8, 'across');
  function search(index) {
    if (index === ordered.length) return true;
    const item = ordered[index], candidates = [];
    for (const key in grid) {
      const [r, c] = key.split(',').map(Number);
      [...item.answer].forEach((letter, i) => {
        if (grid[key].letter !== letter) return;
        for (const direction of ['across', 'down']) {
          const row = r - (direction === 'down' ? i : 0), col = c - (direction === 'across' ? i : 0);
          if (canPlace(item.answer, row, col, direction, grid)) candidates.push({ row, col, direction });
        }
      });
    }
    candidates.sort((a, b) => (Math.abs(a.row - 20) + Math.abs(a.col - 8)) - (Math.abs(b.row - 20) + Math.abs(b.col - 8)));
    for (const candidate of candidates.slice(0, 80)) {
      put(item, candidate.row, candidate.col, candidate.direction);
      if (search(index + 1)) return true;
      placements.pop();
      [...item.answer].forEach((_, i) => { const r = candidate.row + (candidate.direction === 'down' ? i : 0), c = candidate.col + (candidate.direction === 'across' ? i : 0); const key = `${r},${c}`; if (grid[key]?.item === item) delete grid[key]; });
    }
    return false;
  }
  if (!search(1)) console.warn('Não foi possível posicionar todas as palavras.');
  return { placements, grid };
}

const crossword = buildCrossword();
let crosswordAttempts = 0;
const crosswordMaxAttempts = 3;
let crosswordFinished = false;
function renderCrossword() {
  const board = $('#crossword-board'), rows = crossword.placements.flatMap(p => [p.row, p.row + (p.direction === 'down' ? p.answer.length - 1 : 0)]), cols = crossword.placements.flatMap(p => [p.col, p.col + (p.direction === 'across' ? p.answer.length - 1 : 0)]);
  const minRow = Math.min(...rows), minCol = Math.min(...cols), maxRow = Math.max(...rows), maxCol = Math.max(...cols), cells = {};
  crossword.placements.forEach((p, pi) => [...p.answer].forEach((letter, i) => { const r = p.row + (p.direction === 'down' ? i : 0), c = p.col + (p.direction === 'across' ? i : 0); cells[`${r},${c}`] = { letter, words: [...(cells[`${r},${c}`]?.words || []), pi] }; }));
  board.style.setProperty('--cols', maxCol - minCol + 1);
  board.innerHTML = '';
  for (let r = minRow; r <= maxRow; r++) for (let c = minCol; c <= maxCol; c++) { const cell = cells[`${r},${c}`], el = document.createElement('div'); el.className = `cross-cell ${cell ? '' : 'block'}`; if (cell) { const input = document.createElement('input'); input.maxLength = 1; input.dataset.cell = `${r},${c}`; input.setAttribute('aria-label', 'letra da cruzadinha'); input.addEventListener('input', e => { e.target.value = e.target.value.replace(/[^a-z]/gi, '').toUpperCase(); }); el.append(input); const starts = crossword.placements.findIndex(p => p.row === r && p.col === c); if (starts >= 0) { const n = document.createElement('span'); n.className = 'cell-number'; n.textContent = starts + 1; el.append(n); } } board.append(el); }
  ['across', 'down'].forEach(direction => { const list = $(`#${direction === 'across' ? 'across' : 'down'}-clues`); list.innerHTML = ''; crossword.placements.filter(p => p.direction === direction).forEach(p => { const li = document.createElement('li'); li.textContent = `#${crossword.placements.indexOf(p) + 1} ${p.clue}`; list.append(li); }); });
}
function checkCrossword() {
  if (crosswordFinished || crosswordAttempts >= crosswordMaxAttempts) return;
  crosswordAttempts++;
  let score = 0, wrongWords = [];
  crossword.placements.forEach(p => {
    const inputs = [...$$('input', $('#crossword-board'))].filter(input => input.dataset.cell && [...p.answer].some((_, i) => input.dataset.cell === `${p.row + (p.direction === 'down' ? i : 0)},${p.col + (p.direction === 'across' ? i : 0)}`));
    const right = inputs.length === p.answer.length && inputs.every((input, i) => input.value === p.answer[i]);
    inputs.forEach(input => { input.parentElement.classList.toggle('correct', right); input.parentElement.classList.toggle('wrong', !right); });
    if (right) score++; else wrongWords.push(`#${crossword.placements.indexOf(p) + 1}`);
  });
  $('#crossword-score').textContent = `ACERTOS: ${score}/${crossword.placements.length}`;
  $('#crossword-chances').innerHTML = `${crosswordMaxAttempts - crosswordAttempts} <small>/ ${crosswordMaxAttempts}</small>`;
  if (score === crossword.placements.length) { crosswordFinished = true; $('#crossword-feedback').className = 'feedback success'; $('#crossword-feedback').textContent = 'MAPA COMPLETO! Todas as palavras estão corretas.'; }
  else if (crosswordAttempts >= crosswordMaxAttempts) { crosswordFinished = true; $('#crossword-feedback').className = 'feedback error'; $('#crossword-feedback').textContent = `FIM DAS CHANCES. Revise as palavras ${wrongWords.join(', ')} e reinicie.`; }
  else { $('#crossword-feedback').className = 'feedback error'; $('#crossword-feedback').textContent = `ERRO: ${wrongWords.length} palavra(s) incorreta(s) ${wrongWords.join(', ')}. Ainda restam ${crosswordMaxAttempts - crosswordAttempts} chances.`; }
}
function resetCrossword() { $$('input', $('#crossword-board')).forEach(input => { input.value = ''; input.parentElement.classList.remove('correct', 'wrong'); }); crosswordAttempts = 0; crosswordFinished = false; $('#crossword-score').textContent = `ACERTOS: 0/${crossword.placements.length}`; $('#crossword-chances').innerHTML = `${crosswordMaxAttempts} <small>/ ${crosswordMaxAttempts}</small>`; $('#crossword-feedback').className = 'feedback'; $('#crossword-feedback').textContent = ''; }

const termoWords = ['RAM', 'ROM', 'CPU', 'ULA', 'DMA', 'UC']; let termoGuess = '', termoRow = 0, termoTarget = 'RAM', termoFinished = false;
function renderTermo() { const board = $('#termo-board'); board.innerHTML = ''; for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { const cell = document.createElement('div'); cell.className = 'termo-cell'; const guess = termoHistory[r]?.word; cell.textContent = r < termoRow ? (guess?.[c] || '') : r === termoRow ? (termoGuess[c] || '') : ''; if (r < termoHistory.length) cell.classList.add(termoHistory[r].status[c]); board.append(cell); } }
let termoHistory = [];
function submitTermo() {
  if (termoFinished) return;
  if (termoGuess.length !== 3) { $('#termo-message').className = 'result-message error'; $('#termo-message').textContent = 'ERRO: digite exatamente 3 letras antes de enviar.'; return; }
  const guess = termoGuess;
  if (!termoWords.includes(guess)) { $('#termo-message').className = 'result-message error'; $('#termo-message').textContent = `ERRO: ${guess} não é um termo disponível. Tente RAM, ROM, CPU, ULA, DMA ou UC.`; return; }
  const status = [...guess].map((letter, i) => letter === termoTarget[i] ? 'hit' : termoTarget.includes(letter) ? 'near' : 'miss');
  termoHistory.push({ word: guess, status }); termoRow++; termoGuess = '';
  $('#termo-attempts').innerHTML = `${6 - termoRow} <small>/ 6</small>`;
  if (guess === termoTarget) { termoFinished = true; $('#termo-message').className = 'result-message success'; $('#termo-message').textContent = 'ACERTO! Sistema desbloqueado. Você encontrou o termo secreto.'; }
  else if (termoRow === 6) { termoFinished = true; $('#termo-message').className = 'result-message error'; $('#termo-message').textContent = `FIM DAS CHANCES. A resposta era ${termoTarget}. Clique em NOVO RUN para tentar novamente.`; }
  else { $('#termo-message').className = 'result-message error'; $('#termo-message').textContent = `ERRO: ${guess} não é a resposta. Você ainda tem ${6 - termoRow} chance(s).`; }
  renderTermo();
}
function resetTermo() { termoGuess = ''; termoRow = 0; termoHistory = []; termoFinished = false; $('#termo-message').className = 'result-message'; $('#termo-message').textContent = ''; $('#termo-attempts').innerHTML = '6 <small>/ 6</small>'; renderTermo(); }
function setupTermo() { const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); $('#keypad').innerHTML = keys.map(k => `<button class="key" data-key="${k}">${k}</button>`).join('') + '<button class="key" data-key="⌫">⌫</button>'; $('#keypad').addEventListener('click', e => { const key = e.target.dataset.key; if (!key) return; if (key === '⌫') termoGuess = termoGuess.slice(0, -1); else if (termoGuess.length < 3) termoGuess += key; renderTermo(); }); renderTermo(); }

const sortData = [{ name: 'MEMÓRIAS', hint: 'Guardam dados e instruções.', terms: ['RAM', 'ROM', 'EEPROM', 'FLASH'] }, { name: 'PROCESSAMENTO', hint: 'Executam ou coordenam instruções.', terms: ['CPU', 'ULA', 'UC', 'MICROCONTROLADOR'] }, { name: 'COMUNICAÇÃO', hint: 'Transportam endereços, dados ou controle.', terms: ['DMA', 'ADDRESSBUS', 'DATABUS', 'REGISTRADORES'] }, { name: 'ARQUITETURAS', hint: 'Descrevem velocidade, armazenamento ou núcleos.', terms: ['CACHE', 'MEMORIADEMASSA', 'DUALCORE', 'QUADCORE'] }];
let sortAttempts = 0, sortFinished = false;
function setupSort() { const bank = $('#term-bank'), groups = $('#sort-groups'); bank.innerHTML = ''; groups.innerHTML = ''; const all = sortData.flatMap(g => g.terms).sort(() => Math.random() - .5); all.forEach(term => { const chip = document.createElement('div'); chip.className = 'term-chip'; chip.textContent = term; chip.draggable = true; chip.dataset.term = term; chip.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', term)); bank.append(chip); }); sortData.forEach((group, i) => { const box = document.createElement('div'); box.className = 'sort-group'; box.innerHTML = `<h3>${group.name}</h3><p>${group.hint}</p><div class="drop-zone" data-group="${i}"></div>`; const zone = $('.drop-zone', box); zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); }); zone.addEventListener('dragleave', () => zone.classList.remove('over')); zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('over'); const chip = $(`[data-term="${e.dataTransfer.getData('text/plain')}"]`, bank); if (chip) zone.append(chip); }); groups.append(box); }); }
function checkSort() { if (sortFinished || sortAttempts >= 3) return; sortAttempts++; let score = 0; $$('.sort-group').forEach((group, i) => { const terms = $$('.term-chip', group).map(x => x.dataset.term); const right = terms.length === sortData[i].terms.length && terms.every(t => sortData[i].terms.includes(t)); group.classList.toggle('correct', right); group.classList.toggle('wrong', terms.length > 0 && !right); if (right) score++; }); $('#sort-score').textContent = `ACERTOS: ${score}/4`; $('#sort-chances').innerHTML = `${3 - sortAttempts} <small>/ 3</small>`; if (score === 4) { sortFinished = true; $('#sort-feedback').className = 'feedback success'; $('#sort-feedback').textContent = 'SISTEMA ORGANIZADO! Todos os módulos estão corretos.'; } else if (sortAttempts === 3) { sortFinished = true; $('#sort-feedback').className = 'feedback error'; $('#sort-feedback').textContent = `FIM DAS CHANCES. ${score}/4 módulos corretos. Reinicie para tentar novamente.`; } else { $('#sort-feedback').className = 'feedback error'; $('#sort-feedback').textContent = `ERRO: ${score}/4 grupos corretos. Você ainda tem ${3 - sortAttempts} chance(s). Grupos vermelhos precisam de revisão.`; } }
function resetSort() { setupSort(); sortAttempts = 0; sortFinished = false; $('#sort-score').className = ''; $('#sort-score').textContent = 'ACERTOS: 0/4'; $('#sort-chances').innerHTML = '3 <small>/ 3</small>'; $('#sort-feedback').className = 'feedback'; $('#sort-feedback').textContent = ''; }

const hintState = { crossword: 0, termo: 0, sort: 0 };
const hintSources = {
  crossword: crosswordWords.flatMap(word => word.hints.map((text, index) => ({ label: word.label, level: index + 1, text }))),
  termo: crosswordWords.find(word => word.answer === 'RAM').hints.map((text, index) => ({ label: 'RAM', level: index + 1, text })),
  sort: crosswordWords.flatMap(word => word.hints.map((text, index) => ({ label: word.label, level: index + 1, text })))
};
$$('.hint-button').forEach(button => button.addEventListener('click', () => {
  const type = button.dataset.hint, source = hintSources[type], hint = source[hintState[type] % source.length];
  hintState[type]++;
  $(`#${type}-hint`).textContent = `DICA ${hint.level} • ${hint.label}: ${hint.text}`;
}));
function navigate() { const name = location.hash.slice(1) || 'hub'; $$('.view').forEach(view => view.classList.toggle('active', view.dataset.view === name)); window.scrollTo(0, 0); }
$('#check-crossword').addEventListener('click', checkCrossword); $('#reset-crossword').addEventListener('click', resetCrossword); $('#submit-termo').addEventListener('click', submitTermo); $('#reset-termo').addEventListener('click', resetTermo); $('#check-sort').addEventListener('click', checkSort); $('#reset-sort').addEventListener('click', resetSort); document.addEventListener('keydown', e => { if (location.hash === '#termo' && /^[a-z]$/i.test(e.key)) { if (termoGuess.length < 3) termoGuess += e.key.toUpperCase(); renderTermo(); } if (location.hash === '#termo' && e.key === 'Backspace') { termoGuess = termoGuess.slice(0, -1); renderTermo(); } if (location.hash === '#termo' && e.key === 'Enter') submitTermo(); });
renderCrossword(); setupTermo(); setupSort(); navigate(); window.addEventListener('hashchange', navigate);
