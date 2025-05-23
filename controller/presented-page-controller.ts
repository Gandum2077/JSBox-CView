import {
  BaseController,
  BaseControllerProps,
  BaseControllerEvents,
  ControllerRootView,
} from "./base-controller";
import { Sheet } from "../components/sheet";

interface PresentedPageControllerProps extends BaseControllerProps {
  presentMode?: number;
  animated?: boolean;
  interactiveDismissalDisabled?: boolean;
}

interface PresentedPageControllerEvents extends BaseControllerEvents {
  dismissed?: (controller: PresentedPageController) => void;
}

/** # CView PresentedPageController
 *
 * ## Props
 *
 * - presentMode?: number = 1
 * - animated?: boolean = true
 * - interactiveDismissalDisabled?: boolean = false
 * - bgcolor?: UIColor = $color("secondarySurface")
 *
 * ## 专用事件
 *
 * - dismissed: function  退出时的回调
 *
 * ## 专用方法
 *
 * - present() 在 `sheet.present()` 之后会先后执行 `load()` 和 `appear()`
 * - dismiss()
 *
 * ## 布局
 * 此控制器的 layout 必定为 `$layout.fill`，无需自行设定
 */
export class PresentedPageController extends BaseController {
  private _sheet: Sheet<ControllerRootView, UIView, UiTypes.ViewOptions>;
  constructor({
    props,
    layout,
    events,
  }: {
    props?: Partial<PresentedPageControllerProps>;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: PresentedPageControllerEvents;
  } = {}) {
    super({
      props: {
        id: props?.id,
        bgcolor: props?.bgcolor,
      },
      layout,
      events,
    });
    this._sheet = new Sheet<ControllerRootView, UIView, UiTypes.ViewOptions>({
      presentMode: props?.presentMode ?? 1,
      animated: props?.animated ?? true,
      interactiveDismissalDisabled:
        props?.interactiveDismissalDisabled || false,
      bgcolor: props?.bgcolor || $color("secondarySurface"),
      cview: this.rootView,
      dismissalHandler: () => {
        events?.dismissed?.(this);
        this.remove();
      },
    });
  }

  present() {
    if (this._sheet) this._sheet.present();
    this.load();
    this.appear();
  }

  dismiss() {
    if (this._sheet) this._sheet.dismiss();
  }
}
