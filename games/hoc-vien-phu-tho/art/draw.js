/**
 * CanvasGraphics adapter & drawing primitives
 * Faithfully ports Phaser Graphics to HTML5 Canvas2D
 */

export const INK = 0x1f2a44;

export const hex = (s) =>
  typeof s === "number" ? s : parseInt(String(s).replace("#", ""), 16);

/** Làm sáng (f > 0) hoặc tối (f < 0) một màu số nguyên. */
export function shade(color, f) {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const mix = (c) => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f));
  return (mix(r) << 16) | (mix(g) << 8) | mix(b);
}

function colorToRgba(color, alpha = 1) {
  if (color === null || color === undefined) return "transparent";
  let num = typeof color === "number" ? color : parseInt(String(color).replace("#", ""), 16);
  if (Number.isNaN(num)) num = 0;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
}

export class CanvasGraphics {
  constructor(ctx) {
    this.ctx = ctx;
    this._currentFill = "#000000";
    this._currentFillAlpha = 1;
    this._currentStroke = "#000000";
    this._currentStrokeAlpha = 1;
    this._currentLineWidth = 1;
  }

  fillStyle(color, alpha = 1) {
    this._currentFillAlpha = alpha;
    this._currentFill = colorToRgba(color, alpha);
    this.ctx.fillStyle = this._currentFill;
    return this;
  }

  lineStyle(width, color, alpha = 1) {
    this._currentLineWidth = width;
    this._currentStrokeAlpha = alpha;
    this._currentStroke = colorToRgba(color, alpha);
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = this._currentStroke;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    return this;
  }

  fillRoundedRect(x, y, w, h, r = 0) {
    if (w <= 0 || h <= 0) return this;
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    this.ctx.fillStyle = this._currentFill;
    this.ctx.beginPath();
    this._roundedRectPath(x, y, w, h, rad);
    this.ctx.fill();
    return this;
  }

  strokeRoundedRect(x, y, w, h, r = 0) {
    if (w <= 0 || h <= 0) return this;
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    this.ctx.strokeStyle = this._currentStroke;
    this.ctx.lineWidth = this._currentLineWidth;
    this.ctx.beginPath();
    this._roundedRectPath(x, y, w, h, rad);
    this.ctx.stroke();
    return this;
  }

  _roundedRectPath(x, y, w, h, r) {
    if (this.ctx.roundRect) {
      this.ctx.roundRect(x, y, w, h, r);
    } else {
      this.ctx.moveTo(x + r, y);
      this.ctx.arcTo(x + w, y, x + w, y + h, r);
      this.ctx.arcTo(x + w, y + h, x, y + h, r);
      this.ctx.arcTo(x, y + h, x, y, r);
      this.ctx.arcTo(x, y, x + w, y, r);
      this.ctx.closePath();
    }
  }

  fillCircle(x, y, r) {
    if (r <= 0) return this;
    this.ctx.fillStyle = this._currentFill;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fill();
    return this;
  }

  strokeCircle(x, y, r) {
    if (r <= 0) return this;
    this.ctx.strokeStyle = this._currentStroke;
    this.ctx.lineWidth = this._currentLineWidth;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.stroke();
    return this;
  }

  fillEllipse(x, y, w, h) {
    const rx = Math.max(0.1, Math.abs(w) / 2);
    const ry = Math.max(0.1, Math.abs(h) / 2);
    this.ctx.fillStyle = this._currentFill;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.fill();
    return this;
  }

  strokeEllipse(x, y, w, h) {
    const rx = Math.max(0.1, Math.abs(w) / 2);
    const ry = Math.max(0.1, Math.abs(h) / 2);
    this.ctx.strokeStyle = this._currentStroke;
    this.ctx.lineWidth = this._currentLineWidth;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.stroke();
    return this;
  }

  fillRect(x, y, w, h) {
    this.ctx.fillStyle = this._currentFill;
    this.ctx.fillRect(x, y, w, h);
    return this;
  }

  strokeRect(x, y, w, h) {
    this.ctx.strokeStyle = this._currentStroke;
    this.ctx.lineWidth = this._currentLineWidth;
    this.ctx.strokeRect(x, y, w, h);
    return this;
  }

