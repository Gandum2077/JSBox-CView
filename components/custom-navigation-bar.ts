import { Base } from "./base";
import { ContentView, Label, Button, Blur } from "./single-views";
import { SymbolButton } from "./symbol-button";
import { getTextWidth } from "../utils/uitools";

/** 自定义导航栏的显示状态。 */
export enum NavBarState {
  Hidden = 0,
  Minimized = 1,
  Normal = 2,
  Expanded = 3,
}

const navBarLayouts: Record<NavBarState, (make: MASConstraintMaker, view: AllUIView) => void> = {
  [NavBarState.Hidden]: (make: MASConstraintMaker, view: AllUIView) => {
    make.left.right.top.inset(0);
    make.height.equalTo(0);
  },
  [NavBarState.Minimized]: (make: MASConstraintMaker, view: AllUIView) => {
    make.left.right.top.inset(0);
    make.bottom.equalTo(view.super.safeAreaTop).inset(-25);
  },
  [NavBarState.Normal]: (make: MASConstraintMaker, view: AllUIView) => {
    make.left.right.top.inset(0);
    make.bottom.equalTo(view.super.safeAreaTop).inset(-50);
  },
  [NavBarState.Expanded]: (make: MASConstraintMaker, view: AllUIView) => {
    make.left.right.top.inset(0);
    make.bottom.equalTo(view.super.safeAreaTop).inset(-100);
  },
};

/** 自定义导航栏的显示、内容与外观选项。 */
export interface NavigationBarProps {
  /** 显示样式：`0` 隐藏、`1` 最小化、`2` 普通、`3` 扩展。 */
  style: NavBarState;
  /** 文本标题；使用该字段创建后，可通过 `title` 属性动态更新。 */
  title?: string;
  /** 自定义标题组件；未设置 `title` 时使用。 */
  titleView?: Base<any, any>;
  /** 是否显示自动返回按钮；启用时忽略 `leftBarButtonItems`。 */
  popButtonEnabled?: boolean;
  /** 返回按钮右侧的可选标题。 */
  popButtonTitle?: string;
  /** 是否允许长按返回按钮返回导航栈根页面。 */
  popToRootEnabled?: boolean;
  /** 左侧按钮项；建议最多设置两个。 */
  leftBarButtonItems: BarButtonItem[];
  /** 右侧按钮项；建议最多设置两个。 */
  rightBarButtonItems: BarButtonItem[];
  /** 扩展样式下显示在标题区域下方的工具组件。 */
  toolView?: Base<any, any>;
  /** 文本标题、返回按钮和自动创建按钮的默认前景色。 */
  tintColor: UIColor;
  /** 导航栏背景色；未设置时使用样式为 `10` 的模糊背景。 */
  bgcolor?: UIColor;
}

/** 导航栏左右两侧的按钮项。 */
interface BarButtonItem {
  /** 自定义 CView 组件；其根布局会被导航栏覆盖。 */
  cview?: Base<any, any>;
  /** 自定义组件所占宽度，默认为 `50`。 */
  width?: number;
  /** 文本按钮标题。 */
  title?: string;
  /** SF Symbol 名称。 */
  symbol?: string;
  /** 按钮图片；未设置 `symbol` 时使用。 */
  image?: UIImage;
  /** 当前按钮项的前景色；默认继承导航栏的 `tintColor`。 */
  tintColor?: UIColor;
  /** 点击按钮时执行的处理函数。 */
  handler?: (sender: UIButtonView) => void;
}

/** 导航栏状态和交互事件。 */
export interface NavigationBarEvents {
  /** 导航栏完成隐藏后触发。 */
  hidden?: (cview: CustomNavigationBar) => void;
  /** 导航栏完成最小化后触发。 */
  minimized?: (cview: CustomNavigationBar) => void;
  /** 导航栏恢复普通样式后触发。 */
  restored?: (cview: CustomNavigationBar) => void;
  /** 导航栏完成扩展后触发。 */
  expanded?: (cview: CustomNavigationBar) => void;
  /** 点击返回按钮时触发。 */
  popHandler?: (cview: CustomNavigationBar) => void;
  /** 长按返回按钮返回根页面时触发。 */
  popToRootHandler?: (cview: CustomNavigationBar) => void;
  /** 点击文本标题时触发。 */
  titleTapped?: (cview: CustomNavigationBar) => void;
}

