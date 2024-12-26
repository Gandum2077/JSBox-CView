import { Base } from "./base";

interface SymbolButtonProps {
  enabled: boolean;
  symbol?: string;
  image?: UIImage;
  src?: string;
  tintColor: UIColor;
  contentMode: number;
  insets: JBInsets;
  menu?: UiTypes.ContextMenuOptions
  hidden: boolean;
}

/**
 * 创建可以自动规范symbol大小的button，兼容image，可以设定insets
 * props:
 *   - symbol
 *   - image
 *   - tintColor
 *   - insets
 *   - enabled
 *   - menu
 *   - hidden
 * events:
 *   - tapped
 */
export class SymbolButton extends Base<UIButtonView, UiTypes.ButtonOptions> {
  _props: SymbolButtonProps
  _defineView: () => UiTypes.ButtonOptions;
  constructor({
    props,
    layout,
    events = {}
  }: {
    props: Partial<SymbolButtonProps>;
    layout?: (make: MASConstraintMaker, view: UIButtonView) => void;
    events?: UiTypes.BaseViewEvents<UIButtonView>;
  }) {
    super();
    this._props = {
      enabled: true,
      contentMode: 1,
      insets: $insets(12.5, 12.5, 12.5, 12.5),
      tintColor: $color("primaryText"),
      hidden: false,
      ...props
    };
    this._layout = layout;
    this._defineView = () => {
      const props = this._props.menu
        ? {
          radius: 0,
          bgcolor: $color("clear"),
          id: this.id,
          menu: this._props.menu,
          enabled: this._props.enabled,
          hidden: this._props.hidden
        } : {
          radius: 0,
          bgcolor: $color("clear"),
          id: this.id,
          enabled: this._props.enabled,
          hidden: this._props.hidden
        }
      return {
        type: "button",
        props,
        views: [
          {
            type: "image",
            props: {
              id: "image",
              symbol: this._props.symbol,
              image: this._props.image,
              src: this._props.src,
              tintColor: this._props.tintColor,
              contentMode: this._props.contentMode
            },
            layout: (make, view: UIImageView) => {
              make.edges.insets(this._props.insets);
              make.center.equalTo(view.super);
            }
          }
        ],
        layout: this._layout,
        events
      };
    }
  }

  set tintColor(tintColor: UIColor) {
    (this.view.get("image") as UIImageView).tintColor = tintColor;
  }

  set image(image: UIImage) {
    (this.view.get("image") as UIImageView).image = image;
  }

  set symbol(symbol: string) {
    (this.view.get("image") as UIImageView).symbol = symbol;
  }

  set src(src: string) {
    (this.view.get("image") as UIImageView).src = src;
  }
}
