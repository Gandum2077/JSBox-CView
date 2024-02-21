/**
 * #cview symbolButton
 *
 * 创建可以自动规范symbol大小的button，兼容image，可以设定insets
 *
 * props:
 *   - symbol
 *   - image
 *   - tintColor
 *   - insets
 *
 * events:
 *  - tapped
 */

import { Base } from "./base";

interface CunstomProps extends UiTypes.ButtonProps {
  insets: JBInsets
}

interface CunstomPropsOptional extends UiTypes.ButtonProps {
  insets?: JBInsets
}
/**
 * 创建可以自动规范symbol大小的button，兼容image，可以设定insets
 * props:
 *   - symbol
 *   - image
 *   - tintColor
 *   - insets
 * events:
 *   - tapped
 */
export class SymbolButton extends Base<UIButtonView, UiTypes.ButtonOptions> {
  _props: CunstomProps
  _layout: (make: MASConstraintMaker, view: UIButtonView) => void
  _events: UiTypes.BaseViewEvents<UIButtonView>
  _defineView: () => UiTypes.ButtonOptions;
  constructor({ 
    props, 
    layout, 
    events = {} 
  }: {
    props: CunstomPropsOptional;
    layout: (make: MASConstraintMaker, view: UIButtonView) => void;
    events?: UiTypes.BaseViewEvents<UIButtonView>;
  }) {
    super();
    this._props = {
      insets: $insets(12.5, 12.5, 12.5, 12.5),
      tintColor: $color("primaryText"),
      ...props
    };
    this._layout = layout;
    this._events = events;
    this._defineView = () => {
      return {
        type: "button",
        props: {
          radius: 0,
          bgcolor: $color("clear"),
          id: this.id
        },
        views: [
          {
            type: "image",
            props: {
              id: "image",
              symbol: this._props.symbol,
              image: this._props.image,
              src: this._props.src,
              tintColor: this._props.tintColor,
              contentMode: 1
            },
            layout: (make, view: UIImageView) => {
              make.edges.insets(this._props.insets);
              make.centerX.equalTo(view.super);
              make.width.equalTo(view.height);
            }
          }
        ],
        layout: this._layout,
        events: {
          ...this._events
        }
      };
    }
  }

  set tintColor(tintColor: UIColor) {
    const image = this.view.get("image") as UIImageView;
    image.tintColor = tintColor;
  }

  set symbol(symbol) {
    this._props.symbol = symbol;
    const image = this.view.get("image") as UIImageView;
    image.symbol = symbol;
  }

  get symbol() {
    return this._props.symbol;
  }
}
