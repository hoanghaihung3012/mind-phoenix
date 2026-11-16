const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function readNumber(raw, label, language = 'vi') {
  label ??= language === 'en' ? 'Value' : 'Giá trị';
  const text = String(raw).trim().replace(',', '.');
  if (!NUMBER.test(text) || !Number.isFinite(Number(text))) {
    throw new Error(language === 'en' ? `${label}: enter a valid number without thousands separators.` : `${label}: hãy nhập một số hợp lệ, không dùng dấu phân cách hàng nghìn.`);
  }
  return Number(text);
}

function finite(value, language = 'vi') {
  if (!Number.isFinite(value)) throw new Error(language === 'en' ? 'The result exceeds the calculation limit. Try smaller numbers.' : 'Kết quả vượt giới hạn tính toán. Em hãy thử các số nhỏ hơn.');
  return value;
}

export function formatNumber(value, language = 'vi') {
  finite(value, language);
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'vi-VN', {
    maximumSignificantDigits: 12,
    useGrouping: false,
    notation: value !== 0 && (Math.abs(value) >= 1e12 || Math.abs(value) < 1e-6) ? 'scientific' : 'standard'
  }).format(Object.is(value, -0) ? 0 : value);
}

export function compileExpression(source, language = 'vi') {
  const t = (vi, en) => language === 'en' ? en : vi;
  if (typeof source !== 'string' || !source.trim()) throw new Error(t('Hãy nhập một biểu thức.', 'Enter an expression.'));
  if (source.length > 500) throw new Error(t('Biểu thức dài tối đa 500 ký tự.', 'An expression can contain at most 500 characters.'));
  const tokens = [];
  const lexer = /\s*(?:(\d+(?:\.\d*)?|\.\d+)|([A-Za-z][A-Za-z0-9_]*)|([+\-*/()]))/y;
  let position = 0;
  while (position < source.trimEnd().length) {
    lexer.lastIndex = position;
    const match = lexer.exec(source);
    if (!match) throw new Error(t(`Ký tự không hợp lệ ở vị trí ${position + 1}. Dùng dấu chấm cho số thập phân trong biểu thức.`, `Invalid character at position ${position + 1}. Use a decimal point in expressions.`));
    tokens.push(match[1] ? { type: 'number', value: finite(Number(match[1]), language) }
      : match[2] ? { type: 'name', value: match[2] } : { type: match[3] });
    position = lexer.lastIndex;
    if (tokens.length > 200) throw new Error(t('Biểu thức quá phức tạp (tối đa 200 thành phần).', 'The expression is too complex (at most 200 tokens).'));
  }
  let index = 0;
  const variables = new Set();
  const take = (type) => tokens[index]?.type === type ? tokens[index++] : null;
  const expect = (type) => {
    if (!take(type)) throw new Error(t(`Thiếu dấu "${type}" hoặc biểu thức chưa hoàn chỉnh.`, `Missing "${type}" or an incomplete expression.`));
  };
  function primary() {
    const number = take('number');
    if (number) return { type: 'number', value: number.value };
    if (take('(')) {
      const node = sum();
      expect(')');
      return node;
    }
    const name = take('name');
    if (!name) throw new Error(t('Thiếu số, biến hoặc dấu ngoặc hợp lệ.', 'A number, variable or valid parenthesis is missing.'));
    if (tokens[index]?.type === '(') throw new Error(t('Dùng dấu * để nhân với một biểu thức trong ngoặc, ví dụ: a*(b+c).', 'Use * to multiply by a parenthesized expression, for example: a*(b+c).'));
    variables.add(name.value);
    if (variables.size > 20) throw new Error(t('Dùng tối đa 20 biến trong một biểu thức.', 'Use at most 20 variables in an expression.'));
    return { type: 'variable', name: name.value };
  }
  function unary() {
    if (take('+')) return unary();
    if (take('-')) return { type: 'negate', argument: unary() };
    return primary();
  }
  function product() {
    let node = unary();
    while (tokens[index]?.type === '*' || tokens[index]?.type === '/') {
      node = { type: tokens[index++].type, left: node, right: unary() };
    }
    return node;
  }
  function sum() {
    let node = product();
    while (tokens[index]?.type === '+' || tokens[index]?.type === '-') {
      node = { type: tokens[index++].type, left: node, right: product() };
    }
    return node;
  }
  const root = sum();
  if (index !== tokens.length) throw new Error(t('Dư dấu ngoặc hoặc thiếu phép toán. Viết phép nhân bằng dấu * (ví dụ: 2*x).', 'Extra parentheses or a missing operator. Write multiplication with * (for example: 2*x).'));

  function evaluateNode(node, values) {
    if (node.type === 'number') return node.value;
    if (node.type === 'variable') {
      if (!Object.hasOwn(values, node.name)) throw new Error(t(`Thiếu giá trị cho biến ${node.name}.`, `Missing a value for variable ${node.name}.`));
      return readNumber(values[node.name], t(`Biến ${node.name}`, `Variable ${node.name}`), language);
    }
    if (node.type === 'negate') return -evaluateNode(node.argument, values);
    const left = evaluateNode(node.left, values);
    const right = evaluateNode(node.right, values);
    switch (node.type) {
      case '+': return finite(left + right, language);
      case '-': return finite(left - right, language);
      case '*': return finite(left * right, language);
      case '/':
        if (right === 0) throw new Error(t('Không thể chia cho 0.', 'Cannot divide by zero.'));
        return finite(left / right, language);
      default: throw new Error(t('Phép toán không được hỗ trợ.', 'Unsupported operation.'));
    }
  }
  return {
    variables: [...variables],
    evaluate(values = {}) {
      return finite(evaluateNode(root, values), language);
    }
  };
}

