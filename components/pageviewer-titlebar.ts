import { Base } from "./base";
import { ContentView, Label, Stack } from "./single-views";

/**
 * 按权重混合两种颜色。
 * @param c0 - 权重为 `w` 的颜色。
 * @param c1 - 权重为 `1 - w` 的颜色。
 * @param w - 第一种颜色的权重。
 * @returns 混合后的 RGB 颜色。
 */
function weightedAverageColors(c0: UIColor, c1: UIColor, w: number) {
  const red = c0.components.red * w + c1.components.red * (1 - w);
  const green = c0.components.green * w + c1.components.green * (1 - w);
  const blue = c0.components.blue * w + c1.components.blue * (1 - w);
  return $rgb(red, green, blue);
}

/** 分页标题栏的标题、选择状态与颜色配置。 */
export interface PageViewerTitleBarProps {
  /** 按页面顺序排列的标题文本，至少包含一项。 */
  items: string[];
  /** 初始选中索引，默认为 `0`。 */
  index?: number;
  /** 选中标题和指示线颜色，默认为系统链接色。 */
  selectedItemColor?: UIColor;
  /** 未选中标题颜色，默认为系统次要文本色。 */
  defaultItemColor?: UIColor;
}

/** 分页标题栏的原生视图事件和标题点击事件。 */
export interface PageViewerTitleBarEvents extends UiTypes.BaseViewEvents {
  /** 点击标题并改变离散索引后触发。 */
  changed?: (cview: PageViewerTitleBar, index: number) => void;
}

/**
 * 与 `PageViewer` 联动的等宽分页标题栏。
 *
 * 标题使用水平 Stack 等宽排列，底部指示线宽度等于单个标题宽度。设置 `floatedIndex` 时，组件会按连续页码
 * 移动指示线，并在相邻标题之间插值选中颜色；通常将它绑定到 `PageViewer.floatPageChanged`。
 * 点击标题会更新离散 `index` 并触发 `changed`，通常在回调中调用 `PageViewer.scrollToPage(index)`。
 *
 * `index` 只保存离散选择状态，不会单独移动指示线或更新颜色；需要立即同步视觉状态时，同时设置
 * `floatedIndex`。`items` 至少应包含一个标题，所有索引和连续页码都应位于有效范围内。
 * 完整控制器页面通常直接使用 `PageViewerController`；只有自定义组合分页视图或导航栏标题时才需单独使用本组件。
 * @example
 * ```ts
 * const titleBar = new PageViewerTitleBar({
 *   props: {
 *     items: ["详情", "评论", "相关"],
 *     index: 0,
 *   },
 *   layout: $layout.fill,
 *   events: {
 *     changed: (_titleBar, index) => pageViewer.scrollToPage(index),
 *   },
 * });
 * ```
 */
export class PageViewerTitleBar extends Base<UIView, UiTypes.ViewOptions> {
  /** 已补齐默认索引和颜色的标题栏配置。 */
  private _props: Required<PageViewerTitleBarProps>;
  /** 当前用于视觉插值的连续页码。 */
  private _floatedIndex: number;
  /** 指示线起点占标题栏总宽度的比例。 */
  private _lineStartLocationPercentage: number;
  /** 按页面顺序排列的标题 Label。 */
  labels: Label[];
  /** 等宽排列所有标题的水平 Stack。 */
  stack: Stack;
  /** 通过宽度变化确定指示线水平起点的透明占位视图。 */
  placeholderView: ContentView;
  /** 当前页面的底部指示线。 */
  line: ContentView;

  /** 创建标题 Stack、指示线和透明定位视图组成的根视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建可与 PageViewer 连续滚动联动的标题栏。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** 标题文本、初始索引和颜色配置。 */
    props: PageViewerTitleBarProps;
    /** 根视图布局；通常填满 CustomNavigationBar 的 `titleView` 区域。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 原生视图事件和标题点击事件。 */
    events: PageViewerTitleBarEvents;
  }) {
    super();
    this._props = {
      ...props,
      index: props.index ?? 0,
      selectedItemColor: props.selectedItemColor ?? $color("systemLink"),
      defaultItemColor: props.defaultItemColor ?? $color("secondaryText"),
    };
    const { changed, ...restEvents } = events;
    this._floatedIndex = this._props.index;
    this._lineStartLocationPercentage = this._floatedIndex / this._props.items.length;
    this.labels = this._props.items.map((n, i) => {
      return new Label({
        props: {
          text: n,
          font: $font("bold", 17),
          textColor: i === this.index ? this._props.selectedItemColor : this._props.defaultItemColor,
          align: $align.center,
          userInteractionEnabled: true,
        },
        events: {
          tapped: (sender) => {
            this.index = i;
            if (changed) changed(this, i);
          },
        },
      });
    });
    this.stack = new Stack({
      props: {
        axis: $stackViewAxis.horizontal,
        distribution: $stackViewDistribution.fillEqually,
        stack: {
          views: this.labels.map((n) => n.definition),
        },
      },
      layout: $layout.fill,
    });
    this.placeholderView = new ContentView({
      props: {
        bgcolor: $color("clear"),
      },
      layout: (make, view) => {
        make.left.bottom.inset(0);
        make.width.equalTo(view.super).multipliedBy(this._floatedIndex / this._props.items.length);
      },
    });
    this.line = new ContentView({
      props: {
        bgcolor: this._props.selectedItemColor,
      },
      layout: (make, view) => {
        make.height.equalTo(4);
        make.width.equalTo(view.super).dividedBy(this._props.items.length);
        make.bottom.inset(0);
        make.left.equalTo(view.prev.right);
      },
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id,
        },
        layout,
        events: restEvents,
        views: [this.stack.definition, this.placeholderView.definition, this.line.definition],
      };
    };
  }

  /**
   * 获取当前用于视觉插值的连续页码。
   * @returns 当前连续页码。
   */
  get floatedIndex() {
    return this._floatedIndex;
  }

  /**
   * 更新连续页码、指示线位置和相邻标题颜色。
   *
   * 通常传入 `PageViewer.floatPageChanged` 提供的值；调用方负责保证页码有效。
   * @param floatedIndex - 可包含小数的连续页面索引。
   */
  set floatedIndex(floatedIndex) {
    this._floatedIndex = floatedIndex;
    this._lineStartLocationPercentage = floatedIndex / this._props.items.length;
    this.placeholderView.view.remakeLayout((make, view) => {
      make.left.bottom.inset(0);
      make.width.equalTo(view.super).multipliedBy(this._lineStartLocationPercentage);
    });
    this.labels.forEach((n, i) => {
      if (Math.abs(floatedIndex - i) < 1) {
        n.view.textColor = weightedAverageColors(
          this._props.selectedItemColor,
          this._props.defaultItemColor,
          floatedIndex - i > 0 ? 1 - (floatedIndex - i) : 1 - (i - floatedIndex),
        );
      } else {
        n.view.textColor = this._props.defaultItemColor;
      }
    });
  }

  /**
   * 获取当前离散选择索引。
   * @returns 当前选中标题索引。
   */
  get index() {
    return this._props.index;
  }

  /**
   * 更新离散选择索引。
   *
   * 此属性只保存状态，不会单独更新指示线和标题颜色；视觉同步应设置 `floatedIndex`。
   * @param index - 新的选中标题索引。
   */
  set index(index) {
    this._props.index = index;
  }
}
