import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFormula, compileExpression, convertUnit, FORMULAS, formatNumber, readNumber, UNIT_GROUPS } from './calculator.mjs';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * 1e-11, `${actual} != ${expected}`);

test('four-operation expressions follow priority, parentheses and left associativity', () => {
  const cases = [
    ['2+3*4', 14], ['(2+3)*4', 20], ['8/4/2', 1], ['8-4-2', 2],
    ['12.5 + .5', 13], ['-2+3', 1], ['2--3', 5], ['4/0.5', 8]
  ];
  for (const [expression, expected] of cases) close(compileExpression(expression).evaluate(), expected);
  const expression = compileExpression('(a+b)*2+a');
  assert.deepEqual(expression.variables, ['a', 'b']);
  assert.equal(expression.evaluate({ a: 8, b: '3,5' }), 31);
  assert.equal(compileExpression('constructor+1').evaluate({ constructor: 2 }), 3);
  assert.throws(() => compileExpression('constructor').evaluate({}), /Thiếu giá trị/);
});

test('invalid input, advanced syntax, missing values and division by zero are explicit errors', () => {
  for (const expression of ['', '2(3)', '2a', 'a b', '2+', '(1+2', '1+2)', 'sqrt(4)', 'sin(30)', '2^3', '1,5+2', 'Math.random()', 'alert(1)', 'x=2', '[]', '1;2']) {
    assert.throws(() => compileExpression(expression), Error, expression);
  }
  assert.throws(() => compileExpression('1/(2-2)').evaluate(), /chia cho 0/);
  assert.throws(() => compileExpression('a*10').evaluate({ a: '1e308' }), /vượt giới hạn/);
  assert.throws(() => compileExpression('a+1').evaluate({ a: '' }), /Biến a/);
  assert.throws(() => compileExpression('1'.repeat(501)), /500/);
  assert.throws(() => compileExpression(Array(102).fill('1').join('+')), /200/);
  assert.throws(() => compileExpression(Array.from({ length: 21 }, (_, i) => `a${i}`).join('+')), /20 biến/);
  assert.equal(compileExpression(`${'('.repeat(90)}2${')'.repeat(90)}`).evaluate(), 2);
});

test('numeric fields accept Vietnamese decimals but reject blank, partial, infinite or grouped input', () => {
  for (const [text, expected] of [[' 1,5 ', 1.5], ['-2.5e-2', -0.025], ['0', 0]]) assert.equal(readNumber(text), expected);
  for (const text of ['', ' ', null, undefined, '12abc', '1,234.5', '1 000', '0x10', 'Infinity', '1e999']) assert.throws(() => readNumber(text));
  assert.notEqual(formatNumber(1e-15), '0');
  assert.equal(formatNumber(1.25), '1,25');
});

test('primary-school presets compute worked examples, using 3.14 for circles', () => {
  const expected = new Map([
    ['rectangle', 40], ['rectangle-perimeter', 26], ['square-area', 25], ['square-perimeter', 20],
    ['triangle', 12], ['parallelogram', 24], ['rhombus', 24], ['trapezoid', 30],
    ['circle-perimeter', 18.84], ['circle', 28.26], ['cuboid', 60], ['cube', 27],
    ['average', 8], ['percent', 25], ['speed', 40]
  ]);
  for (const formula of FORMULAS) {
    const values = Object.fromEntries(formula.fields.map((input) => [input.id, input.value]));
    close(calculateFormula(formula.id, values).value, expected.get(formula.id));
    for (const input of formula.fields) {
      assert.throws(() => calculateFormula(formula.id, { ...values, [input.id]: '' }), /nhập một số/);
      assert.throws(() => calculateFormula(formula.id, { ...values, [input.id]: -1 }), /phải/);
      if (input.positive) assert.throws(() => calculateFormula(formula.id, { ...values, [input.id]: 0 }), /lớn hơn 0/);
    }
  }
  assert.equal(calculateFormula('speed', { s: 0, t: 1 }).value, 0);
  assert.equal(calculateFormula('average', { a: 0, b: 0, c: 0 }).value, 0);
  assert.equal(calculateFormula('percent', { a: 30, b: 20 }).value, 150);
  assert.throws(() => calculateFormula('rectangle', { a: 2, b: 3 }), /Chiều dài/);
  assert.throws(() => calculateFormula('trapezoid', { a: 2, b: 3, h: 4 }), /Đáy lớn/);
  assert.throws(() => calculateFormula('missing', {}), /không hợp lệ/);
});

test('metric units include primary-school length, squared/cubed scales, mass, time and speed', () => {
  const cases = [
    ['length', 1, 'km', 'm', 1000], ['length', 1, 'hm', 'dam', 10],
    ['length', 1, 'dm', 'mm', 100], ['area', 1, 'm²', 'cm²', 10000],
    ['area', 1, 'ha', 'm²', 10000], ['area', 1, 'm²', 'dm²', 100],
    ['volume', 1, 'm³', 'mL', 1e6], ['volume', 1, 'cm³', 'mL', 1],
    ['mass', 1, 't', 'g', 1e6], ['mass', 1, 'tạ', 'yến', 10],
    ['time', 1, 'ngày', 's', 86400], ['time', 1, 'tuần', 'ngày', 7],
    ['speed', 36, 'km/h', 'm/s', 10], ['speed', 60, 'km/h', 'm/min', 1000]
  ];
  for (const [group, value, from, to, expected] of cases) close(convertUnit(group, value, from, to), expected);
  for (const group of UNIT_GROUPS) {
    for (const from of group.units) {
      for (const to of group.units) {
        const converted = convertUnit(group.id, 123.45, from.id, to.id);
        close(convertUnit(group.id, converted, to.id, from.id), 123.45);
      }
    }
  }
});

test('converter refuses negative measures, incompatible units, blanks and overflow', () => {
  assert.equal(convertUnit('length', 0, 'm', 'cm'), 0);
  close(convertUnit('length', '1e307', 'km', 'hm'), 1e308);
  assert.throws(() => convertUnit('length', -1, 'm', 'cm'), /lớn hơn hoặc bằng 0/);
  assert.throws(() => convertUnit('length', 1, 'm', 'kg'), /cùng một/);
  assert.throws(() => convertUnit('missing', 1, 'm', 'm'), /cùng một/);
  assert.throws(() => convertUnit('length', '', 'm', 'm'), /nhập một số/);
  assert.throws(() => convertUnit('length', '1e308', 'km', 'm'), /vượt giới hạn/);
});
