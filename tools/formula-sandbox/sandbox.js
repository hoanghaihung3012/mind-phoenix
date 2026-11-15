import { calculateFormula, compileExpression, convertUnit, FORMULAS, formatNumber, readNumber, UNIT_GROUPS } from './calculator.mjs';

const $ = (id) => document.getElementById(id);
const unitLabel = (id) => ({ t: 'tấn', min: 'phút', h: 'giờ', s: 'giây', 'km/h': 'km/giờ', 'm/s': 'm/giây', 'm/min': 'm/phút' })[id] ?? id;
let activeTab = 'formulas';
let report = null;
let variableNames = [];
const examples = {
  perimeter: { expression: '(a+b)*2', values: { a: 8, b: 5 } },
  average: { expression: '(a+b+c)/3', values: { a: 7, b: 8, c: 9 } },
  sharing: { expression: 'a/b', values: { a: 12, b: 3 } }
};

function options(select, items) {
  select.replaceChildren(...items.map(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }));
}

function numberField(prefix, name, label, unit, value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const labelElement = document.createElement('label');
  labelElement.htmlFor = `${prefix}-${name}`;
  labelElement.textContent = `${label}${unit ? ` (${unit})` : ''}`;
  const input = document.createElement('input');
  input.id = labelElement.htmlFor;
  input.name = name;
  input.type = 'text';
  input.inputMode = 'decimal';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.maxLength = 100;
  input.value = String(value);
  wrapper.append(labelElement, input);
  return wrapper;
}

function loadFormula() {
  const formula = FORMULAS.find((item) => item.id === $('formula-select').value);
  $('formula-display').textContent = formula.display;
  $('formula-note').textContent = `${formula.note} Ô số chấp nhận dấu phẩy hoặc dấu chấm thập phân; không nhập dấu phân cách hàng nghìn.`;
  $('formula-fields').replaceChildren(...formula.fields.map((input) =>
    numberField('formula', input.id, `${input.id} · ${input.label}`, input.unit, input.value)));
  if (activeTab === 'formulas') calculate();
}

function loadSubject() {
  options($('formula-select'), FORMULAS.filter((item) => item.subject === $('subject').value).map((item) => [item.id, item.title]));
  loadFormula();
}

function loadUnits() {
  const group = UNIT_GROUPS.find((item) => item.id === $('unit-group').value);
  for (const id of ['unit-from', 'unit-to']) options($(id), group.units.map((item) => [item.id, item.label]));
  $('unit-to').selectedIndex = 1;
  if (activeTab === 'units') calculate();
}

function syncVariables(compiled, defaults) {
  const names = compiled.variables;
  if (!defaults && names.length === variableNames.length && names.every((name, index) => name === variableNames[index])) return;
  const previous = new Map(variableNames.map((name) => [name, $(`variable-${name}`).value]));
  variableNames = names;
  $('variable-fields').replaceChildren(...names.map((name) =>
    numberField('variable', name, `Điền số cho ${name}`, '', defaults && Object.hasOwn(defaults, name) ? defaults[name] : previous.get(name) ?? 1)));
  $('no-variables').hidden = names.length > 0;
}

