/**
 * 获取当前关键窗口的尺寸。
 * @returns 当前 `UIWindow` 的尺寸，单位为点。
 */
export function getWindowSize(): JBSize {
  const window = $objc("UIWindow").$keyWindow().jsValue();
  return window.size;
}

/**
 * 测量文本在单行显示时需要的宽度。
 *
 * 宽度会向上取整后加上 `inset`；字体默认为 17 点，`inset` 默认为 3 点。
 * @param text - 待测量的文本。
 * @returns 文本宽度，单位为点。
 */
export function getTextWidth(text: string, { font = $font(17), inset = 3 } = {}): number {
  return (
    Math.ceil(
      $text.sizeThatFits({
        text,
        width: 10000,
        font,
        lineSpacing: 0,
      }).width,
    ) + inset
  );
}

/**
 * 测量文本在指定宽度内显示时需要的高度。
 *
 * 高度会向上取整后加上 `inset`；默认宽度为 300 点、字体为 17 点。
 * @param text - 待测量的文本。
 * @returns 文本高度，单位为点。
 */
export function getTextHeight(
  text: string,
  { width = 300, font = $font(17), inset = 3, lineSpacing = 0 } = {},
): number {
  return (
    Math.ceil(
      $text.sizeThatFits({
        text,
        width,
        font,
        lineSpacing,
      }).height,
    ) + inset
  );
}

/**
 * 沿父视图链累计视图的绝对位置。
 *
 * 累计会在包含 `endView` 的层级处停止；省略时持续到顶层窗口。此函数不处理旋转或缩放变换。
 * @param view - 待计算的已加载视图。
 * @param endView - 停止累计的可选祖先视图。
 * @returns 累计后的矩形。
 */
export function absoluteFrame(view: AllUIView, endView?: AllUIView): JBRect {
  const frame = view.frame;
  let superView = view.super;
  while (superView) {
    frame.x += superView.frame.x - superView.bounds.x;
    frame.y += superView.frame.y - superView.bounds.y;
    if (endView && superView === endView) break;
    superView = superView.super;
  }
  return frame;
}

/**
 * `setLayer` 可直接使用的常用图层样式。
 *
 * 包含无效果、圆角阴影、文字阴影、圆形视图阴影和 Toast 阴影预设。
 */
export const layerCommonOptions = {
  none: {
    cornerRadius: 0,
    shadowRadius: 0,
    shadowOpacity: 0,
    shadowOffset: $size(0, 0),
    shadowColor: $color("clear"),
  },
  roundedShadow: {
    cornerRadius: 12,
    shadowRadius: 10,
    shadowOpacity: 1,
    shadowOffset: $size(0, 0),
    shadowColor: $color("black"),
  },
  textShadow: {
    cornerRadius: 0,
    shadowRadius: 1.2,
    shadowOpacity: 1,
    shadowOffset: $size(0, 1),
    shadowColor: $color("black"),
  },
  circleViewShadow: {
    cornerRadius: 25,
    shadowRadius: 3,
    shadowOpacity: 0.6,
    shadowOffset: $size(0, 3),
    shadowColor: $color("black"),
  },
  toastShadows: {
    cornerRadius: 15,
    shadowRadius: 8,
    shadowOpacity: 0.35,
    shadowOffset: $size(0, 0),
    shadowColor: $color("black"),
  },
};

/**
 * 将圆角和阴影选项应用到已加载视图的 `CALayer`。
 *
 * 选项包括 `cornerRadius`、`shadowRadius`、`shadowOpacity`、`shadowOffset` 和 `shadowColor`。
 * 如果视图同时使用 `clipToBounds`，超出边界的阴影会被裁剪。
 * @param view - 待设置图层样式的已加载 JSBox 视图。
 */
export function setLayer(
  view: AllUIView,
  {
    cornerRadius = 0,
    shadowRadius = 0,
    shadowOpacity = 0,
    shadowOffset = $size(0, 0),
    shadowColor = $color("clear"),
  } = {},
): void {
  const layer = view.ocValue().invoke("layer");
  layer.invoke("setCornerRadius", cornerRadius);
  layer.invoke("setShadowRadius", shadowRadius);
  layer.invoke("setShadowOpacity", shadowOpacity);
  layer.invoke("setShadowOffset", shadowOffset);
  layer.invoke("setShadowColor", shadowColor.ocValue().invoke("CGColor"));
}
