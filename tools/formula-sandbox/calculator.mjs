const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function readNumber(raw, label = 'Giá trị') {
  const text = String(raw).trim().replace(',', '.');
  if (!NUMBER.test(text) || !Number.isFinite(Number(text))) {
    throw new Error(`${label}: hãy nhập một số hợp lệ, không dùng dấu phân cách hàng nghìn.`);
  }
  return Number(text);
}

function finite(value) {
  if (!Number.isFinite(value)) throw new Error('Kết quả vượt giới hạn tính toán. Em hãy thử các số nhỏ hơn.');
  return value;
}

export function formatNumber(value) {
  finite(value);
  return new Intl.NumberFormat('vi-VN', {
    maximumSignificantDigits: 12,
    useGrouping: false,
    notation: value !== 0 && (Math.abs(value) >= 1e12 || Math.abs(value) < 1e-6) ? 'scientific' : 'standard'
  }).format(Object.is(value, -0) ? 0 : value);
}

export function compileExpression(source) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('Hãy nhập một biểu thức.');
  if (source.length > 500) throw new Error('Biểu thức dài tối đa 500 ký tự.');
  const tokens = [];
  const lexer = /\s*(?:(\d+(?:\.\d*)?|\.\d+)|([A-Za-z][A-Za-z0-9_]*)|([+\-*/()]))/y;
  let position = 0;
  while (position < source.trimEnd().length) {
    lexer.lastIndex = position;
    const match = lexer.exec(source);
    if (!match) throw new Error(`Ký tự không hợp lệ ở vị trí ${position + 1}. Dùng dấu chấm cho số thập phân trong biểu thức.`);
    tokens.push(match[1] ? { type: 'number', value: finite(Number(match[1])) }
      : match[2] ? { type: 'name', value: match[2] } : { type: match[3] });
    position = lexer.lastIndex;
    if (tokens.length > 200) throw new Error('Biểu thức quá phức tạp (tối đa 200 thành phần).');
  }
  let index = 0;
  const variables = new Set();
  const take = (type) => tokens[index]?.type === type ? tokens[index++] : null;
  const expect = (type) => {
    if (!take(type)) throw new Error(`Thiếu dấu "${type}" hoặc biểu thức chưa hoàn chỉnh.`);
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
    if (!name) throw new Error('Thiếu số, biến hoặc dấu ngoặc hợp lệ.');
    if (tokens[index]?.type === '(') throw new Error('Dùng dấu * để nhân với một biểu thức trong ngoặc, ví dụ: a*(b+c).');
    variables.add(name.value);
    if (variables.size > 20) throw new Error('Dùng tối đa 20 biến trong một biểu thức.');
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
  if (index !== tokens.length) throw new Error('Dư dấu ngoặc hoặc thiếu phép toán. Viết phép nhân bằng dấu * (ví dụ: 2*x).');

  function evaluateNode(node, values) {
    if (node.type === 'number') return node.value;
    if (node.type === 'variable') {
      if (!Object.hasOwn(values, node.name)) throw new Error(`Thiếu giá trị cho biến ${node.name}.`);
      return readNumber(values[node.name], `Biến ${node.name}`);
    }
    if (node.type === 'negate') return -evaluateNode(node.argument, values);
    const left = evaluateNode(node.left, values);
    const right = evaluateNode(node.right, values);
    switch (node.type) {
      case '+': return finite(left + right);
      case '-': return finite(left - right);
      case '*': return finite(left * right);
      case '/':
        if (right === 0) throw new Error('Không thể chia cho 0.');
        return finite(left / right);
      default: throw new Error('Phép toán không được hỗ trợ.');
    }
  }
  return {
    variables: [...variables],
    evaluate(values = {}) {
      return finite(evaluateNode(root, values));
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

export function calculateFormula(id, rawValues) {
  const formula = FORMULAS.find((item) => item.id === id);
  if (!formula) throw new Error('Công thức không hợp lệ.');
  const values = {};
  for (const input of formula.fields) {
    const value = readNumber(rawValues[input.id] ?? '', input.label);
    if (input.positive ? value <= 0 : value < 0) {
      throw new Error(`${input.label} phải ${input.positive ? 'lớn hơn' : 'lớn hơn hoặc bằng'} 0.`);
    }
    values[input.id] = value;
  }
  if (id === 'rectangle' || id === 'rectangle-perimeter' || id === 'cuboid') {
    if (values.a < values.b) throw new Error('Chiều dài cần lớn hơn hoặc bằng chiều rộng. Em hãy đổi lại hai số đo nhé.');
  }
  if (id === 'trapezoid' && values.a < values.b) throw new Error('Đáy lớn cần lớn hơn hoặc bằng đáy bé. Em hãy kiểm tra hai số đo nhé.');
  return { value: compileExpression(formula.expression).evaluate(values), values };
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

export function convertUnit(groupId, rawValue, fromId, toId) {
  const group = UNIT_GROUPS.find((item) => item.id === groupId);
  const from = group?.units.find((item) => item.id === fromId);
  const to = group?.units.find((item) => item.id === toId);
  if (!from || !to) throw new Error('Hãy chọn hai đơn vị thuộc cùng một đại lượng.');
  const value = readNumber(rawValue);
  if (value < 0) throw new Error('Em hãy nhập số lớn hơn hoặc bằng 0 cho số đo cần đổi.');
  if (fromId === toId) return value;
  return finite(value * (from.scale / to.scale));
}