/** 导航栏组装过程中创建的内部 CView 组件。 */
interface NavigationBarCViews {
  /** 左侧按钮或返回按钮容器。 */
  leftItemView?: ContentView | Button;
  /** 右侧按钮容器。 */
  rightItemView?: ContentView;
  /** 文本标题或自定义标题的容器。 */
  titleViewWrapper?: ContentView | Label;
  /** 标题和左右按钮所在的主内容区域。 */
  contentView?: ContentView;
  /** 扩展样式的工具区域。 */
  toolViewWrapper?: ContentView;
  /** 纯色或模糊背景。 */
  bgview?: ContentView | Blur;
  /** 导航栏底部分隔线。 */
  separator?: ContentView;
}

/**
 * 适配安全区域的 CView 自定义导航栏。
 *
 * 导航栏从屏幕顶部延伸到安全区域下方，并提供四种显示样式：
 *
 * - `0`（隐藏）：根视图高度为 `0`，不显示任何内容。
 * - `1`（最小化）：安全区域下方高度为 `25`，只显示标题，文本标题使用 `14` 号粗体。
 * - `2`（普通）：安全区域下方高度为 `50`，显示标题、左侧或返回按钮以及右侧按钮。
 * - `3`（扩展）：安全区域下方高度为 `100`，在普通样式内容之外显示 `toolView`。
 *
 * 配置时需要注意以下组合规则：
 *
 * - `title` 用于可动态修改的文本标题，`titleView` 用于自定义 CView；两者同时存在时优先使用 `title`。
 * - 启用 `popButtonEnabled` 后，左侧区域改为返回按钮，`leftBarButtonItems` 不再显示；
 *   `popToRootEnabled` 可进一步启用长按返回根页面。
 * - 左右按钮项支持自定义 `cview`、文本 `title`、SF Symbol 或 `image`，建议每侧最多放置两个。
 *   自定义组件的根布局会被导航栏覆盖，可通过按钮项的 `width` 指定宽度，默认宽度为 `50`。
 * - `toolView` 只在扩展样式下显示，适合放置搜索、筛选或其他辅助控件。
 * - 未设置 `bgcolor` 时使用样式为 `10` 的模糊背景；`tintColor` 作为自动创建内容的默认前景色。
 * @example
 * ```ts
 * const navigationBar = new CustomNavigationBar({
 *   props: {
 *     title: "详情",
 *     popButtonEnabled: true,
 *     popToRootEnabled: true,
 *     rightBarButtonItems: [
 *       {
 *         symbol: "ellipsis",
 *         handler: () => $ui.toast("更多"),
 *       },
 *     ],
 *   },
 * });
 * ```
 */
export class CustomNavigationBar extends Base<UIView | UIBlurView, UiTypes.ViewOptions | UiTypes.BlurOptions> {
  /** 合并默认值后的导航栏配置。 */
  _props: NavigationBarProps;
  /** 导航栏状态和交互事件。 */
  _events: NavigationBarEvents;
  /** 已创建的内部 CView 组件。 */
  cviews: Required<NavigationBarCViews>;
  /** 创建导航栏根视图定义。 */
  _defineView: () => UiTypes.ViewOptions | UiTypes.BlurOptions;