const field = (id, label, unit, value, positive = true) => ({ id, label, unit, value, positive });
export const FORMULAS = [
  { id: 'rectangle', subject: 'geometry', title: 'Diện tích hình chữ nhật', symbol: 'S', expression: 'a*b', display: 'S = a × b', unit: 'cm²',
    fields: [field('a', 'Chiều dài', 'cm', 8), field('b', 'Chiều rộng', 'cm', 5)], note: 'Diện tích = chiều dài × chiều rộng. Hai số đo phải cùng đơn vị. cm² đọc là xentimét vuông.' },
  { id: 'rectangle-perimeter', subject: 'geometry', title: 'Chu vi hình chữ nhật', symbol: 'P', expression: '(a+b)*2', display: 'P = (a + b) × 2', unit: 'cm',
    fields: [field('a', 'Chiều dài', 'cm', 8), field('b', 'Chiều rộng', 'cm', 5)], note: 'Chu vi là độ dài đường bao quanh hình. Cộng chiều dài với chiều rộng rồi nhân với 2.' },
  { id: 'square-area', subject: 'geometry', title: 'Diện tích hình vuông', symbol: 'S', expression: 'a*a', display: 'S = a × a', unit: 'cm²',
    fields: [field('a', 'Độ dài cạnh', 'cm', 5)], note: 'Diện tích hình vuông bằng độ dài một cạnh nhân với chính nó.' },
  { id: 'square-perimeter', subject: 'geometry', title: 'Chu vi hình vuông', symbol: 'P', expression: 'a*4', display: 'P = a × 4', unit: 'cm',
    fields: [field('a', 'Độ dài cạnh', 'cm', 5)], note: 'Hình vuông có 4 cạnh bằng nhau. Lấy độ dài một cạnh nhân với 4.' },
  { id: 'triangle', subject: 'geometry', title: 'Diện tích tam giác', symbol: 'S', expression: 'a*h/2', display: 'S = a × h : 2', unit: 'cm²',
    fields: [field('a', 'Cạnh đáy', 'cm', 6), field('h', 'Chiều cao tương ứng', 'cm', 4)], note: 'Chiều cao phải vuông góc với cạnh đáy đã chọn.' },
  { id: 'parallelogram', subject: 'geometry', title: 'Diện tích hình bình hành', symbol: 'S', expression: 'a*h', display: 'S = a × h', unit: 'cm²',
    fields: [field('a', 'Cạnh đáy', 'cm', 6), field('h', 'Chiều cao', 'cm', 4)], note: 'Lấy độ dài đáy nhân với chiều cao tương ứng. Không nhầm chiều cao với cạnh bên.' },
  { id: 'rhombus', subject: 'geometry', title: 'Diện tích hình thoi', symbol: 'S', expression: 'm*n/2', display: 'S = m × n : 2', unit: 'cm²',
    fields: [field('m', 'Đường chéo thứ nhất', 'cm', 8), field('n', 'Đường chéo thứ hai', 'cm', 6)], note: 'Lấy tích độ dài hai đường chéo chia cho 2. Hai đường chéo phải cùng đơn vị đo.' },
  { id: 'trapezoid', subject: 'geometry', title: 'Diện tích hình thang', symbol: 'S', expression: '(a+b)*h/2', display: 'S = (a + b) × h : 2', unit: 'cm²',
    fields: [field('a', 'Đáy lớn', 'cm', 12), field('b', 'Đáy bé', 'cm', 8), field('h', 'Chiều cao', 'cm', 3)], note: 'Cộng hai đáy, nhân với chiều cao rồi chia cho 2. Chiều cao vuông góc với hai đáy.' },
  { id: 'circle-perimeter', subject: 'geometry', title: 'Chu vi hình tròn', symbol: 'C', expression: 'r*2*3.14', display: 'C = r × 2 × 3,14', unit: 'cm',
    fields: [field('r', 'Bán kính', 'cm', 3)], note: 'Đường kính bằng 2 lần bán kính. Ở tiểu học, lấy số pi gần đúng là 3,14.' },
  { id: 'circle', subject: 'geometry', title: 'Diện tích hình tròn', symbol: 'S', expression: 'r*r*3.14', display: 'S = r × r × 3,14', unit: 'cm²',
    fields: [field('r', 'Bán kính', 'cm', 3)], note: 'Lấy bán kính nhân với bán kính rồi nhân với 3,14, theo cách tính ở tiểu học.' },
  { id: 'cuboid', subject: 'geometry', title: 'Thể tích hình hộp chữ nhật', symbol: 'V', expression: 'a*b*h', display: 'V = a × b × h', unit: 'cm³',
    fields: [field('a', 'Chiều dài', 'cm', 5), field('b', 'Chiều rộng', 'cm', 4), field('h', 'Chiều cao', 'cm', 3)], note: 'Thể tích = chiều dài × chiều rộng × chiều cao. cm³ đọc là xentimét khối.' },
  { id: 'cube', subject: 'geometry', title: 'Thể tích hình lập phương', symbol: 'V', expression: 'a*a*a', display: 'V = a × a × a', unit: 'cm³',
    fields: [field('a', 'Độ dài cạnh', 'cm', 3)], note: 'Hình lập phương có các cạnh bằng nhau. Lấy cạnh nhân cạnh rồi nhân cạnh một lần nữa.' },
  { id: 'average', subject: 'numbers', title: 'Trung bình cộng của 3 số', symbol: 'T', expression: '(a+b+c)/3', display: 'T = (a + b + c) : 3', unit: '',
    fields: [field('a', 'Số thứ nhất', '', 7, false), field('b', 'Số thứ hai', '', 8, false), field('c', 'Số thứ ba', '', 9, false)], note: 'Muốn tìm trung bình cộng, tính tổng các số rồi chia cho số các số hạng (ở đây là 3).' },
  { id: 'percent', subject: 'numbers', title: 'Tỉ số phần trăm của hai số', symbol: 'T', expression: 'a/b*100', display: 'T = a : b × 100%', unit: '%',
    fields: [field('a', 'Số cần so sánh', '', 5, false), field('b', 'Số làm mốc so sánh', '', 20)], note: 'Lấy số thứ nhất chia cho số thứ hai, nhân với 100 rồi viết thêm kí hiệu %. Ví dụ: 5 bằng 25% của 20.' },
  { id: 'speed', subject: 'movement', title: 'Vận tốc · Toán lớp 5', symbol: 'v', expression: 's/t', display: 'v = s : t', unit: 'km/giờ',
    fields: [field('s', 'Quãng đường', 'km', 120, false), field('t', 'Thời gian', 'giờ', 3)], note: 'Vận tốc = quãng đường : thời gian. Đi được bao nhiêu kilômét trong 1 giờ thì vận tốc là bấy nhiêu km/giờ.' }
];

