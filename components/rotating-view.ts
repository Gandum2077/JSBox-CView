import { Base } from "./base";
import { Image } from "./single-views";

interface RotatingViewBaseProps {
  /** 图片模板色；设置后会使用 `alwaysTemplate` 图片。 */
  tintColor?: UIColor;
  /** 内置 Image 的内容模式，默认为 `1`。 */
  contentMode?: number;
  /** 每秒旋转圈数，默认为 `0.5`。 */
  rps?: number;
  /** 是否顺时针旋转，默认为 `true`。 */
  clockwise?: boolean;
  /** 是否立即开始，默认为 `true`。 */
  autoStart?: boolean;
}

/** RotatingView 配置接口：旋转视图的内容、速度和方向。 */
export type RotatingViewProps = (
  | {
      /** 使用内置 Image 作为内容时显示的图片。 */
      image: UIImage;
      cview?: never;
    }
  | {
      /** 自定义旋转内容。 */
      cview: Base<any, any>;
      image?: never;
    }
) &
  RotatingViewBaseProps;

/**
 * 持续旋转图片或自定义 CView 的动画容器。
 *
 * 提供 `cview` 时直接旋转该组件，并忽略 `image`、`tintColor` 和 `contentMode`；否则必须提供 `image`。
 * 根视图通常应使用方形布局，使旋转内容保持稳定边界。。
 *
 * 动画按一整圈拆成三个连续阶段。`stopRotating()` 只阻止下一轮开始，不会取消当前阶段，因此视图会完成当前整圈
 * 并回到归一化角度后停止。避免在已经旋转时重复调用 `startRotating()`，否则可能启动并行动画链。
 * @example
 * ```ts
 * const rotatingView = new RotatingView({
 *   props: { image: icon, tintColor: $color("systemLink"), rps: 0.5 },
 *   layout: (make) => make.size.equalTo($size(32, 32)),
 * });
 * ```
 */
export class RotatingView extends Base<UIView, UiTypes.ViewOptions> {
  /** 已补齐默认速度、方向和内容模式的配置。 */
  private _props: Required<Omit<RotatingViewProps, "cview" | "image" | "tintColor">> &
    Pick<RotatingViewProps, "cview" | "image" | "tintColor">;
  /** 当前动画链是否应在完成一整圈后继续。 */
  private _rotatingFlag: boolean;
  /** 实际执行旋转的图片或自定义组件。 */
  private _innerView: Base<any, any>;
  /** 创建包含旋转内容的根视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建持续旋转图片或自定义 CView 的容器。 */
  constructor({
    props,
    layout,
  }: {
    /** 旋转内容、速度和方向配置。 */
    props: RotatingViewProps;
    /** 根视图布局，通常应为方形。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
  }) {
    super();
    this._props = {
      ...props,
      contentMode: props.contentMode ?? 1,
      rps: props.rps ?? 0.5,
      clockwise: props.clockwise ?? true,
      autoStart: props.autoStart ?? true,
    };
    this._rotatingFlag = false;
    if (this._props.cview) {
      this._innerView = this._props.cview;
    } else {
      if (!this._props.image) throw new Error("image is required");
      this._innerView = new Image({
        props: {
          image: this._props.tintColor ? this._props.image.alwaysTemplate : this._props.image,
          tintColor: this._props.tintColor,
          contentMode: this._props.contentMode,
        },
        layout: $layout.fill,
      });
    }
    this._defineView = () => {
      return {
        type: "view",
        props: {},
        layout,
        events: {
          ready: (sender) => {
            if (this._props.autoStart) {
              this.startRotating();
            }
          },
        },
        views: [this._innerView.definition],
      };
    };
  }

  /** 开始持续旋转内部视图。 */
  startRotating() {
    this._rotatingFlag = true;
    this._rotateView(this._innerView.view);
  }

  /** 在当前整圈动画完成后停止继续旋转。 */
  stopRotating() {
    this._rotatingFlag = false;
  }

  /**
   * 执行一整圈的三阶段旋转动画，并按状态决定是否继续下一圈。
   * @param view - 待旋转的已加载视图。
   */
  _rotateView(view: AllUIView) {
    const clockwiseMultiplier = this._props.clockwise ? 1 : -1;
    const duration = 1 / 3 / this._props.rps;
    $ui.animate({
      duration,
      options: 3 << 16,
      animation: () => {
        view.rotate(((Math.PI * 2) / 3) * clockwiseMultiplier);
      },
      completion: () => {
        $ui.animate({
          duration,
          options: 3 << 16,
          animation: () => {
            view.rotate(((Math.PI * 4) / 3) * clockwiseMultiplier);
          },
          completion: () => {
            $ui.animate({
              duration,
              options: 3 << 16,
              animation: () => {
                view.rotate(Math.PI * 2 * clockwiseMultiplier);
              },
              completion: () => {
                if (this._rotatingFlag) this._rotateView(view);
              },
            });
          },
        });
      },
    });
  }
}
