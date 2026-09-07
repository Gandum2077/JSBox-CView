import { BaseController, BaseControllerEvents, BaseControllerProps } from "./base-controller";
import { router } from "./controller-router";

/** `KeyboardAvoidanceController` 的生命周期和键盘事件。 */
export interface KeyboardAvoidanceControllerEvents extends BaseControllerEvents {
  /**
   * 根视图完成键盘避让布局后触发。
   * @param controller - 当前键盘避让控制器。
   * @param height - JSBox 报告的非负有效键盘高度；该值不包含底部安全区域。
   */
  keyboardHeightChanged?: (controller: KeyboardAvoidanceController, height: number) => void;
}

/**
 * 根据 JSBox 根页面的 `keyboardHeightChanged` 事件调整页面根视图的控制器。
 *
 * 键盘隐藏时，根视图填满页面；停靠键盘显示时，根视图底部改为相对 `safeAreaBottom` 上移 JSBox 报告的高度。
 * JSBox 的回调值已经扣除了底部安全区域，因此两者相加正好覆盖完整的停靠键盘高度。
 *
 * 控制器只调整根视图的可用高度，不查找当前第一响应者，也不直接修改内部 ScrollView 的滚动位置。让 List、Matrix
 * 或 Scroll 填满 `rootView`，并在需要时由内容组件负责将正在编辑的字段滚动到新的可见区域。
 *
 * 浮动键盘和分离键盘无法由单一高度完整描述，不属于本控制器的处理范围。只有通过 {@link uirender}、
 * {@link uipush}，或由外部根页面把高度转发给 {@link updateKeyboardHeight} 时，控制器才能收到键盘变化。
 * @example
 * ```ts
 * const controller = new KeyboardAvoidanceController();
 * controller.rootView.views = [formScroll];
 * controller.uirender({ title: "编辑资料" });
 * ```
 */
export class KeyboardAvoidanceController extends BaseController {
  private _keyboardHeight = 0;
  private readonly _keyboardEvents: KeyboardAvoidanceControllerEvents;

  /** 创建根视图初始填满页面的键盘避让控制器。 */
  constructor({
    props,
    events = {},
  }: {
    /** 控制器 ID 和根视图外观。 */
    props?: BaseControllerProps;
    /** 生命周期及键盘高度变化事件。 */
    events?: KeyboardAvoidanceControllerEvents;
  } = {}) {
    super({
      props,
      layout: (make, view) => {
        make.edges.equalTo(view.super);
      },
      events,
    });
    this._keyboardEvents = events;
  }

  /**
   * 应用 JSBox 报告的键盘有效高度并重建根视图底部约束。
   *
   * 此方法会访问已加载的根视图，通常由 {@link uirender} 或 {@link uipush} 自动调用。将控制器嵌入其他根页面时，
   * 可在该页面的 `keyboardHeightChanged` 中手动转发高度。
   * @param height - JSBox `keyboardHeightChanged` 返回的高度；负数会归一化为 `0`。
   */
  updateKeyboardHeight(height: number) {
    const normalizedHeight = Math.max(0, height);
    this._keyboardHeight = normalizedHeight;

    // 如果用户在输入框聚焦时退出控制器的页面，那么上级视图将丢失
    const parent = this.rootView.view?.super;
    if (!this.rootView.view || !parent) return;

    this.rootView.view.remakeLayout((make, view) => {
      make.left.right.top.equalTo(view.super);
      if (normalizedHeight > 0) {
        make.bottom.equalTo(view.super.safeAreaBottom).inset(normalizedHeight);
      } else {
        make.bottom.equalTo(view.super);
      }
    });
    this.rootView.view.relayout();
    this._keyboardEvents.keyboardHeightChanged?.(this, normalizedHeight);
  }

  /**
   * 将控制器设为路由根页面并自动处理键盘高度变化。
   * @param props - `$ui.render` 使用的根页面属性。
   */
  uirender(props: UiTypes.RootViewPrefs): void {
    router.root = this;
    $ui.render({
      props,
      views: [this.rootView.definition],
      events: {
        appeared: () => this.appear(),
        disappeared: () => this.disappear(),
        dealloc: () => this.remove(),
        keyboardHeightChanged: (height) => this.updateKeyboardHeight(height),
      },
    });
  }

  /**
   * 将控制器推入页面栈并自动处理键盘高度变化。
   * @param props - `$ui.push` 使用的根页面属性。
   */
  uipush(props: UiTypes.RootViewPrefs): void {
    $ui.push({
      props,
      views: [this.rootView.definition],
      events: {
        appeared: () => this.appear(),
        disappeared: () => this.disappear(),
        dealloc: () => this.remove(),
        keyboardHeightChanged: (height) => this.updateKeyboardHeight(height),
      },
    });
  }

  /**
   * 最近一次应用的 JSBox 有效键盘高度。
   * @returns 非负高度；键盘隐藏或尚未显示时为 `0`。
   */
  get keyboardHeight() {
    return this._keyboardHeight;
  }
}
