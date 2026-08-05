import { Runtime } from "./single-views";

/** PageControl 的页面数量、索引和指示点外观属性。 */
export interface PageControlProps {
  /** 页面数量，默认为 `3`。 */
  numberOfPages?: number;
  /** 初始页面索引，默认为 `0`。 */
  currentPage?: number;
  /** 未选中页面指示点颜色。 */
  pageIndicatorTintColor?: UIColor;
  /** 当前页面指示点颜色。 */
  currentPageIndicatorTintColor?: UIColor;
}

/** PageControl 的页码变化事件。 */
export interface PageControlEvents {
  /** 用户操作导致当前页变化时触发。 */
  changed?: (sender: PageControl, currentPage: number) => void;
}

/**
 * 通过 Runtime 包装原生 `UIPageControl` 的分页指示器。
 *
 * 组件支持配置页面数量、初始页码和普通/当前指示点颜色。用户直接操作原生控件时触发 `changed`；
 * 程序化设置 `currentPage` 只同步状态和 UIKit 视图，不触发事件。
 *
 * 指示点数量较多时需要为组件提供足够的横向宽度，否则原生控件可能显示不完整。调用方负责保证当前页码
 * 与页面数量一致。
 * @example
 * ```ts
 * const pageControl = new PageControl({
 *   props: { numberOfPages: 5, currentPage: 0 },
 *   layout: $layout.center,
 *   events: {
 *     changed: (_control, page) => pager.scrollToPage(page),
 *   },
 * });
 * ```
 */
export class PageControl extends Runtime {
  /** 原生控件显示的页面数量。 */
  private _numberOfPages: number;
  /** 当前选中页面索引。 */
  private _currentPage: number;
  /** 未选中页面指示点颜色。 */
  private _pageIndicatorTintColor?: UIColor;
  /** 当前页面指示点颜色。 */
  private _currentPageIndicatorTintColor?: UIColor;
  /** 用户改变当前页面时执行的回调。 */
  private _changed?: (sender: PageControl, currentPage: number) => void;
  /** 被 Runtime 视图承载的原生 `UIPageControl`。 */
  private _pageControl: any;

  /** 创建原生分页指示器。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** 页面数量、初始索引和指示点颜色。 */
    props: PageControlProps;
    /** Runtime 根视图布局。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 原生视图事件和页码变化事件。 */
    events?: PageControlEvents;
  }) {
    const {
      numberOfPages = 3,
      currentPage = 0,
      pageIndicatorTintColor,
      currentPageIndicatorTintColor,
      ...restProps
    } = props;
    const { changed, ...restEvents } = events;
    super({ props: restProps, layout, events: restEvents });
    this._numberOfPages = numberOfPages;
    this._currentPage = currentPage;
    this._pageIndicatorTintColor = pageIndicatorTintColor;
    this._currentPageIndicatorTintColor = currentPageIndicatorTintColor;
    this._changed = changed;
    this._pageControl = this._createPageControl();
    if (this._props) this._props.view = this._pageControl;
  }

  /**
   * 创建并配置原生 `UIPageControl`。
   * @returns 配置完成的 Objective-C 控件对象。
   */
  _createPageControl() {
    const pageControl = $objc("UIPageControl").$new();
    pageControl.$setNumberOfPages(this._numberOfPages);
    pageControl.$setCurrentPage(this._currentPage);
    if (this._pageIndicatorTintColor) pageControl.$setPageIndicatorTintColor(this._pageIndicatorTintColor.ocValue());
    if (this._currentPageIndicatorTintColor)
      pageControl.$setCurrentPageIndicatorTintColor(this._currentPageIndicatorTintColor.ocValue());

    pageControl.$addEventHandler({
      events: $UIEvent.valueChanged,
      handler: $block("void", () => {
        const currentPage = pageControl.$currentPage();
        this._currentPage = currentPage;
        if (this._changed) this._changed(this, currentPage);
      }),
    });
    return pageControl;
  }

  /**
   * 获取当前页面索引。
   * @returns 当前页面索引。
   */
  get currentPage() {
    return this._currentPage;
  }

  /**
   * 更新当前页面索引和原生控件状态。
   *
   * 此操作不会触发 `changed`。
   * @param num - 新的页面索引。
   */
  set currentPage(num) {
    this._currentPage = num;
    if (this._pageControl) this._pageControl.$setCurrentPage(num);
  }
}
