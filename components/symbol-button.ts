import { Base } from "./base";

/** 图标按钮的图片来源、外观和状态配置。 */
export interface SymbolButtonProps {
  /** 是否允许点击，默认为 `true`。 */
  enabled: boolean;
  /** SF Symbol 名称。 */
  symbol?: string;
  /** 本地图片对象。 */
  image?: UIImage;
  /** 远程或本地图片地址。 */
  src?: string;
  /** 图片模板色，默认为系统主文本色。 */
  tintColor: UIColor;
  /** 图片内容模式，默认为 `1`。 */
  contentMode: number;
  /** 图片相对按钮边缘的内边距，默认四边 `12.5`。 */
  insets: JBInsets;
  /** 按钮上下文菜单。 */
  menu?: UiTypes.ContextMenuOptions<UIButtonView>;
  /** 是否隐藏按钮，默认为 `false`。 */
  hidden: boolean;
}

/**
 * 使用统一内边距显示 SF Symbol 或图片的透明按钮。
 *
 * 按钮内部使用一个居中的 Image 视图，可通过 `symbol`、`image` 或 `src` 提供图像来源；通常只应设置其中一种。
 * 默认四边内缩 `12.5`，适合导航栏和工具栏中的紧凑图标操作。`menu` 会直接配置在按钮上，普通点击事件仍通过
 * `events.tapped` 处理。
 *
 * `tintColor`、`image`、`symbol` 和 `src` setter 直接更新已加载的内部 Image，不会重新创建按钮定义。
 * @example
 * ```ts
 * const button = new SymbolButton({
 *   props: { symbol: "square.and.arrow.up", tintColor: $color("systemLink") },
 *   layout: (make) => make.size.equalTo($size(50, 50)),
 *   events: { tapped: () => share() },
 * });
 * ```
 */
export class SymbolButton extends Base<UIButtonView, UiTypes.ButtonOptions> {
  /** 已补齐默认外观和状态的按钮配置。 */
  _props: SymbolButtonProps;
  /** 创建包含居中 Image 的按钮定义。 */
  _defineView: () => UiTypes.ButtonOptions;

  /** 创建使用统一图标尺寸规则的透明按钮。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** 图片来源、外观和状态配置。 */
    props: Partial<SymbolButtonProps>;
    /** 按钮布局。 */
    layout?: (make: MASConstraintMaker, view: UIButtonView) => void;
    /** 按钮原生事件。 */
    events?: UiTypes.BaseViewEvents<UIButtonView>;
  }) {
    super();
    this._props = {
      ...props,
      enabled: props.enabled ?? true,
      contentMode: props.contentMode ?? 1,
      insets: props.insets ?? $insets(12.5, 12.5, 12.5, 12.5),
      tintColor: props.tintColor ?? $color("primaryText"),
      hidden: props.hidden ?? false,
    };
    this._layout = layout;
    this._defineView = () => {
      const props = this._props.menu
        ? {
            radius: 0,
            bgcolor: $color("clear"),
            menu: this._props.menu,
            enabled: this._props.enabled,
            hidden: this._props.hidden,
          }
        : {
            radius: 0,
            bgcolor: $color("clear"),
            enabled: this._props.enabled,
            hidden: this._props.hidden,
          };
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
              contentMode: this._props.contentMode,
            },
            layout: (make, view: UIImageView) => {
              make.edges.insets(this._props.insets);
              make.center.equalTo(view.super);
            },
          },
        ],
        layout: this._layout,
        events,
      };
    };
  }

  /**
   * 更新已加载图片的模板色。
   * @param tintColor - 新模板色。
   */
  set tintColor(tintColor: UIColor) {
    (this.view.get("image") as UIImageView).tintColor = tintColor;
  }

  /**
   * 更新已加载 Image 的图片对象。
   * @param image - 新图片对象。
   */
  set image(image: UIImage) {
    (this.view.get("image") as UIImageView).image = image;
  }

  /**
   * 更新已加载 Image 的 SF Symbol。
   * @param symbol - 新 SF Symbol 名称。
   */
  set symbol(symbol: string) {
    (this.view.get("image") as UIImageView).symbol = symbol;
  }

  /**
   * 更新已加载 Image 的图片地址。
   * @param src - 新图片地址。
   */
  set src(src: string) {
    (this.view.get("image") as UIImageView).src = src;
  }
}
