import { Base } from "./base";
import { Scroll } from "./single-views";
import { cvid } from "../utils/cvid";

/** EnhancedImageView 属性接口。 */
export interface EnhancedImageViewProps {
  /** 当前图片地址。 */
  src: string;
  /** Scroll 允许的最大缩放倍数。 */
  maxZoomScale?: number;
}

/** EnhancedImageView 事件接口。 */
export interface EnhancedImageViewEvents {
  /**
   * 点击图片时触发。
   * @param sender - 当前增强图片视图。
   * @param location - 点击点在当前可视区域中的相对坐标，`x` 和 `y` 均为 `0–1`。
   */
  relativeLocationTapped?: (sender: EnhancedImageView, location: JBPoint) => void;
}

/**
 * 支持缩放和相对位置点击事件的增强图片视图。
 *
 * 图片位于支持双指缩放的 Scroll 中，双击缩放固定关闭。组件使用 Objective-C
 * `UITapGestureRecognizer` 获取点击位置，避免拖动手势结束时被误判为点击。点击位置会按当前可视区域归一化为
 * `0–1` 的坐标，可由调用方自行划分交互区域。
 *
 * 手势目标对象通过 `$objc_retain` 保持，组件缺少自动销毁钩子，因此拥有它的控制器必须在最终移除页面时调用一次
 * `releaseGestureObject()`。不要只在临时消失时释放，否则返回页面后手势可能失效。
 * @example
 * ```ts
 * const imageView = new EnhancedImageView({
 *   props: { src: imageURL, maxZoomScale: 3 },
 *   layout: $layout.fill,
 *   events: {
 *     tapped: (_sender, location) => {
 *       if (location.y < 0.5) showPreviousPage();
 *       else showNextPage();
 *     },
 *   },
 * });
 * // 在页面最终移除时调用：imageView.releaseGestureObject();
 * ```
 */
export class EnhancedImageView extends Base<UIView, UiTypes.ViewOptions> {
  /** 图片地址和最大缩放倍数。 */
  private _props: Required<EnhancedImageViewProps>;
  /** 承载图片并提供缩放能力的 Scroll。 */
  private _scroll: Scroll;
  /** 被 Objective-C 手势识别器持有的回调目标对象。 */
  private _gestureObject: any;
  /** 创建包含缩放 Scroll 的根视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建支持缩放和相对位置点击的图片视图。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** 图片地址和缩放配置。 */
    props: EnhancedImageViewProps;
    /** 根视图布局。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 图片点击事件。 */
    events?: EnhancedImageViewEvents;
  }) {
    super();
    this._props = { ...props, maxZoomScale: props.maxZoomScale ?? 2 };
    this._scroll = new Scroll({
      props: {
        zoomEnabled: true,
        doubleTapToZoom: false,
        maxZoomScale: this._props.maxZoomScale,
      },
      layout: $layout.fill,
      views: [
        {
          type: "image",
          props: {
            id: "image",
            src: this._props.src,
            contentMode: 1,
          },
          layout: $layout.fill,
        },
      ],
      events: {
        ready: (view) => {
          $delay(0.1, () =>
            this._addGesture(view, (gesture: any) => {
              const location = gesture.$locationInView(view.ocValue());
              const realLocation = $point(location.x - view.bounds.x, location.y - view.bounds.y);
              const bounds = view.bounds;
              const relativeLocation = $point(
                Math.max(0, Math.min(1, realLocation.x / bounds.width)),
                Math.max(0, Math.min(1, realLocation.y / bounds.height)),
              );
              if (events.relativeLocationTapped) events.relativeLocationTapped(this, relativeLocation);
            }),
          );
        },
      },
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {},
        views: [this._scroll.definition],
        layout,
        events: {
          layoutSubviews: (sender) => {
            $delay(0.1, () => (this.src = this.src));
            $delay(0.3, () => (this.src = this.src));
          },
        },
      };
    };
  }

  /**
   * 创建并安装由 Objective-C 对象接收的点击手势。
   * @param view - 安装手势的 Scroll 视图。
   * @param event - 手势触发回调。
   */
  private _addGesture(view: AllUIView, event: (gesture: any) => void) {
    const objectId = cvid.newId;
    $define({
      type: objectId + ": NSObject",
      events: {
        tapped: event,
      },
    });
    const object = $objc(objectId).$new();
    $objc_retain(object); // 此步骤是必须的，否则将很快被系统释放掉，
    // 但是必须在关闭时手动释放掉，否则再次启动可能会有问题
    this._gestureObject = object;
    const tapGestureRecognizer = $objc("UITapGestureRecognizer")
      .$alloc()
      .$initWithTarget_action(this._gestureObject, "tapped:");
    view.ocValue().$addGestureRecognizer(tapGestureRecognizer);
  }

  /**
   * 释放手动保留的 Objective-C 手势目标对象。
   *
   * 应由拥有此组件的控制器在页面最终移除时调用一次。
   */
  releaseGestureObject() {
    if (this._gestureObject) $objc_release(this._gestureObject);
  }

  /**
   * 获取当前图片地址。
   * @returns 当前图片地址。
   */
  get src() {
    return this._props.src;
  }

  /**
   * 更新图片地址和已加载的 Image 视图。
   * @param src - 新图片地址。
   */
  set src(src) {
    this._props.src = src;
    const view = this._scroll.view.get("image") as UIImageView;
    view.src = src;
  }

  /**
   * 获取当前已加载的图片对象。
   * @returns Image 视图当前的 `UIImage`；图片尚未加载时可能为空。
   */
  get image() {
    const view = this._scroll.view.get("image") as UIImageView;
    return view.image;
  }
}
