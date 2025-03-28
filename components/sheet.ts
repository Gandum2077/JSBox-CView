import { cvid } from "../utils/cvid";
import { Base } from "./base";

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
 *
 * 创建新的 UIViewController，主要用于 formSheet 和 pageSheet
 *
 * ## 参数：
 * - presentMode: number, default: 1, pageSheet: 1, formSheet: 2
 * - animated: boolean = true  是否启用动画效果
 * - interactiveDismissalDisabled: boolean = false  是否禁用下拉退出
 * - bgcolor: $color  $color("secondarySurface")
 * - cview: Cview
 * - dismissalHandler: function  退出时的回调
 *
 * ## 方法：
 * - present()
 * - dismiss()
 *
 */
export class Sheet<
  T extends Base<U, R>,
  U extends AllUIView,
  R extends UiTypes.AllViewOptions
> {
  id: string;
  _animated: boolean;
  _presentMode: number;
  _interactiveDismissalDisabled: boolean;
  _bgcolor: UIColor;
  _cview?: T;
  _dismissalHandler?: () => void;
  _PSViewController: any;
  _PSViewControllerView: any;

  constructor({
    presentMode = UIModalPresentationStyle.pageSheet,
    animated = true,
    interactiveDismissalDisabled = false,
    bgcolor = $color("secondarySurface"),
    cview,
    dismissalHandler,
  }: {
    presentMode?: number;
    animated?: boolean;
    interactiveDismissalDisabled?: boolean;
    bgcolor?: UIColor;
    cview?: T;
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

  _create() {
    this._define();
    this._PSViewController = $objc(this.id).invoke("alloc.init");
    this._PSViewControllerView = this._PSViewController.$view();
    this._PSViewControllerView.$setBackgroundColor(this._bgcolor);
    this._PSViewController.$setModalPresentationStyle(this._presentMode);
    if (this._interactiveDismissalDisabled)
      this._PSViewController.$setModalInPresentation(true);
    if (this._cview) this._add(this._cview);
  }

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

  _add(cview: T) {
    const definition = cview.definition;
    definition.layout = $layout.fill;
    this._PSViewControllerView.jsValue().add(definition);
  }

  present() {
    this._create();
    $ui.controller
      .ocValue()
      .invoke(
        "presentModalViewController:animated",
        this._PSViewController,
        this._animated
      );
  }

  dismiss() {
    this._PSViewController.invoke(
      "dismissModalViewControllerAnimated",
      this._animated
    );
  }
}
