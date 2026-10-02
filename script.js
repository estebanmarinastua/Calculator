const display = document.getElementById('display');
const expression = document.getElementById('expression');
const buttons = document.querySelector('.buttons');

let currentValue = '0';
let previousValue = null;
let operator = null;
let waitingForOperand = false;

function updateDisplay() {
  display.textContent = formatNumber(currentValue);

  if (previousValue !== null && operator) {
    expression.textContent = `${formatNumber(previousValue)} ${getOperatorSymbol(operator)}`;
    return;
  }

  expression.textContent = '';
}

function formatNumber(value) {
  if (value === 'Error') {
    return value;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'Error';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10,
  }).format(number);
}

function getOperatorSymbol(selectedOperator) {
  const symbols = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };

  return symbols[selectedOperator] || selectedOperator;
}

function reset() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  waitingForOperand = false;
  updateDisplay();
}

function showError() {
  currentValue = 'Error';
  previousValue = null;
  operator = null;
  waitingForOperand = true;
  display.textContent = 'Error';
  expression.textContent = 'Invalid operation';
}

function inputNumber(number) {
  if (currentValue === 'Error') {
    reset();
  }

  if (waitingForOperand) {
    currentValue = number;
    waitingForOperand = false;
  } else if (currentValue === '0') {
    currentValue = number;
  } else {
    currentValue += number;
  }

  updateDisplay();
}

function inputDecimal() {
  if (currentValue === 'Error') {
    reset();
  }

  if (waitingForOperand) {
    currentValue = '0.';
    waitingForOperand = false;
    updateDisplay();
    return;
  }

  if (!currentValue.includes('.')) {
    currentValue += '.';
  }

  updateDisplay();
}

function chooseOperator(nextOperator) {
  const inputValue = Number(currentValue);

  if (!Number.isFinite(inputValue)) {
    return;
  }

  if (operator && waitingForOperand) {
    operator = nextOperator;
    updateDisplay();
    return;
  }

  if (previousValue === null) {
    previousValue = inputValue;
  } else if (operator) {
    const result = calculate(previousValue, inputValue, operator);

    if (result === null) {
      showError();
      return;
    }

    currentValue = String(result);
    previousValue = result;
  }

  operator = nextOperator;
  waitingForOperand = true;
  updateDisplay();
}

function calculate(first, second, selectedOperator) {
  switch (selectedOperator) {
    case '+':
      return first + second;
    case '-':
      return first - second;
    case '*':
      return first * second;
    case '/':
      if (second === 0) {
        return null;
      }
      return first / second;
    default:
      return second;
  }
}

function calculateResult() {
  if (operator === null || previousValue === null || waitingForOperand) {
    return;
  }

  const secondValue = Number(currentValue);
  const result = calculate(previousValue, secondValue, operator);

  if (result === null) {
    showError();
    return;
  }

  expression.textContent = `${formatNumber(previousValue)} ${getOperatorSymbol(operator)} ${formatNumber(currentValue)} =`;
  currentValue = String(Number(result.toPrecision(12)));
  previousValue = null;
  operator = null;
  waitingForOperand = true;
  display.textContent = formatNumber(currentValue);
}

function calculatePercentage() {
  const value = Number(currentValue);

  if (!Number.isFinite(value)) {
    return;
  }

  currentValue = String(value / 100);
  updateDisplay();
}

function deleteLast() {
  if (currentValue === 'Error') {
    reset();
    return;
  }

  if (waitingForOperand) {
    return;
  }

  if (currentValue.length === 1 || (currentValue.length === 2 && currentValue.startsWith('-'))) {
    currentValue = '0';
  } else {
    currentValue = currentValue.slice(0, -1);
  }

  updateDisplay();
}

function handleButtonClick(event) {
  const target = event.target;

  if (target.matches('[data-number]')) {
    inputNumber(target.dataset.number);
    return;
  }

  if (target.matches('[data-action="decimal"]')) {
    inputDecimal();
    return;
  }

  if (target.matches('[data-operator]')) {
    chooseOperator(target.dataset.operator);
    return;
  }

  if (target.matches('[data-action="clear"]')) {
    reset();
    return;
  }

  if (target.matches('[data-action="delete"]')) {
    deleteLast();
    return;
  }

  if (target.matches('[data-action="percent"]')) {
    calculatePercentage();
    return;
  }

  if (target.matches('[data-action="calculate"]')) {
    calculateResult();
  }
}

buttons.addEventListener('click', handleButtonClick);

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
    return;
  }

  if (key === '.') {
    inputDecimal();
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    chooseOperator(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    calculateResult();
    return;
  }

  if (key === 'Backspace') {
    deleteLast();
    return;
  }

  if (key === 'Escape' || key.toLowerCase() === 'c') {
    reset();
  }
});

updateDisplay();
