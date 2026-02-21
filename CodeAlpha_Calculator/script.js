/* =============================================
   CALC — Calculator Logic + Keyboard Support
   ============================================= */

const display    = document.getElementById('display');
const expression = document.getElementById('expression');

let currentInput  = '0';
let previousInput = '';
let operator      = null;
let shouldReset   = false;
let justCalculated = false;

/* ---- Update Display ---- */
function updateDisplay(value) {
  // Trim long decimals
  let disp = value;
  if (disp.length > 12) {
    const num = parseFloat(disp);
    if (!isNaN(num)) {
      disp = num.toPrecision(9).replace(/\.?0+$/, '');
    }
  }
  display.textContent = disp;

  // Font size scaling
  display.classList.remove('small', 'tiny');
  if (disp.length > 9)  display.classList.add('small');
  if (disp.length > 13) display.classList.add('tiny');

  popAnimation();
}

function popAnimation() {
  display.classList.remove('pop');
  void display.offsetWidth; // reflow
  display.classList.add('pop');
}

/* ---- Input Number ---- */
function inputNum(num) {
  if (justCalculated && num !== '.') {
    currentInput = num;
    justCalculated = false;
    expression.textContent = '';
  } else if (shouldReset) {
    currentInput = (num === '.' ? '0.' : num);
    shouldReset = false;
  } else {
    if (num === '.' && currentInput.includes('.')) return;
    if (currentInput === '0' && num !== '.') {
      currentInput = num;
    } else {
      if (currentInput.length >= 14) return;
      currentInput += num;
    }
  }
  updateDisplay(currentInput);
}

/* ---- Set Operator ---- */
function setOperator(op) {
  if (operator && !shouldReset) calculate(false);

  previousInput = currentInput;
  operator      = op;
  shouldReset   = true;
  justCalculated = false;

  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  expression.textContent = `${previousInput} ${opSymbols[op]}`;

  // Highlight active operator
  document.querySelectorAll('.btn.op').forEach(b => b.classList.remove('active-op'));
  const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  document.querySelectorAll('.btn.op').forEach(b => {
    if (b.textContent === opMap[op]) b.classList.add('active-op');
  });
}

/* ---- Calculate ---- */
function calculate(final = true) {
  if (!operator || shouldReset) return;

  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  let result;

  switch (operator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':
      if (curr === 0) { showError('Error'); return; }
      result = prev / curr;
      break;
  }

  // Handle floating point
  result = parseFloat(result.toPrecision(12));

  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  if (final) {
    expression.textContent = `${previousInput} ${opSymbols[operator]} ${currentInput} =`;
  }

  currentInput  = String(result);
  if (final) {
    operator      = null;
    justCalculated = true;
    shouldReset   = false;
    document.querySelectorAll('.btn.op').forEach(b => b.classList.remove('active-op'));
  }

  updateDisplay(currentInput);
}

/* ---- Actions ---- */
function clearAll() {
  currentInput   = '0';
  previousInput  = '';
  operator       = null;
  shouldReset    = false;
  justCalculated = false;
  expression.textContent = '';
  document.querySelectorAll('.btn.op').forEach(b => b.classList.remove('active-op'));
  updateDisplay('0');
}

function toggleSign() {
  if (currentInput === '0') return;
  currentInput = currentInput.startsWith('-')
    ? currentInput.slice(1)
    : '-' + currentInput;
  updateDisplay(currentInput);
}

function percent() {
  const val = parseFloat(currentInput);
  if (isNaN(val)) return;
  currentInput = String(val / 100);
  updateDisplay(currentInput);
}

function showError(msg) {
  display.classList.remove('shake');
  void display.offsetWidth;
  display.classList.add('shake');
  display.textContent = msg;
  setTimeout(() => { clearAll(); }, 1200);
}

/* ---- Ripple Effect ---- */
function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'ripple-el';
  const x = (e.clientX || rect.left + rect.width / 2) - rect.left - 30;
  const y = (e.clientY || rect.top + rect.height / 2) - rect.top - 30;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  btn.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

/* ---- Button Listeners ---- */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    addRipple(btn, e);

    if (btn.dataset.num !== undefined) {
      inputNum(btn.dataset.num);
    } else if (btn.dataset.op) {
      setOperator(btn.dataset.op);
    } else if (btn.dataset.action) {
      switch (btn.dataset.action) {
        case 'clear':  clearAll();    break;
        case 'sign':   toggleSign();  break;
        case 'percent': percent();    break;
        case 'dot':    inputNum('.'); break;
        case 'equals': calculate();   break;
      }
    }
  });
});

/* ---- Keyboard Support ---- */
const keyMap = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '.': 'dot', ',': 'dot',
  '+': '+', '-': '-', '*': '*', '/': '/',
  'Enter': 'equals', '=': 'equals',
  'Backspace': 'backspace',
  'Escape': 'clear', 'Delete': 'clear',
  '%': 'percent'
};

document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (!(key in keyMap)) return;

  e.preventDefault();
  const mapped = keyMap[key];

  // Find and animate corresponding button
  let targetBtn = null;

  if ('0123456789'.includes(mapped)) {
    targetBtn = document.querySelector(`[data-num="${mapped}"]`);
    inputNum(mapped);
  } else if (['+','-','*','/'].includes(mapped)) {
    targetBtn = document.querySelector(`[data-op="${mapped}"]`);
    setOperator(mapped);
  } else if (mapped === 'dot') {
    targetBtn = document.querySelector('[data-action="dot"]');
    inputNum('.');
  } else if (mapped === 'equals') {
    targetBtn = document.querySelector('[data-action="equals"]');
    calculate();
  } else if (mapped === 'clear') {
    targetBtn = document.querySelector('[data-action="clear"]');
    clearAll();
  } else if (mapped === 'percent') {
    targetBtn = document.querySelector('[data-action="percent"]');
    percent();
  } else if (mapped === 'backspace') {
    // Backspace: delete last char
    if (currentInput.length > 1 && !justCalculated) {
      currentInput = currentInput.slice(0, -1) || '0';
    } else {
      currentInput = '0';
    }
    updateDisplay(currentInput);
  }

  // Flash button
  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.style.opacity = '0.7';
    setTimeout(() => {
      targetBtn.classList.remove('active');
      targetBtn.style.opacity = '';
    }, 120);
  }
});