  /** 创建自定义导航栏。 */
  constructor({
    props = {},
    events = {},
  }: {
    /** 导航栏显示、内容与外观配置。 */
    props?: Partial<NavigationBarProps>;
    /** 导航栏状态和交互事件。 */
    events?: NavigationBarEvents;
  } = {}) {
    super();
    this._props = {
      ...props,
      leftBarButtonItems: props.leftBarButtonItems ?? [],
      rightBarButtonItems: props.rightBarButtonItems ?? [],
      style: props.style ?? NavBarState.Normal,
      tintColor: props.tintColor ?? $color("primaryText"),
    };
    this._events = events;
    this.cviews = {} as Required<NavigationBarCViews>;
    this._defineView = () => {
      /*
      设计思路
      一共5个子视图: 
        - contentView  下有3个子视图
            - leftItemView  popButton或者leftButtonItems
            - rightItemView  rightButtonItems
            - titleView  
        - toolView  
      */
      // leftItemView
      let leftInset = 0;
      if (this._props.popButtonEnabled) {
        const titleWidth = this._props.popButtonTitle ? getTextWidth(this._props.popButtonTitle) : 0;
        leftInset = titleWidth + 35;
        const views = [];
        const chevronOptions: UiTypes.ViewOptions = {
          type: "view",
          props: {
            userInteractionEnabled: false,
          },
          layout: (make: MASConstraintMaker) => {
            make.left.top.bottom.inset(0);
            make.width.equalTo(35);
          },
          views: [
            {
              type: "image",
              props: {
                symbol: "chevron.left",
                contentMode: 1,
                tintColor: this._props.tintColor,
              },
              layout: (make: MASConstraintMaker) => make.edges.insets($insets(12.5, 10, 12.5, 0)),
            },
          ],
        };
        views.push(chevronOptions);
        if (this._props.popButtonTitle) {
          const popButtonTitleOptions: UiTypes.LabelOptions = {
            type: "label",
            props: {
              align: $align.left,
              text: this._props.popButtonTitle,
              font: $font(17),
              textColor: this._props.tintColor,
            },
            layout: (make: MASConstraintMaker, view: UILabelView) => {
              make.top.bottom.right.inset(0);
              make.left.equalTo(view.prev.right);
            },
          };
          views.push(popButtonTitleOptions);
        }
        this.cviews.leftItemView = new Button({
          props: {
            bgcolor: $color("clear"),
            cornerRadius: 0,
            hidden: this._props.style === NavBarState.Minimized || this._props.style === NavBarState.Hidden,
          },
          views,
          layout: (make, view) => {
            make.width.equalTo(leftInset);
            make.left.top.bottom.inset(0);
          },
          events: {
            tapped: (sender) => {
              if (this._events.popHandler) this._events.popHandler(this);
              $ui.pop();
            },
            longPressed: this._props.popToRootEnabled
              ? (sender) => {
                  if (this._events.popToRootHandler) this._events.popToRootHandler(this);
                  $ui.popToRoot();
                }
              : undefined,
          },
        });
      } else {
        leftInset = this._calculateItemViewWidth(this._props.leftBarButtonItems);
        this.cviews.leftItemView = new ContentView({
          props: {
            bgcolor: undefined,
            hidden: this._props.style === NavBarState.Minimized || this._props.style === NavBarState.Hidden,
          },
          layout: (make, view) => {
            make.width.equalTo(leftInset);
            make.left.top.bottom.inset(0);
          },
          views: this._createCviewsOnItemView(this._props.leftBarButtonItems).map((n) => n.definition),
        });
      }

      // rightItemView
      const rightInset = this._calculateItemViewWidth(this._props.rightBarButtonItems);
      this.cviews.rightItemView = new ContentView({
        props: {
          bgcolor: undefined,
          hidden: this._props.style === NavBarState.Minimized || this._props.style === NavBarState.Hidden,
        },
        layout: (make, view) => {
          make.width.equalTo(rightInset);
          make.right.top.bottom.inset(0);
        },
        views: this._createCviewsOnItemView(this._props.rightBarButtonItems).map((n) => n.definition),
      });

      // titleView
      const titleViewInset = Math.max(leftInset, rightInset);
      if (this._props.title) {
        this.cviews.titleViewWrapper = new Label({
          props: {
            text: this._props.title,
            font: $font("bold", 17),
            align: $align.center,
            textColor: this._props.tintColor,
            userInteractionEnabled: true,
          },
          layout: (make, view) => {
            make.left.right.inset(titleViewInset);
            make.top.bottom.inset(0);
          },
          events: {
            tapped: (sender) => {
              if (this._events.titleTapped) this._events.titleTapped(this);
            },
          },
        });
      } else {
        this.cviews.titleViewWrapper = new ContentView({
          props: {
            bgcolor: undefined,
          },
          layout: (make, view) => {
            make.left.right.inset(titleViewInset);
            make.top.bottom.inset(0);
          },
          views: this._props.titleView && [this._props.titleView.definition],
        });
      }

      // contentView
      this.cviews.contentView = new ContentView({
        props: {
          bgcolor: undefined,
        },
        layout: (make, view) => {
          make.top.inset(0);
          make.left.right.inset(5);
          make.height.equalTo(50);
        },
        views: [
          this.cviews.titleViewWrapper.definition,
          this.cviews.leftItemView.definition,
          this.cviews.rightItemView.definition,
        ],
      });

      // toolView
      this.cviews.toolViewWrapper = new ContentView({
        props: {
          bgcolor: undefined,
          hidden: this._props.style !== NavBarState.Expanded,
        },
        layout: (make, view) => {
          make.left.right.bottom.equalTo(view.super);
          make.top.equalTo(view.super).inset(50);
        },
        views: this._props.toolView && [this._props.toolView.definition],
      });
      if (this._props.bgcolor) {
        this.cviews.bgview = new ContentView({
          props: {
            bgcolor: this._props.bgcolor,
          },
          layout: $layout.fill,
        });
      } else {
        this.cviews.bgview = new Blur({
          props: {
            style: 10,
          },
          layout: $layout.fill,
        });
      }
      this.cviews.separator = new ContentView({
        props: {
          bgcolor: $color("separatorColor"),
        },
        layout: (make, view) => {
          make.bottom.left.right.inset(0);
          make.height.equalTo(0.5);
        },
      });
      return {
        type: "view",
        props: {},
        layout: navBarLayouts[this._props.style],
        events: {
          ready: () => {
            this.setStyle(this._props.style);
          },
        },
        views: [
          this.cviews.bgview.definition,
          {
            type: "view",
            props: {},
            layout: $layout.fillSafeArea,
            views: [this.cviews.contentView.definition, this.cviews.toolViewWrapper.definition],
          },
          this.cviews.separator.definition,
        ],
      };
    };
  }

