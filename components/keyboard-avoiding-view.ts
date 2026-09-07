import { Base } from "./base";
import { cvid } from "../utils/cvid";

/** `KeyboardAvoidingView` 的原生键盘布局行为。 */
export interface KeyboardAvoidingViewProps extends UiTypes.ViewProps {
  /**
   * 是否让布局参考线跟随 iPad 浮动或分离键盘，默认为 `false`。
   *
   * 开启后，浮动键盘可能使整个内容区域缩短到键盘顶部；普通全宽表单通常不需要开启。
   */
  followsUndockedKeyboard?: boolean;
  /**
   * 键盘隐藏时是否让布局参考线包含底部安全区域，默认为 `false`。
   *
   * 此 UIKit 属性从 iOS 17 起可用；更早的系统会保留系统默认行为。
   */
  usesBottomSafeArea?: boolean;
}

/**
 * 使用 UIKit `UIKeyboardLayoutGuide` 调整内容可用高度的 Runtime UIView。
 *
 * 组件注册一个独立的 Objective-C `UIView` 子类，并把 `content` 的顶部、左右边缘约束到宿主，底部约束到
 * `keyboardLayoutGuide.topAnchor`。约束只安装一次，后续键盘移动、旋转和关闭动画全部由 UIKit 驱动，不依赖
 * JSBox 根页面的 `keyboardHeightChanged` 回调。
 *
 * 本组件需要 iOS 15 或更高版本。传入的 `content` 根布局会被原生 NSLayoutAnchor 约束替代，应为本组件创建专用
 * CView 实例。组件调整的是内容区域高度；内容为 Scroll、List 或 Matrix 时，仍可能需要把第一响应者滚动到可见位置。
 * @example
 * ```ts
 * const avoidingView = new KeyboardAvoidingView({
 *   props: { content: formView },
 *   layout: $layout.fill,
 * });
 * ```
 */
export class KeyboardAvoidingView extends Base<UIView, UiTypes.RuntimeOptions> {
  private readonly _ocClassName: string;
  private readonly _content: Base<any, any>;
  private readonly _followsUndockedKeyboard: boolean;
  private readonly _usesBottomSafeArea: boolean;

  protected _defineView: () => UiTypes.RuntimeOptions;

  /** 创建由原生键盘布局参考线约束内容的 Runtime UIView。 */
  constructor({
    props,
    layout = $layout.fill,
    events = {},
  }: {
    /** 内容组件、Runtime UIView 外观和键盘布局选项。 */
    props: KeyboardAvoidingViewProps & {
      /** 要随键盘调整可用高度的内容组件。 */
      content: Base<any, any>;
    };
    /** Runtime UIView 在其父视图中的布局。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** Runtime UIView 的 JSBox 基础视图事件。 */
    events?: UiTypes.BaseViewEvents<UIView>;
  }) {
    super();
    this._ocClassName = `KeyboardAvoidingView_${cvid.newId}`;
    this._content = props.content;
    this._followsUndockedKeyboard = props.followsUndockedKeyboard ?? false;
    this._usesBottomSafeArea = props.usesBottomSafeArea ?? false;

    $define({ type: `${this._ocClassName}: UIView` });

    const { content: _content, followsUndockedKeyboard: _follows, usesBottomSafeArea: _safeArea, ...viewProps } = props;

    this._defineView = () => ({
      type: "runtime",
      props: {
        ...viewProps,
        // Sheet creates a new controller for every presentation. A fresh native host prevents
        // JSBox from appending another copy of content to a Runtime UIView retained by an earlier presentation.
        view: $objc(this._ocClassName).$new(),
      },
      layout,
      events,
      views: [this.makeContentDefinition()],
    });
  }

  /**
   * 创建由原生 NSLayoutAnchor 接管根布局的内容定义。
   * @returns 移除原根布局并保留其既有事件的 JSBox 视图定义。
   */
  private makeContentDefinition(): UiTypes.AllViewOptions {
    const definition = this._content.definition;
    const contentEvents = definition.events ?? {};
    const originalReady = contentEvents.ready;

    definition.layout = undefined;
    definition.events = {
      ...contentEvents,
      ready: (sender: AllUIView) => {
        originalReady?.(sender);
        this.installKeyboardConstraints(sender);
      },
    };
    return definition;
  }

  /**
   * 将内容四边绑定到 Runtime UIView，并用键盘参考线替代普通底边。
   * @param sender - 已加入 Runtime UIView 的 JSBox 内容根视图。
   */
  private installKeyboardConstraints(sender: AllUIView) {
    const contentView = sender.ocValue();
    const hostView = contentView.$superview();
    if (!hostView) return;

    const keyboardGuide = hostView.$keyboardLayoutGuide();
    keyboardGuide.$setFollowsUndockedKeyboard(this._followsUndockedKeyboard);

    // usesBottomSafeArea was added in iOS 17. Avoid sending an unavailable selector on older systems.
    const systemMajorVersion = Number.parseInt($device.info.version, 10);
    if (systemMajorVersion >= 17) keyboardGuide.$setUsesBottomSafeArea(this._usesBottomSafeArea);

    contentView.$setTranslatesAutoresizingMaskIntoConstraints(false);
    const constraints = [
      contentView.$topAnchor().$constraintEqualToAnchor(hostView.$topAnchor()),
      contentView.$leadingAnchor().$constraintEqualToAnchor(hostView.$leadingAnchor()),
      contentView.$trailingAnchor().$constraintEqualToAnchor(hostView.$trailingAnchor()),
      contentView.$bottomAnchor().$constraintEqualToAnchor(keyboardGuide.$topAnchor()),
    ];
    $objc("NSLayoutConstraint").$activateConstraints(constraints);
  }
}
