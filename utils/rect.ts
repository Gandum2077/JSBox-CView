/**
 * 获取矩形中心点，或将矩形中心移动到指定位置。
 *
 * 提供 `point` 时会直接修改 `rect.x` 和 `rect.y`，并返回该点。
 * @param rect - 待读取或移动的矩形。
 * @param point - 新的中心点；省略时不修改矩形。
 * @returns 矩形当前或新的中心点。
 */
export function center(rect: JBRect, point?: JBPoint): JBPoint {
  const { x = 0, y = 0, width: w, height: h } = rect;
  if (!point) return $point(x + w / 2, y + h / 2);
  const { x: px, y: py } = point;
  rect.x = px - w / 2;
  rect.y = py - h / 2;
  return point;
}

/**
 * 判断点是否位于矩形内部或边界上。
 * @param rect - 目标矩形。
 * @param point - 待检查的点。
 * @returns 点位于矩形内部或边界上时返回 `true`。
 */
export function containsPoint(rect: JBRect, point: JBPoint): boolean {
  const { x, y, width: w, height: h } = rect;
  const { x: px, y: py } = point;
  return x <= px && px <= x + w && y <= py && py <= y + h;
}

/**
 * 判断一个矩形是否完全位于另一个矩形内。
 * @param rect - 外层矩形。
 * @param otherRect - 待检查的内层矩形。
 * @returns `otherRect` 完全位于 `rect` 内部或边界上时返回 `true`。
 */
export function containsRect(rect: JBRect, otherRect: JBRect): boolean {
  const { x, y, width: w, height: h } = rect;
  const { x: x1, y: y1, width: w1, height: h1 } = otherRect;
  return x <= x1 && y <= y1 && x1 + w1 <= x + w && y1 + h1 <= y + h;
}

/**
 * 判断两个矩形是否存在面积大于零的重叠区域。
 *
 * 仅边界接触不视为相交。
 * @param rect - 第一个矩形。
 * @param otherRect - 第二个矩形。
 * @returns 存在重叠区域时返回 `true`。
 */
export function intersects(rect: JBRect, otherRect: JBRect): boolean {
  const { x, y, width: w, height: h } = rect;
  const { x: x1, y: y1, width: w1, height: h1 } = otherRect;
  return x < x1 + w1 && x1 < x + w && y < y1 + h1 && y1 < y + h;
}

/**
 * 计算两个矩形的交集。
 *
 * 不相交时，返回值的宽度或高度可能为负数；可先使用 `intersects` 判断。
 * @param rect - 第一个矩形。
 * @param otherRect - 第二个矩形。
 * @returns 表示交集的 JSBox 矩形。
 */
export function intersection(rect: JBRect, otherRect: JBRect): JBRect {
  const { x, y, width: w, height: h } = rect;
  const { x: x1, y: y1, width: w1, height: h1 } = otherRect;
  const nx = Math.max(x, x1);
  const nw = Math.min(x + w, x1 + w1) - nx;
  const ny = Math.max(y, y1);
  const nh = Math.min(y + h, y1 + h1) - ny;
  return $rect(nx, ny, nw, nh);
}

/**
 * 计算能同时包含两个矩形的最小矩形。
 * @param rect - 第一个矩形。
 * @param otherRect - 第二个矩形。
 * @returns 包含两个输入矩形的最小矩形。
 */
export function union(rect: JBRect, otherRect: JBRect): JBRect {
  const { x, y, width: w, height: h } = rect;
  const { x: x1, y: y1, width: w1, height: h1 } = otherRect;
  const nx = Math.min(x, x1);
  const nw = Math.max(x + w, x1 + w1) - nx;
  const ny = Math.min(y, y1);
  const nh = Math.max(y + h, y1 + h1) - ny;
  return $rect(nx, ny, nw, nh);
}

/**
 * 按指定偏移量平移矩形。
 * @param rect - 待平移的矩形。
 * @param point - `x` 和 `y` 方向的偏移量。
 * @returns 平移后的新矩形。
 */
export function translate(rect: JBRect, point: JBPoint): JBRect {
  const { x, y, width, height } = rect;
  const { x: x1, y: y1 } = point;
  return $rect(x + x1, y + y1, width, height);
}

/**
 * 使用四边缩进调整矩形。
 *
 * 缩进量超过原尺寸时，返回值的宽度或高度可能为负数。
 * @param rect - 待调整的矩形。
 * @param insets - 上、左、下、右四边缩进量。
 * @returns 应用缩进后的新矩形。
 */
export function inset(rect: JBRect, insets: JBInsets): JBRect {
  const { x, y, width, height } = rect;
  const { top, left, bottom, right } = insets;
  return $rect(x + left, y + top, width - left - right, height - top - bottom);
}
