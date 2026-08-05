import { Base } from "./base";
import { ContentView, Scroll } from "./single-views";

/** PageViewer 属性接口。 */
export type PageViewerProps = {
  /** 初始页码，默认为 `0`。 */
  page?: number;
  /** 按显示顺序排列的页面组件，至少包含一项。 */
  cviews: Base<any, any>[];
};

/** PageViewer 事件接口。 */
export type PageViewerEvents = {
  /** 当前逻辑页码改变后触发。 */
  changed?: (cview: PageViewer, page: number) => void;
  /** 滚动过程中持续触发，可用于联动标题栏或其他进度视图。 */
  floatPageChanged?: (cview: PageViewer, floatPage: number) => void;
};
/**
 * 通过水平 Scroll 容器分页显示多个 CView 的页面组件。
 *
 * 每个子组件被包装为与视口等宽、等高的页面，容器启用原生分页滚动。设备旋转或父视图宽度变化时，
 * 组件会重新计算内容宽度，并按逻辑页码恢复位置。`page` 用于无动画切换，`scrollToPage` 用于动画切换。
 *
 * `changed` 在用户翻页或程序化改变页码时触发；`floatPageChanged` 在滚动过程中持续返回带小数的页码，
 * 可直接赋给 `PageViewerTitleBar.floatedIndex`，实现标题颜色和指示线的联动。完整控制器页面需要生命周期
 * 管理时，优先使用已经组合导航栏和标题栏的 `PageViewerController`。
 *
 * `cviews` 至少应包含一个页面，页码应位于有效索引范围内；每个页面组件仍需为自身根视图提供完整布局。
 * @example
 * ```ts
 * const pageViewer = new PageViewer({
 *   props: {
 *     page: 0,
 *     cviews: [firstPage, secondPage],
 *   },
 *   layout: $layout.fill,
 *   events: {
 *     floatPageChanged: (_viewer, page) => {
 *       titleBar.floatedIndex = page;
 *     },
 *   },
 * });
 * ```
 */
export class PageViewer extends Base<UIView, UiTypes.ViewOptions> {
  /** PageViewer 事件: 离散页码和连续滚动进度事件。 */
  private _events: PageViewerEvents;
  /** 最近一次布局得到的单页宽度。 */
  private _pageWidth: number;
  /** 当前逻辑页码。 */
  private _page: number;
  /** 当前滚动位置对应的连续页码。 */
  private _floatPage: number;
  /** 承载全部页面的水平分页 Scroll。 */
  scroll: Scroll;
  /** 创建包含分页 Scroll 的根视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建水平分页显示多个 CView 的页面组件。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    props: PageViewerProps;
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events: PageViewerEvents;
  }) {
    super();
    this._page = props.page ?? 0;
    this._floatPage = this._page;
    this._events = events;
    this._pageWidth = 0;
    const contentViews = props.cviews.map((n) => {
      return new ContentView({
        views: [n.definition],
        layout: (make, view) => {
          make.height.width.equalTo(view.super);
          make.left.equalTo(view.prev ? view.prev.right : view.super);
          make.top.equalTo(view.super);
        },
      });
    });
    this.scroll = new Scroll({
      props: {
        alwaysBounceVertical: false,
        alwaysBounceHorizontal: true,
        showsHorizontalIndicator: false,
        pagingEnabled: true,
      },
      events: {
        layoutSubviews: (sender) => {
          this._pageWidth = sender.frame.width;
          if (this._pageWidth) sender.contentSize = $size(this._pageWidth * props.cviews.length, 0);
        },
        willEndDragging: (sender, velocity, target) => {
          const oldPage = this.page;
          this._page = Math.round(target.x / this._pageWidth);
          if (oldPage !== this.page && this._events.changed) this._events.changed(this, this.page);
        },
        didScroll: (sender) => {
          const rawPage = sender.contentOffset.x / this._pageWidth;
          this._floatPage = Math.min(Math.max(0, rawPage), props.cviews.length - 1);
          if (this._events.floatPageChanged) this._events.floatPageChanged(this, this._floatPage);
        },
      },
      layout: $layout.fill,
      views: [...contentViews.map((n) => n.definition)],
    });
    this._defineView = () => {
      return {
        type: "view",
        props: { id: this.id },
        layout,
        views: [this.scroll.definition],
        events: {
          layoutSubviews: (sender) => {
            sender.relayout();
            this.page = this.page;
            $delay(0.2, () => (this.page = this.page));
          },
        },
      };
    };
  }

  /**
   * 获取当前逻辑页码。
   * @returns 当前页面索引。
   */
  get page() {
    return this._page;
  }

  /**
   * 无动画切换到指定页面。
   *
   * 页码发生变化时触发 `changed`；调用方负责保证索引有效。
   * @param page - 目标页面索引。
   */
  set page(page) {
    if (this.scroll.view.contentOffset.x !== page * this._pageWidth) {
      this.scroll.view.contentOffset = $point(page * this._pageWidth, 0);
    }
    if (this._page !== page) {
      this._page = page;
      if (this._events.changed) this._events.changed(this, page);
    }
  }

  /**
   * 动画滚动到指定页面。
   *
   * 页码发生变化时立即触发 `changed`；调用方负责保证索引有效。
   * @param page - 目标页面索引。
   */
  scrollToPage(page: number) {
    this.scroll.view.scrollToOffset($point(page * this._pageWidth, 0));
    if (this._page !== page) {
      this._page = page;
      if (this._events.changed) this._events.changed(this, page);
    }
  }
}