function substitute(expression, values) {
  return expression.replace(/[A-Za-z][A-Za-z0-9_]*/g, (name) =>
    Object.hasOwn(values, name) ? `(${formatNumber(values[name])})` : name)
    .replace(/\*/g, ' × ').replace(/\//g, ' : ').replace(/(\d)\.(\d)/g, '$1,$2');
}

function formulaReport() {
  const formula = FORMULAS.find((item) => item.id === $('formula-select').value);
  const { value, values } = calculateFormula(formula.id, Object.fromEntries(new FormData($('formula-form'))));
  return {
    title: formula.title, value, unit: formula.unit,
    steps: [
      `Công thức: ${formula.display}`,
      `Dữ liệu: ${formula.fields.map((input) => `${input.id} = ${formatNumber(values[input.id])} ${input.unit}`).join('; ')}.`,
      `Thay số: ${formula.symbol} = ${substitute(formula.expression, values)}.\nKết quả: ${formatNumber(value)} ${formula.unit}.`
    ],
    note: formula.note
  };
}

function unitReport() {
  const group = UNIT_GROUPS.find((item) => item.id === $('unit-group').value);
  const from = group.units.find((item) => item.id === $('unit-from').value);
  const to = group.units.find((item) => item.id === $('unit-to').value);
  const input = readNumber($('unit-value').value);
  const value = convertUnit(group.id, input, from.id, to.id);
  const notes = {
    length: 'Hai đơn vị độ dài liền nhau trong bảng km, hm, dam, m, dm, cm, mm gấp hoặc kém nhau 10 lần.',
    area: 'Nhớ nhé: 1 m² = 100 dm² = 10000 cm². Đổi diện tích khác với đổi độ dài!',
    volume: 'Nhớ nhé: 1 m³ = 1000 dm³; 1 dm³ = 1 L; 1 cm³ = 1 mL.',
    mass: 'Nhớ nhé: 1 tấn = 10 tạ; 1 tạ = 10 yến; 1 yến = 10 kg; 1 kg = 1000 g.',
    time: 'Nhớ nhé: 1 giờ = 60 phút; 1 phút = 60 giây; 1 ngày = 24 giờ; 1 tuần = 7 ngày.',
    speed: 'Ví dụ: 1 m/giây nghĩa là đi được 1 mét trong 1 giây. 1 m/giây = 60 m/phút = 3,6 km/giờ.'
  };
  const divide = to.scale > from.scale;
  const factor = divide ? to.scale / from.scale : from.scale / to.scale;
  const fromLabel = unitLabel(from.id);
  const toLabel = unitLabel(to.id);
  return {
    title: `Quy đổi ${group.title.toLowerCase()}`, value, unit: toLabel,
    steps: [
      `Giá trị ban đầu: ${formatNumber(input)} ${fromLabel}.`,
      divide ? `Nhớ rằng: 1 ${toLabel} = ${formatNumber(factor)} ${fromLabel}.`
        : `Nhớ rằng: 1 ${fromLabel} = ${formatNumber(factor)} ${toLabel}.`,
      `Lấy ${formatNumber(input)} ${divide ? ':' : '×'} ${formatNumber(factor)}.\nKết quả: ${formatNumber(value)} ${toLabel}.`
    ],
    note: notes[group.id]
  };
}

function expressionReport() {
  const source = $('expression').value.trim();
  const compiled = compileExpression(source);
  syncVariables(compiled);
  const values = Object.fromEntries(variableNames.map((name) => [name, readNumber($(`variable-${name}`).value, `Biến ${name}`)]));
  const value = compiled.evaluate(values);
  return {
    title: 'Phép tính của em', value, unit: '',
    steps: [
      `Phép tính: ${substitute(source, {})}`,
      variableNames.length ? `Điền số: ${variableNames.map((name) => `${name} = ${formatNumber(values[name])}`).join('; ')}.` : 'Phép tính đã có đủ các số, không cần điền thêm.',
      `Sau khi điền số: ${substitute(source, values)}.\nKết quả: ${formatNumber(value)}.`
    ],
    note: value < 0 ? 'Kết quả là số âm. Nếu bài toán chỉ dùng số tự nhiên, em hãy kiểm tra lại các số và thứ tự phép trừ nhé.'
      : 'Trong ngoặc trước; nhân, chia trước; cộng, trừ sau. Cùng mức ưu tiên thì tính từ trái sang phải.'
  };
}

function calculate() {
  $('action-status').textContent = '';
  try {
    const next = activeTab === 'formulas' ? formulaReport() : activeTab === 'units' ? unitReport() : expressionReport();
    $('result-label').textContent = next.title;
    $('result-value').textContent = formatNumber(next.value);
    $('result-unit').textContent = next.unit;
    $('result-steps').replaceChildren(...next.steps.map((text) => {
      const step = document.createElement('li');
      step.textContent = text;
      return step;
    }));
    $('result-note').textContent = next.note;
    $('result-content').hidden = false;
    $('result-error').hidden = true;
    $('copy-result').disabled = false;
    $('print-result').disabled = false;
    report = next;
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    $('result-error').textContent = error.message;
    $('result-error').hidden = false;
    $('result-content').hidden = true;
    $('copy-result').disabled = true;
    $('print-result').disabled = true;
    report = null;
  }
}

function activateTab(name) {
  activeTab = name;
  for (const tab of document.querySelectorAll('[role="tab"]')) {
    const selected = tab.id === `tab-${name}`;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(tab.getAttribute('aria-controls')).hidden = !selected;
  }
  calculate();
}

for (const tab of document.querySelectorAll('[role="tab"]')) {
  tab.addEventListener('click', () => activateTab(tab.id.slice(4)));
  tab.addEventListener('keydown', (event) => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(tab);
    const indices = { ArrowRight: (current + 1) % tabs.length, ArrowLeft: (current + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!Object.hasOwn(indices, event.key)) return;
    event.preventDefault();
    const next = tabs[indices[event.key]];
    activateTab(next.id.slice(4));
    next.focus();
  });
}
for (const id of ['formula-form', 'unit-form', 'expression-form']) {
  $(id).addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
  $(id).addEventListener('input', (event) => {
    if (event.target.matches('input, textarea')) calculate();
  });
}
$('subject').addEventListener('change', loadSubject);
$('formula-select').addEventListener('change', loadFormula);
$('formula-example').addEventListener('click', loadFormula);
$('unit-group').addEventListener('change', loadUnits);
for (const id of ['unit-from', 'unit-to']) $(id).addEventListener('change', calculate);
$('swap-units').addEventListener('click', () => {
  const previous = $('unit-from').value;
  $('unit-from').value = $('unit-to').value;
  $('unit-to').value = previous;
  calculate();
});
for (const button of document.querySelectorAll('[data-example]')) {
  button.addEventListener('click', () => {
    const example = examples[button.dataset.example];
    $('expression').value = example.expression;
    syncVariables(compileExpression(example.expression), example.values);
    calculate();
  });
}
$('copy-result').addEventListener('click', async () => {
  if (!report) return;
  const current = report;
  const text = `${current.title}\nKết quả: ${formatNumber(current.value)} ${current.unit}\n\n${current.steps.join('\n')}\n\n${current.note}\nKết quả quá dài được làm tròn khi hiển thị.\nMini Formula & Unit Sandbox · Mind Phoenix`;
  try {
    await navigator.clipboard.writeText(text);
    if (report === current) $('action-status').textContent = 'Đã sao chép lời giải. Dán vào bài học của bạn nhé!';
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (report === current) $('action-status').textContent = 'Không thể truy cập bộ nhớ tạm. Hãy cho phép sao chép trong trình duyệt hoặc chọn văn bản lời giải để sao chép thủ công.';
  }
});
$('print-result').addEventListener('click', () => { if (report) window.print(); });

options($('unit-group'), UNIT_GROUPS.map((item) => [item.id, item.title]));
loadUnits();
syncVariables(compileExpression(examples.perimeter.expression), examples.perimeter.values);
loadSubject();
