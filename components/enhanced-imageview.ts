/**
 * 此组件是为了加强 imageView，实现以下目的：
 *  1. 点击实现上下翻页
 *  2. 双指放大缩小（但不可以双击放大缩小）
 * 
 * 请注意：此组件使用了Runtime代码重新设置了Tapped事件。
 * 与以前使用touchesEnded事件来实现相比，可以避免在滑动手指时误触发。
 * 但因此带来了副作用：必须在关闭前通过releaseGestureObject释放掉此视图中自定义的NSObject，否则再次启动可能会有问题。
 * 
 * Props:
 *  src: string, 图片地址
 *  maxZoomScale: number, 最大缩放倍数，默认为2
 * 
 * Events:
 * upperLocationTouched: (sender: EnhancedImageView) => void, 上半部分被点击
 * lowerLocationTouched: (sender: EnhancedImageView) => void, 下半部分被点击
 */
import { Base } from "./base";
import { Scroll } from "./single-views";
import { cvid } from "../utils/cvid";

export class EnhancedImageView extends Base<UIView, UiTypes.ViewOptions> {
  private _props: { src: string; maxZoomScale: number };
  private _scroll: Scroll;
  private _gestureObject: any;
  _defineView: () => UiTypes.ViewOptions;
  
  constructor({ props, layout, events = {} }: {
    props: { src: string; maxZoomScale?: number };
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events?: {
      upperLocationTouched?: (sender: EnhancedImageView) => void;
      lowerLocationTouched?: (sender: EnhancedImageView) => void;
    }
  }) {
    super();
    this._props = { maxZoomScale: 2, ...props };
    this._scroll = new Scroll({
      props: {
        zoomEnabled: true,
        doubleTapToZoom: false,
        maxZoomScale: this._props.maxZoomScale
      },
      layout: $layout.fill,
      views: [
        {
          type: "image",
          props: {
            id: "image",
            src: this._props.src,
            contentMode: 1
          },
          layout: $layout.fill
        }
      ],
      events: {
        ready: view => {
          $delay(0.1, () =>
            this._addGesture(view, (gesture: any) => {
              const location = gesture.$locationInView(view.ocValue());
              const realLocation = $point(location.x - view.bounds.x, location.y - view.bounds.y)
              const frame = this.view.frame
              if (realLocation.y <= frame.height / 2) {
                if (events.upperLocationTouched) events.upperLocationTouched(this)
              } else {
                if (events.lowerLocationTouched) events.lowerLocationTouched(this)
              }
            })
          );
        }
      }
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id
        },
        views: [this._scroll.definition],
        layout,
        events: {
          layoutSubviews: sender => {
            $delay(0.1, () => (this.src = this.src));
            $delay(0.3, () => (this.src = this.src));
          }
        }
      };
    }
  }


  private _addGesture(view: AllUIView, event: (gesture: any) => void) {
    const objectId = cvid.newId;
    $define({
      type: objectId + ": NSObject",
      events: {
        tapped: event
      }
    });
    const object = $objc(objectId).$new();
    $objc_retain(object); // 此步骤是必须的，否则将很快被系统释放掉，但是必须在关闭时手动释放掉，否则再次启动可能会有问题
    this._gestureObject = object;
    const tapGestureRecognizer = $objc("UITapGestureRecognizer")
      .$alloc()
      .$initWithTarget_action(this._gestureObject, "tapped:");
    view.ocValue().$addGestureRecognizer(tapGestureRecognizer);
  }

  releaseGestureObject() {
    if (this._gestureObject) $objc_release(this._gestureObject);
  }

  get src() {
    return this._props.src;
  }

  set src(src) {
    this._props.src = src;
    const view = this._scroll.view.get("image") as UIImageView;
    view.src = src;
  }

  get image() {
    const view = this._scroll.view.get("image") as UIImageView;
    return view.image;
  }
}