export function calculateFormula(id, rawValues, language = 'vi') {
  const t = (vi, en) => language === 'en' ? en : vi;
  const formula = getFormulas(language).find((item) => item.id === id);
  if (!formula) throw new Error(t('Công thức không hợp lệ.', 'Invalid formula.'));
  const values = {};
  for (const input of formula.fields) {
    const value = readNumber(rawValues[input.id] ?? '', input.label, language);
    if (input.positive ? value <= 0 : value < 0) {
      throw new Error(t(`${input.label} phải ${input.positive ? 'lớn hơn' : 'lớn hơn hoặc bằng'} 0.`, `${input.label} must be ${input.positive ? 'greater than' : 'greater than or equal to'} 0.`));
    }
    values[input.id] = value;
  }
  if (id === 'rectangle' || id === 'rectangle-perimeter' || id === 'cuboid') {
    if (values.a < values.b) throw new Error(t('Chiều dài cần lớn hơn hoặc bằng chiều rộng. Em hãy đổi lại hai số đo nhé.', 'Length must be greater than or equal to width. Swap the two measurements.'));
  }
  if (id === 'trapezoid' && values.a < values.b) throw new Error(t('Đáy lớn cần lớn hơn hoặc bằng đáy bé. Em hãy kiểm tra hai số đo nhé.', 'The longer base must be greater than or equal to the shorter base. Check both measurements.'));
  return { value: compileExpression(formula.expression, language).evaluate(values), values };
}

