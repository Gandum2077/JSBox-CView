/**
 * 创建一个可以旋转的视图。理论上来说，这个视图的布局必须是方形的。
 *
 * props: 
 * - image 图片
 * - tintColor
 * - contentMode = 1
 * - cview 使用自定义的cview，上面两项将失效
 * - rps = 0.5 每秒转多少圈
 * - clockwise = true 是否顺时针旋转
 * 
 * events:
 * - ready: cview => void 可以在ready事件中启动旋转
 * 
 * methods:
 * - startRotating() 开始旋转
 * - stopRotating() 结束旋转，请注意旋转是不能立即结束的，必须等到动画归位
 */

import { Base } from "./base";
import { Image } from "./single-views";

interface RotatingViewProps {
  image?: UIImage;
  tintColor?: UIColor;
  contentMode?: number;
  cview?: Base<any, any>;
  rps?: number;
  clockwise?: boolean;
}

export class RotatingView extends Base<UIView, UiTypes.ViewOptions>{
  private _props: RotatingViewProps;
  private _rotatingFlag: boolean;
  private _innerView: Base<any, any>
  _defineView: () => UiTypes.ViewOptions;
  constructor({ props, layout, events = {} }: {
    props: RotatingViewProps;
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events?: {
      ready?: (cview: RotatingView) => void;
    }
  }) {
    super();
    this._props = {
      contentMode: 1,
      rps: 0.5,
      clockwise: true,
      ...props
    };
    this._rotatingFlag = false;
    if (this._props.cview) {
      this._innerView = this._props.cview;
    } else {
      if (!this._props.image) throw new Error("image is required");
      this._innerView = new Image({
        props: {
          image: this._props.tintColor
            ? this._props.image.alwaysTemplate
            : this._props.image,
          tintColor: this._props.tintColor,
          contentMode: this._props.contentMode
        },
        layout: $layout.fill
      });
    }
    this._defineView = () => {
      return {
        type: "view",
        props: {
          ...this._props,
          id: this.id
        },
        layout,
        events: {
          ready: sender => {
              if (events.ready) events.ready(this);
            }
        },
        views: [this._innerView.definition]
      };
    }
  }

  startRotating() {
    this._rotatingFlag = true;
    this._rotateView(this._innerView.view);
  }

  stopRotating() {
    this._rotatingFlag = false;
  }

  _rotateView(view: AllUIView) {
    const clockwiseMultiplier = this._props.clockwise ? 1 : -1
    const duration = 1 / 3 / (this._props.rps || 0.5);
    $ui.animate({
      duration,
      options: 3 << 16,
      animation: () => {
        view.rotate(Math.PI * 2 / 3 * clockwiseMultiplier);
      },
      completion: () => {
        $ui.animate({
          duration,
          options: 3 << 16,
          animation: () => {
            view.rotate(Math.PI * 4 / 3 * clockwiseMultiplier);
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
              }
            })
          }
        });
      }
    });
  }
}
