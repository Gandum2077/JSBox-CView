import { Base } from "./base";

/** RefreshButton 属性接口。 */
export type RefreshButtonProps = {
  /** 刷新图标颜色，默认为系统主文本色。 */
  tintColor?: UIColor;
  /** 初始是否允许点击，默认为 `true`。 */
  enabled?: boolean;
  /** 初始是否隐藏，默认为 `false`。 */
  hidden?: boolean;
};

/** RefreshButton 事件接口。 */
export type RefreshButtonEvents = UiTypes.BaseViewEvents<UIButtonView>;

/**
 * 在刷新图标和加载指示器之间切换的按钮。
 *
 * `loading` 为 `false` 时显示 `arrow.clockwise`；设为 `true` 后隐藏图标、启动 Spinner，并禁用按钮，
 * 防止刷新任务被重复触发。恢复为 `false` 时重新启用按钮。适合作为导航栏或工具栏中的刷新操作。
 * @example
 * ```ts
 * const refreshButton = new RefreshButton({
 *   props: { tintColor: $color("systemLink") },
 *   events: {
 *     tapped: async () => {
 *       refreshButton.loading = true;
 *       await reloadData();
 *       refreshButton.loading = false;
 *     },
 *   },
 * });
 * ```
 */
export class RefreshButton extends Base<UIButtonView, UiTypes.ButtonOptions> {
  /** 创建包含刷新图标和 Spinner 的按钮定义。 */
  _defineView: () => UiTypes.ButtonOptions;
  /** 当前是否处于加载状态。 */
  _loading: boolean = false;

  /** 创建可显示加载状态的刷新按钮。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** 按钮外观和初始状态。 */
    props?: RefreshButtonProps;
    /** 按钮布局。 */
    layout?: (make: MASConstraintMaker, view: UIButtonView) => void;
    /** 按钮原生事件，通常使用 `tapped`。 */
    events?: RefreshButtonEvents;
  }) {
    super();
    this._layout = layout;
    this._defineView = () => {
      return {
        type: "button",
        props: {
          bgcolor: $color("clear"),
          enabled: props?.enabled ?? true,
          hidden: props?.hidden ?? false,
        },
        layout: this._layout,
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
            },
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
            },
          },
        ],
      };
    };
  }

  /**
   * 获取当前加载状态。
   * @returns 正在显示 Spinner 时返回 `true`。
   */
  get loading() {
    return this._loading;
  }

  /**
   * 切换刷新图标、Spinner 和按钮可用状态。
   * @param value - 是否进入加载状态。
   */
  set loading(value: boolean) {
    this._loading = value;
    $(this.id + "_image").hidden = value;
    $(this.id + "_spinner").hidden = !value;
    ($(this.id + "_spinner") as UISpinnerView).loading = value;
    this.view.enabled = !value;
  }
}
