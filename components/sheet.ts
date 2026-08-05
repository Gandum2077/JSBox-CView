import { cvid } from "../utils/cvid";
import { Base } from "./base";

/** UIKit 模态展示样式的数值映射。 */
const UIModalPresentationStyle = {
  automatic: -2,
  pageSheet: 1,
  formSheet: 2,
  fullScreen: 0,
  currentContext: 3,
  custom: 4,
  overFullScreen: 5,
  overCurrentContext: 6,
  popover: 7,
  none: -1,
};

/**
 * 使用原生 `UIViewController` 展示任意 CView 内容的模态面板。
 *
 * 组件主要用于 `pageSheet`（`1`）和 `formSheet`（`2`），也接受其他 `UIModalPresentationStyle` 数值。
 * 调用 {@link present} 时才创建控制器，并将传入 CView 的根布局覆盖为 `$layout.fill` 后加入控制器视图；如果该组件的原始根布局
 * 仍会在其他位置使用，应为面板单独创建实例。`interactiveDismissalDisabled` 可阻止用户下拉关闭面板，
 * `dismissalHandler` 则在控制器执行 `viewDidDisappear` 后触发。
 *
 * 需要带导航栏的表单面板时优先使用 `DialogSheet`；仅需展示自定义 CView 内容时使用本类。
 * @template T - 面板承载的 CView 类型。
 * @template U - CView 根视图的实例类型。
 * @template R - CView 根视图的定义类型。
 * @example
 * ```ts
 * const sheet = new Sheet({
 *   presentMode: 1,
 *   cview: contentView,
 *   dismissalHandler: () => console.log("sheet closed"),
 * })
 *
 * sheet.present()
 * ```
 */
export class Sheet<T extends Base<U, R>, U extends AllUIView, R extends UiTypes.AllViewOptions> {
  /** 用于注册 Objective-C 控制器类的唯一名称。 */
  id: string;

  /** 展示和关闭面板时是否使用动画。 */
  _animated: boolean;

  /** UIKit 模态展示样式。 */
  _presentMode: number;

  /** 是否阻止用户通过下拉手势关闭面板。 */
  _interactiveDismissalDisabled: boolean;

  /** 模态控制器根视图的背景颜色。 */
  _bgcolor: UIColor;

  /** 面板中显示的 CView 内容。 */
  _cview?: T;

  /** 控制器视图消失后执行的回调。 */
  _dismissalHandler?: () => void;

  /** 当前创建的 Objective-C `UIViewController`。 */
  _PSViewController: any;

  /** 当前控制器的原生根视图。 */
  _PSViewControllerView: any;

  /** 创建模态面板配置。 */
  constructor({
    presentMode = UIModalPresentationStyle.pageSheet,
    animated = true,
    interactiveDismissalDisabled = false,
    bgcolor = $color("secondarySurface"),
    cview,
    dismissalHandler,
  }: {
    /** UIKit 模态展示样式，默认为 `pageSheet`（`1`）。 */
    presentMode?: number;
    /** 展示和关闭时是否使用动画，默认为 `true`。 */
    animated?: boolean;
    /** 是否禁用下拉关闭，默认为 `false`。 */
    interactiveDismissalDisabled?: boolean;
    /** 控制器根视图背景色，默认为 `secondarySurface`。 */
    bgcolor?: UIColor;
    /** 要填充到面板中的 CView 内容。 */
    cview?: T;
    /** 控制器视图消失后执行的回调。 */
    dismissalHandler?: () => void;
  }) {
    this._animated = animated;
    this._presentMode = presentMode;
    this._interactiveDismissalDisabled = interactiveDismissalDisabled;
    this._bgcolor = bgcolor;
    this._cview = cview;
    this._dismissalHandler = dismissalHandler;
    this.id = cvid.newId;
  }

  /** 创建并配置本次展示使用的原生控制器。 */
  _create() {
    this._define();
    this._PSViewController = $objc(this.id).invoke("alloc.init");
    this._PSViewControllerView = this._PSViewController.$view();
    this._PSViewControllerView.$setBackgroundColor(this._bgcolor);
    this._PSViewController.$setModalPresentationStyle(this._presentMode);
    if (this._interactiveDismissalDisabled) this._PSViewController.$setModalInPresentation(true);
    if (this._cview) this._add(this._cview);
  }

  /** 注册用于接收控制器消失事件的 Objective-C 类。 */
  _define() {
    $define({
      type: this.id + ": UIViewController",
      events: {
        "viewDidDisappear:": () => {
          if (this._dismissalHandler) this._dismissalHandler();
        },
      },
    });
  }

  /**
   * 将 CView 加入当前控制器，并把它的根布局覆盖为 `$layout.fill`。
   * @param cview - 要加入面板的 CView。
   */
  _add(cview: T) {
    const definition = cview.definition;
    definition.layout = $layout.fill;
    this._PSViewControllerView.jsValue().add(definition);
  }

  /** 创建控制器并从当前 `$ui.controller` 展示模态面板。 */
  present() {
    this._create();
    $ui.controller.ocValue().invoke("presentModalViewController:animated", this._PSViewController, this._animated);
  }

  /** 按当前动画设置关闭已展示的模态面板。 */
  dismiss() {
    this._PSViewController.invoke("dismissModalViewControllerAnimated", this._animated);
  }
}
