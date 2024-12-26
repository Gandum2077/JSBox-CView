import { Base } from "./base";

/**
 * 创建一个刷新按钮，平时显示一个刷新的symbol，刷新时显示一个loading的symbol
 * props:
 *   - tintColor
 *   - enabled
 *   - hidden
 * events:
 *   - tapped
 */
export class RefreshButton extends Base<UIButtonView, UiTypes.ButtonOptions> {
  _defineView: () => UiTypes.ButtonOptions;
  _loading: boolean = false;
  constructor({
    props,
    layout,
    events = {}
  }: {
    props?: {
      tintColor?: UIColor;
      enabled?: boolean;
      hidden?: boolean;
    };
    layout?: (make: MASConstraintMaker, view: UIButtonView) => void;
    events?: UiTypes.BaseViewEvents<UIButtonView>;
  }) {
    super();
    this._defineView = () => {
      return {
        type: "button",
        props: {
          id: this.id,
          bgcolor: $color("clear"),
          enabled: props?.enabled ?? true,
          hidden: props?.hidden ?? false,
        },
        layout,
        events,
        views: [
          {
            type: "image",
            props: {
              id: this.id + "_image",
              symbol: "arrow.clockwise",
              tintColor: props?.tintColor ?? $color("primaryText"),
              contentMode: 1,
              hidden: this._loading,
            },
            layout: (make, view) => {
              make.edges.insets($insets(12.5, 12.5, 12.5, 12.5));
              make.center.equalTo(view.super);
            }
          },
          {
            type: "spinner",
            props: {
              id: this.id + "_spinner",
              loading: this._loading,
              hidden: !this._loading,
            },
            layout: (make, view) => {
              make.center.equalTo(view.super);
            }
          }
        ]
      }
    }
  }

  get loading() {
    return this._loading;
  }

  set loading(value: boolean) {
    this._loading = value;
    $(this.id + "_image").hidden = value;
    $(this.id + "_spinner").hidden = !value;
    ($(this.id + "_spinner") as UISpinnerView).loading = value;
    this.view.enabled = !value;
  }
}