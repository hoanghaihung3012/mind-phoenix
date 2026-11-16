import { calculateFormula, compileExpression, convertUnit, getFormulas, getUnitGroups, formatNumber, readNumber, unitLabel } from './calculator.mjs';
import { initLanguage } from '../i18n.mjs';

const i18n = initLanguage();
const t = i18n.t;
const $ = (id) => document.getElementById(id);
const formulas = () => getFormulas(i18n.language);
const groups = () => getUnitGroups(i18n.language);
const number = (value) => formatNumber(value, i18n.language);
const read = (value, label) => readNumber(value, label, i18n.language);
const compile = (source) => compileExpression(source, i18n.language);
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
  const formula = formulas().find((item) => item.id === $('formula-select').value);
  $('formula-fields').replaceChildren(...formula.fields.map((input) =>
    numberField('formula', input.id, `${input.id} · ${input.label}`, input.unit, input.value)));
  renderFormulaInfo();
  if (activeTab === 'formulas') calculate();
}

function renderFormulaInfo() {
  const formula = formulas().find((item) => item.id === $('formula-select').value);
  $('formula-display').textContent = formula.display;
  $('formula-note').textContent = `${formula.note} ${t('Ô số chấp nhận dấu phẩy hoặc dấu chấm thập phân; không nhập dấu phân cách hàng nghìn.', 'Number fields accept decimal commas or points; do not use thousands separators.')}`;
  for (const input of formula.fields) {
    document.querySelector(`label[for="formula-${input.id}"]`).textContent = `${input.id} · ${input.label}${input.unit ? ` (${input.unit})` : ''}`;
  }
}

function loadSubject() {
  options($('formula-select'), formulas().filter((item) => item.subject === $('subject').value).map((item) => [item.id, item.title]));
  loadFormula();
}

function loadUnits() {
  const group = groups().find((item) => item.id === $('unit-group').value);
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
    numberField('variable', name, t(`Điền số cho ${name}`, `Value for ${name}`), '', defaults && Object.hasOwn(defaults, name) ? defaults[name] : previous.get(name) ?? 1)));
  $('no-variables').hidden = names.length > 0;
}