const unit = (id, label, scale) => ({ id, label, scale });
export const UNIT_GROUPS = [
  { id: 'length', title: 'Độ dài', units: [unit('m', 'Mét · m', 1), unit('cm', 'Xentimét · cm', 0.01), unit('km', 'Kilômét · km', 1000), unit('hm', 'Héctômét · hm', 100), unit('dam', 'Đềcamét · dam', 10), unit('dm', 'Đềximét · dm', 0.1), unit('mm', 'Milimét · mm', 0.001)] },
  { id: 'area', title: 'Diện tích', units: [unit('m²', 'Mét vuông · m²', 1), unit('cm²', 'Xentimét vuông · cm²', 1e-4), unit('km²', 'Kilômét vuông · km²', 1e6), unit('ha', 'Hécta · ha', 1e4), unit('dm²', 'Đềximét vuông · dm²', 0.01), unit('mm²', 'Milimét vuông · mm²', 1e-6)] },
  { id: 'volume', title: 'Thể tích', units: [unit('L', 'Lít · L', 1), unit('mL', 'Mililít · mL', 0.001), unit('m³', 'Mét khối · m³', 1000), unit('dm³', 'Đềximét khối · dm³', 1), unit('cm³', 'Xentimét khối · cm³', 0.001)] },
  { id: 'mass', title: 'Khối lượng', units: [unit('kg', 'Kilôgam · kg', 1), unit('g', 'Gam · g', 0.001), unit('t', 'Tấn', 1000), unit('tạ', 'Tạ', 100), unit('yến', 'Yến', 10)] },
  { id: 'time', title: 'Thời gian', units: [unit('h', 'Giờ', 3600), unit('min', 'Phút', 60), unit('s', 'Giây', 1), unit('ngày', 'Ngày', 86400), unit('tuần', 'Tuần', 604800)] },
  { id: 'speed', title: 'Vận tốc · Lớp 5', units: [unit('km/h', 'Kilômét/giờ · km/giờ', 1 / 3.6), unit('m/s', 'Mét/giây · m/giây', 1), unit('m/min', 'Mét/phút · m/phút', 1 / 60)] }
];

export function convertUnit(groupId, rawValue, fromId, toId, language = 'vi') {
  const group = UNIT_GROUPS.find((item) => item.id === groupId);
  const from = group?.units.find((item) => item.id === fromId);
  const to = group?.units.find((item) => item.id === toId);
  if (!from || !to) throw new Error(language === 'en' ? 'Choose two units from the same measurement group.' : 'Hãy chọn hai đơn vị thuộc cùng một đại lượng.');
  const value = readNumber(rawValue, undefined, language);
  if (value < 0) throw new Error(language === 'en' ? 'Enter a measurement greater than or equal to 0.' : 'Em hãy nhập số lớn hơn hoặc bằng 0 cho số đo cần đổi.');
  if (fromId === toId) return value;
  return finite(value * (from.scale / to.scale), language);
}