  /**
   * 计算一组按钮项占用的总宽度。
   * @param items - 待测量的按钮项。
   * @returns 所有按钮项的宽度总和。
   */
  private _calculateItemViewWidth(items: BarButtonItem[]) {
    if (!items || items.length === 0) return 0;
    let width = 0;
    items.forEach((n) => {
      if (n.cview) width += n.width || 50;
      else if (n.title) width += getTextWidth(n.title, { inset: 20 });
      else width += 50;
    });
    return width;
  }

  /**
   * 将按钮项转换为顺序排列的 CView 组件。
   *
   * 自定义组件的根布局会被替换，以便导航栏统一控制其位置和宽度。
   * @param items - 待创建的按钮项。
   * @returns 可加入左右按钮容器的 CView 组件。
   */
  private _createCviewsOnItemView(items: BarButtonItem[]) {
    return items.map((n) => {
      if (n.cview) {
        const width = n.width || 50;
        n.cview._layout = (make: MASConstraintMaker, view: AllUIView) => {
          make.top.bottom.inset(0);
          make.width.equalTo(width);
          make.left.equalTo((view.prev && view.prev.right) || 0);
        };
        return n.cview;
      } else if (n.title) {
        const width = getTextWidth(n.title, { inset: 20 });
        return new Button({
          props: {
            title: n.title,
            bgcolor: $color("clear"),
            titleColor: n.tintColor || this._props.tintColor,
            cornerRadius: 0,
          },
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.width.equalTo(width);
            make.left.equalTo((view.prev && view.prev.right) || 0);
          },
          events: {
            tapped: n.handler,
          },
        });
      } else if (n.symbol || n.image) {
        return new SymbolButton({
          props: {
            symbol: n.symbol,
            image: n.image,
            tintColor: n.tintColor || this._props.tintColor,
          },
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.width.equalTo(50);
            make.left.equalTo((view.prev && view.prev.right) || 0);
          },
          events: {
            tapped: n.handler,
          },
        });
      } else {
        throw Error("Invalid BarButtonItem");
      }
    });
  }

  /**
   * 获取文本标题。
   * @returns 当前文本标题；未设置时返回空字符串。
   */
  get title() {
    return this._props.title || "";
  }

  /**
   * 更新文本标题。
   *
   * 仅当组件创建时使用了 `props.title` 才会生效；自定义 `titleView` 不会被替换。
   * @param title - 新标题。
   */
  set title(title: string) {
    if (this._props.title === undefined) return;
    this._props.title = title;
    if ("text" in this.cviews.titleViewWrapper.view) this.cviews.titleViewWrapper.view.text = title;
  }

  /**
   * 隐藏导航栏并将根视图高度收缩为零。
   * @param animated - 是否播放布局过渡动画。
   */
  private _hide(animated = true) {
    this.view.hidden = false;
    this.cviews.leftItemView.view.hidden = true;
    this.cviews.rightItemView.view.hidden = true;
    this.cviews.toolViewWrapper.view.hidden = true;
    this.cviews.titleViewWrapper.view.hidden = true;
    this.view.remakeLayout(navBarLayouts[NavBarState.Hidden]);
    this.cviews.contentView.view.updateLayout((make) => make.height.equalTo(0));
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => {
          this.view.relayout();
          this.cviews.contentView.view.relayout();
        },
        completion: () => {
          this.view.hidden = true;
          if (this._events.hidden) this._events.hidden(this);
        },
      });
    } else {
      this.view.hidden = true;
      if (this._events.hidden) this._events.hidden(this);
    }
  }

  /**
   * 切换到仅显示标题的最小化样式。
   * @param animated - 是否播放布局过渡动画。
   */
  private _minimize(animated = true) {
    this.view.hidden = false;
    this.cviews.leftItemView.view.hidden = true;
    this.cviews.rightItemView.view.hidden = true;
    this.cviews.toolViewWrapper.view.hidden = true;
    this.cviews.titleViewWrapper.view.hidden = false;
    this.view.remakeLayout(navBarLayouts[NavBarState.Minimized]);
    this.cviews.contentView.view.updateLayout((make) => make.height.equalTo(25));
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => {
          this.view.relayout();
          this.cviews.contentView.view.relayout();
          if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
            this.cviews.titleViewWrapper.view.font = $font("bold", 14);
        },
        completion: () => {
          if (this._events.minimized) this._events.minimized(this);
        },
      });
    } else {
      if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
        this.cviews.titleViewWrapper.view.font = $font("bold", 14);
      if (this._events.minimized) this._events.minimized(this);
    }
  }

  /**
   * 恢复显示标题和左右按钮的普通样式。
   * @param animated - 是否播放布局过渡动画。
   */
  private _restore(animated = true) {
    this.view.hidden = false;
    this.cviews.titleViewWrapper.view.hidden = false;
    this.cviews.toolViewWrapper.view.hidden = true;
    this.view.remakeLayout(navBarLayouts[NavBarState.Normal]);
    this.cviews.contentView.view.updateLayout((make) => make.height.equalTo(50));
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => {
          this.view.relayout();
          this.cviews.contentView.view.relayout();
          if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
            this.cviews.titleViewWrapper.view.font = $font("bold", 17);
        },
        completion: () => {
          this.cviews.leftItemView.view.hidden = false;
          this.cviews.rightItemView.view.hidden = false;
          if (this._events.restored) this._events.restored(this);
        },
      });
    } else {
      this.cviews.leftItemView.view.hidden = false;
      this.cviews.rightItemView.view.hidden = false;
      if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
        this.cviews.titleViewWrapper.view.font = $font("bold", 17);
      if (this._events.restored) this._events.restored(this);
    }
  }

  /**
   * 切换到显示附加工具区域的扩展样式。
   * @param animated - 是否播放布局过渡动画。
   */
  private _expand(animated = true) {
    this.view.hidden = false;
    this.cviews.titleViewWrapper.view.hidden = false;
    this.view.remakeLayout(navBarLayouts[NavBarState.Expanded]);
    this.cviews.contentView.view.updateLayout((make) => make.height.equalTo(50));
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => {
          this.view.relayout();
          this.cviews.contentView.view.relayout();
          if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
            this.cviews.titleViewWrapper.view.font = $font("bold", 17);
        },
        completion: () => {
          this.cviews.leftItemView.view.hidden = false;
          this.cviews.rightItemView.view.hidden = false;
          this.cviews.toolViewWrapper.view.hidden = false;
          if (this._events.expanded) this._events.expanded(this);
        },
      });
    } else {
      this.cviews.leftItemView.view.hidden = false;
      this.cviews.rightItemView.view.hidden = false;
      this.cviews.toolViewWrapper.view.hidden = false;
      if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
        this.cviews.titleViewWrapper.view.font = $font("bold", 17);
      if (this._events.expanded) this._events.expanded(this);
    }
  }

  /**
   * 设置导航栏的显示状态。
   * @param style - 要切换到的显示状态。
   * @param animated - 是否播放布局过渡动画。
   */
  setStyle(style: NavBarState, animated = true) {
    this._props.style = style;
    switch (style) {
      case 0: {
        this._hide(animated);
        break;
      }
      case 1: {
        this._minimize(animated);
        break;
      }
      case 2: {
        this._restore(animated);
        break;
      }
      case 3: {
        this._expand(animated);
        break;
      }
      default:
        break;
    }
  }

  /**
   * 获取当前显示样式。
   * @returns 当前样式编号：`0` 隐藏、`1` 最小化、`2` 普通、`3` 扩展。
   */
  get style() {
    return this._props.style;
  }

  /**
   * 设置显示样式并执行对应的布局切换。
   * @param num - 样式编号：`0` 隐藏、`1` 最小化、`2` 普通、`3` 扩展。
   */
  set style(num) {
    this.setStyle(num);
  }
}