  beginPath() {
    this.ctx.beginPath();
    return this;
  }

  moveTo(x, y) {
    this.ctx.moveTo(x, y);
    return this;
  }

  lineTo(x, y) {
    this.ctx.lineTo(x, y);
    return this;
  }

  closePath() {
    this.ctx.closePath();
    return this;
  }

  fillPath() {
    this.ctx.fillStyle = this._currentFill;
    this.ctx.fill();
    return this;
  }

  strokePath() {
    this.ctx.strokeStyle = this._currentStroke;
    this.ctx.lineWidth = this._currentLineWidth;
    this.ctx.stroke();
    return this;
  }

  lineBetween(x1, y1, x2, y2) {
    this.ctx.strokeStyle = this._currentStroke;
    this.ctx.lineWidth = this._currentLineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    return this;
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
    this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    return this;
  }

  clear() {
    // Clear the active canvas or transform area
    return this;
  }

  save() {
    this.ctx.save();
    return this;
  }

  restore() {
    this.ctx.restore();
    return this;
  }

  translateCanvas(x, y) {
    this.ctx.translate(x, y);
    return this;
  }

  rotateCanvas(rad) {
    this.ctx.rotate(rad);
    return this;
  }

  scaleCanvas(sx, sy) {
    this.ctx.scale(sx, sy);
    return this;
  }

  destroy() {
    // cleanup
  }
}

export function rr(g, x, y, w, h, r, fill, stroke = INK, sw = 3, alpha = 1) {
  if (fill !== null && fill !== undefined) {
    g.fillStyle(fill, alpha);
    g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  }
  if (stroke !== null && stroke !== undefined && sw > 0) {
    g.lineStyle(sw, stroke, 1);
    g.strokeRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  }
}

export function circ(g, x, y, r, fill, stroke = INK, sw = 3, alpha = 1) {
  if (fill !== null && fill !== undefined) {
    g.fillStyle(fill, alpha);
    g.fillCircle(x, y, r);
  }
  if (stroke !== null && stroke !== undefined && sw > 0) {
    g.lineStyle(sw, stroke, 1);
    g.strokeCircle(x, y, r);
  }
}

/** Elip có tâm (x, y), chiều rộng w và chiều cao h. */
export function ell(g, x, y, w, h, fill, stroke = INK, sw = 3, alpha = 1) {
  if (fill !== null && fill !== undefined) {
    g.fillStyle(fill, alpha);
    g.fillEllipse(x, y, w, h);
  }
  if (stroke !== null && stroke !== undefined && sw > 0) {
    g.lineStyle(sw, stroke, 1);
    g.strokeEllipse(x, y, w, h);
  }
}

/** Đa giác từ mảng [x, y, x, y, ...]. */
export function poly(g, pts, fill, stroke = INK, sw = 3, alpha = 1) {
  if (!pts || pts.length < 4) return;
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  if (fill !== null && fill !== undefined) {
    g.fillStyle(fill, alpha);
    g.fillPath();
  }
  if (stroke !== null && stroke !== undefined && sw > 0) {
    g.lineStyle(sw, stroke, 1);
    g.strokePath();
  }
}

export function line(g, x1, y1, x2, y2, color = INK, sw = 3, alpha = 1) {
  g.lineStyle(sw, color, alpha);
  g.lineBetween(x1, y1, x2, y2);
}

export function starPoints(cx, cy, outer, inner, n = 5, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i * Math.PI) / n;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}

/** Kho lưu trữ texture tạo sẵn dưới dạng canvas offscreen. */
export const TEXTURES = {};

/** Tạo texture từ hàm vẽ. */
export function makeTexture(scene, key, w, h, drawFn) {
  let canvas = null;
  if (typeof document !== "undefined") {
    canvas = document.createElement("canvas");
  } else if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(Math.ceil(w), Math.ceil(h));
  }
  if (!canvas) return null;
  canvas.width = Math.ceil(w);
  canvas.height = Math.ceil(h);
  const ctx = canvas.getContext("2d");
  const g = new CanvasGraphics(ctx);
  drawFn(g, w, h);
  TEXTURES[key] = canvas;
  return canvas;
}
