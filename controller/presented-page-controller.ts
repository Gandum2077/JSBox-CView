import { BaseController, BaseControllerProps, BaseControllerEvents, ControllerRootView } from "./base-controller";
import { Sheet } from "../components/sheet";

/** 模态页面的展示方式和交互配置。 */
export interface PresentedPageControllerProps extends BaseControllerProps {
  /** UIKit 模态展示样式，默认为 `pageSheet`（`1`）。 */
  presentMode?: number;
  /** 展示和关闭时是否使用动画，默认为 `true`。 */
  animated?: boolean;
  /** 是否阻止用户下拉关闭页面，默认为 `false`。 */
  interactiveDismissalDisabled?: boolean;
}

/** 模态页面生命周期和关闭事件。 */
export interface PresentedPageControllerEvents extends BaseControllerEvents {
  /** Sheet 的控制器视图消失后、`didRemove` 前触发。 */
  dismissed?: (controller: PresentedPageController) => void;
}

/**
 * 使用原生 Sheet 展示 {@link BaseController.rootView} 的模态页面控制器。
 *
 * {@link present} 创建并展示 Sheet，然后立即调用 `load()` 和 `appear()`；用户下拉或程序化关闭后，依次触发
 * `dismissed` 和 `didRemove`。当前实现不会在关闭时自动调用 `disappear()`，因此需要临时隐藏阶段语义的页面应在
 * `dismissed` 中自行处理，最终资源仍应在 `didRemove` 中释放。
 *
 * Sheet 会让根视图填满模态控制器，因此传入的 `layout` 在模态展示时会被 `$layout.fill` 覆盖。
 * `interactiveDismissalDisabled` 只限制用户下拉关闭，不影响 {@link dismiss}。一个实例对应一次控制器生命周期；
 * 页面被关闭并进入 `removed` 后，如需再次展示应创建新的实例。
 *
 * 本类适合已有 Controller 生命周期体系的模态页面。只需展示任意 CView 内容时直接使用 {@link Sheet}，
 * 需要带导航栏的表单时优先使用 `DialogSheet`。
 * @example
 * ```ts
 * const controller = new PresentedPageController({
 *   props: {
 *     presentMode: 2,
 *     interactiveDismissalDisabled: true,
 *   },
 *   events: {
 *     dismissed: () => console.log("modal closed"),
 *     didRemove: () => releaseResources(),
 *   },
 * })
 *
 * controller.present()
 * ```
 */
export class PresentedPageController extends BaseController {
  /** 负责创建和关闭原生模态控制器的 Sheet。 */
  private _sheet: Sheet<ControllerRootView, UIView, UiTypes.ViewOptions>;

  /** 创建由 Sheet 承载的模态页面控制器。 */
  constructor({
    props,
    layout,
    events,
  }: {
    /** 模态样式、动画、交互关闭和根视图外观配置。 */
    props?: Partial<PresentedPageControllerProps>;
    /** 根视图布局；模态展示时会被 Sheet 覆盖为 `$layout.fill`。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** 控制器生命周期和模态关闭事件。 */
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
      interactiveDismissalDisabled: props?.interactiveDismissalDisabled || false,
      bgcolor: props?.bgcolor || $color("secondarySurface"),
      cview: this.rootView,
      dismissalHandler: () => {
        events?.dismissed?.(this);
        this.remove();
      },
    });
  }

  /** 展示 Sheet，并将控制器推进到 `loaded` 和 `appeared` 状态。 */
  present() {
    if (this._sheet) this._sheet.present();
    this.load();
    this.appear();
  }

  /**
   * 程序化关闭 Sheet。
   *
   * 关闭动画完成、控制器视图消失后将触发 `dismissed` 和 `didRemove`。
   */
  dismiss() {
    if (this._sheet) this._sheet.dismiss();
  }
}