function substitute(expression, values) {
  const result = expression.replace(/[A-Za-z][A-Za-z0-9_]*/g, (name) =>
    Object.hasOwn(values, name) ? `(${number(values[name])})` : name)
    .replace(/\*/g, ' × ').replace(/\//g, ' : ');
  return i18n.language === 'vi' ? result.replace(/(\d)\.(\d)/g, '$1,$2') : result;
}

function formulaReport() {
  const formula = formulas().find((item) => item.id === $('formula-select').value);
  const { value, values } = calculateFormula(formula.id, Object.fromEntries(new FormData($('formula-form'))), i18n.language);
  return {
    title: formula.title, value, unit: formula.unit,
    steps: [
      `${t('Công thức', 'Formula')}: ${formula.display}`,
      `${t('Dữ liệu', 'Values')}: ${formula.fields.map((input) => `${input.id} = ${number(values[input.id])} ${input.unit}`).join('; ')}.`,
      `${t('Thay số', 'Substitute')}: ${formula.symbol} = ${substitute(formula.expression, values)}.\n${t('Kết quả', 'Result')}: ${number(value)} ${formula.unit}.`
    ],
    note: formula.note
  };
}

function unitReport() {
  const group = groups().find((item) => item.id === $('unit-group').value);
  const from = group.units.find((item) => item.id === $('unit-from').value);
  const to = group.units.find((item) => item.id === $('unit-to').value);
  const input = read($('unit-value').value);
  const value = convertUnit(group.id, input, from.id, to.id, i18n.language);
  const notes = {
    length: t('Hai đơn vị độ dài liền nhau trong bảng km, hm, dam, m, dm, cm, mm gấp hoặc kém nhau 10 lần.', 'Adjacent length units in km, hm, dam, m, dm, cm, mm differ by a factor of 10.'),
    area: t('Nhớ nhé: 1 m² = 100 dm² = 10000 cm². Đổi diện tích khác với đổi độ dài!', 'Remember: 1 m² = 100 dm² = 10000 cm². Area conversions differ from length conversions!'),
    volume: t('Nhớ nhé: 1 m³ = 1000 dm³; 1 dm³ = 1 L; 1 cm³ = 1 mL.', 'Remember: 1 m³ = 1000 dm³; 1 dm³ = 1 L; 1 cm³ = 1 mL.'),
    mass: t('Nhớ nhé: 1 tấn = 10 tạ; 1 tạ = 10 yến; 1 yến = 10 kg; 1 kg = 1000 g.', 'Remember: 1 tonne = 1000 kg; 1 quintal = 100 kg; one ten-kilogram unit = 10 kg; 1 kg = 1000 g.'),
    time: t('Nhớ nhé: 1 giờ = 60 phút; 1 phút = 60 giây; 1 ngày = 24 giờ; 1 tuần = 7 ngày.', 'Remember: 1 hour = 60 minutes; 1 minute = 60 seconds; 1 day = 24 hours; 1 week = 7 days.'),
    speed: t('Ví dụ: 1 m/giây nghĩa là đi được 1 mét trong 1 giây. 1 m/giây = 60 m/phút = 3,6 km/giờ.', 'For example, 1 m/s means traveling 1 meter in 1 second. 1 m/s = 60 m/min = 3.6 km/h.')
  };
  const divide = to.scale > from.scale;
  const factor = divide ? to.scale / from.scale : from.scale / to.scale;
  const fromLabel = unitLabel(from.id, i18n.language);
  const toLabel = unitLabel(to.id, i18n.language);
  return {
    title: t(`Quy đổi ${group.title.toLowerCase()}`, `${group.title} conversion`), value, unit: toLabel,
    steps: [
      `${t('Giá trị ban đầu', 'Original value')}: ${number(input)} ${fromLabel}.`,
      divide ? `${t('Nhớ rằng', 'Remember')}: 1 ${toLabel} = ${number(factor)} ${fromLabel}.`
        : `${t('Nhớ rằng', 'Remember')}: 1 ${fromLabel} = ${number(factor)} ${toLabel}.`,
      `${t('Lấy', 'Calculate')} ${number(input)} ${divide ? ':' : '×'} ${number(factor)}.\n${t('Kết quả', 'Result')}: ${number(value)} ${toLabel}.`
    ],
    note: notes[group.id]
  };
}

function expressionReport() {
  const source = $('expression').value.trim();
  const compiled = compile(source);
  syncVariables(compiled);
  const values = Object.fromEntries(variableNames.map((name) => [name, read($(`variable-${name}`).value, t(`Biến ${name}`, `Variable ${name}`))]));
  const value = compiled.evaluate(values);
  return {
    title: t('Phép tính của em', 'Your calculation'), value, unit: '',
    steps: [
      `${t('Phép tính', 'Expression')}: ${substitute(source, {})}`,
      variableNames.length ? `${t('Điền số', 'Values')}: ${variableNames.map((name) => `${name} = ${number(values[name])}`).join('; ')}.` : t('Phép tính đã có đủ các số, không cần điền thêm.', 'All numbers are already in the expression; no extra values are needed.'),
      `${t('Sau khi điền số', 'After substitution')}: ${substitute(source, values)}.\n${t('Kết quả', 'Result')}: ${number(value)}.`
    ],
    note: value < 0 ? t('Kết quả là số âm. Nếu bài toán chỉ dùng số tự nhiên, em hãy kiểm tra lại các số và thứ tự phép trừ nhé.', 'The result is negative. If your problem uses only whole non-negative numbers, check the values and the order of subtraction.')
      : t('Trong ngoặc trước; nhân, chia trước; cộng, trừ sau. Cùng mức ưu tiên thì tính từ trái sang phải.', 'Parentheses first; then multiplication and division; then addition and subtraction. Equal-priority operations go from left to right.')
  };
}

function calculate() {
  $('action-status').textContent = '';
  try {
    const next = activeTab === 'formulas' ? formulaReport() : activeTab === 'units' ? unitReport() : expressionReport();
    $('result-label').textContent = next.title;
    $('result-value').textContent = number(next.value);
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
    syncVariables(compile(example.expression), example.values);
    calculate();
  });
}
$('copy-result').addEventListener('click', async () => {
  if (!report) return;
  const current = report;
  const text = `${current.title}\n${t('Kết quả', 'Result')}: ${number(current.value)} ${current.unit}\n\n${current.steps.join('\n')}\n\n${current.note}\n${t('Kết quả quá dài được làm tròn khi hiển thị.', 'Long results are rounded for display.')}\nMini Formula & Unit Sandbox · Mind Phoenix`;
  try {
    await navigator.clipboard.writeText(text);
    if (report === current) $('action-status').textContent = t('Đã sao chép lời giải. Dán vào bài học của bạn nhé!', 'Solution copied. Paste it into your lesson!');
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (report === current) $('action-status').textContent = t('Không thể truy cập bộ nhớ tạm. Hãy cho phép sao chép trong trình duyệt hoặc chọn văn bản lời giải để sao chép thủ công.', 'Cannot access the clipboard. Allow copying in your browser or select the solution text and copy it manually.');
  }
});
$('print-result').addEventListener('click', () => { if (report) window.print(); });

i18n.onChange(() => {
  const translateOptions = (select, items) => {
    for (const option of select.options) option.textContent = items.find((item) => item.id === option.value).title;
  };
  translateOptions($('formula-select'), formulas());
  translateOptions($('unit-group'), groups());
  const group = groups().find((item) => item.id === $('unit-group').value);
  for (const id of ['unit-from', 'unit-to']) {
    for (const option of $(id).options) option.textContent = group.units.find((item) => item.id === option.value).label;
  }
  renderFormulaInfo();
  for (const name of variableNames) document.querySelector(`label[for="variable-${name}"]`).textContent = t(`Điền số cho ${name}`, `Value for ${name}`);
  calculate();
});

options($('unit-group'), groups().map((item) => [item.id, item.title]));
loadUnits();
syncVariables(compile(examples.perimeter.expression), examples.perimeter.values);
loadSubject();