const EN_FORMULAS = {
  rectangle: ['Rectangle area', ['Length', 'Width'], 'Area = length × width. Both measurements must use the same unit. cm² means square centimeters.'],
  'rectangle-perimeter': ['Rectangle perimeter', ['Length', 'Width'], 'Perimeter is the distance around a shape. Add length and width, then multiply by 2.'],
  'square-area': ['Square area', ['Side length'], 'The area of a square is its side length multiplied by itself.'],
  'square-perimeter': ['Square perimeter', ['Side length'], 'A square has 4 equal sides. Multiply the side length by 4.'],
  triangle: ['Triangle area', ['Base', 'Corresponding height'], 'The height must be perpendicular to the chosen base.'],
  parallelogram: ['Parallelogram area', ['Base', 'Height'], 'Multiply the base by its corresponding height. Do not confuse the height with a sloping side.'],
  rhombus: ['Rhombus area', ['First diagonal', 'Second diagonal'], 'Multiply the two diagonal lengths and divide by 2. Both diagonals must use the same unit.'],
  trapezoid: ['Trapezoid area', ['Longer base', 'Shorter base', 'Height'], 'Add the two bases, multiply by the height, then divide by 2. The height is perpendicular to both bases.'],
  'circle-perimeter': ['Circle circumference', ['Radius'], 'The diameter is twice the radius. In primary-school math, use 3.14 as an approximation for pi.'],
  circle: ['Circle area', ['Radius'], 'Multiply the radius by itself, then multiply by 3.14, as in primary-school math.'],
  cuboid: ['Cuboid volume', ['Length', 'Width', 'Height'], 'Volume = length × width × height. cm³ means cubic centimeters.'],
  cube: ['Cube volume', ['Side length'], 'A cube has equal edges. Multiply the side length by itself, then by the side length once more.'],
  average: ['Average of 3 numbers', ['First number', 'Second number', 'Third number'], 'To find the average, add the numbers and divide by how many numbers there are (3 here).'],
  percent: ['Percentage of two numbers', ['Compared number', 'Reference number'], 'Divide the first number by the second, multiply by 100 and add %. For example, 5 is 25% of 20.'],
  speed: ['Speed · Grade 5', ['Distance', 'Time'], 'Speed = distance ÷ time. The number of kilometers traveled in 1 hour is the speed in km/h.']
};

export function unitLabel(id, language = 'vi') {
  const labels = language === 'en'
    ? { t: 'tonne', 'tạ': 'quintal', 'yến': '10-kg unit', min: 'min', h: 'h', s: 's', 'ngày': 'day', 'tuần': 'week', 'giờ': 'h', 'km/giờ': 'km/h', 'm/giây': 'm/s', 'm/phút': 'm/min' }
    : { t: 'tấn', min: 'phút', h: 'giờ', s: 'giây', 'km/h': 'km/giờ', 'm/s': 'm/giây', 'm/min': 'm/phút' };
  return labels[id] ?? id;
}

export function getFormulas(language = 'vi') {
  if (language !== 'en') return FORMULAS;
  return FORMULAS.map((formula) => {
    const [title, labels, note] = EN_FORMULAS[formula.id];
    return {
      ...formula, title, note, display: formula.display.replaceAll('3,14', '3.14'), unit: unitLabel(formula.unit, language),
      fields: formula.fields.map((input, index) => ({ ...input, label: labels[index], unit: unitLabel(input.unit, language) }))
    };
  });
}

export function getUnitGroups(language = 'vi') {
  if (language !== 'en') return UNIT_GROUPS;
  const titles = { length: 'Length', area: 'Area', volume: 'Volume', mass: 'Mass', time: 'Time', speed: 'Speed · Grade 5' };
  const labels = {
    m: 'Meter · m', cm: 'Centimeter · cm', km: 'Kilometer · km', hm: 'Hectometer · hm', dam: 'Decameter · dam', dm: 'Decimeter · dm', mm: 'Millimeter · mm',
    'm²': 'Square meter · m²', 'cm²': 'Square centimeter · cm²', 'km²': 'Square kilometer · km²', ha: 'Hectare · ha', 'dm²': 'Square decimeter · dm²', 'mm²': 'Square millimeter · mm²',
    L: 'Liter · L', mL: 'Milliliter · mL', 'm³': 'Cubic meter · m³', 'dm³': 'Cubic decimeter · dm³', 'cm³': 'Cubic centimeter · cm³',
    kg: 'Kilogram · kg', g: 'Gram · g', t: 'Tonne · 1000 kg', 'tạ': 'Quintal · 100 kg', 'yến': 'Ten kilograms · 10 kg',
    h: 'Hour', min: 'Minute', s: 'Second', 'ngày': 'Day', 'tuần': 'Week',
    'km/h': 'Kilometers/hour · km/h', 'm/s': 'Meters/second · m/s', 'm/min': 'Meters/minute · m/min'
  };
  return UNIT_GROUPS.map((group) => ({ ...group, title: titles[group.id], units: group.units.map((item) => ({ ...item, label: labels[item.id] })) }));
}
