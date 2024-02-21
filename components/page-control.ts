/**
 * # CView PageControl
 * 
 * 基于 Runtime 构建 PageControl
 * 
 * 请注意本视图如果没有足够的横向宽度，会显示不全
 * ## Props
 * 
 * - 只写 numberOfPages: numnber
 * - 读写 currentPage: number
 * - 只写 pageIndicatorTintColor?: JSBoxColor
 * - 只写 currentPageIndicatorTintColor?: JSBoxColor
 * - 其他通用属性
 * 
 * ## Events
 * 
 * changed: (cview: Cview, currentPage: number) => void
 */

import { Runtime } from "./single-views";

export class PageControl extends Runtime {
  private _numberOfPages: number;
  private _currentPage: number;
  private _pageIndicatorTintColor?: UIColor;
  private _currentPageIndicatorTintColor?: UIColor;
  private _changed?: (sender: PageControl, currentPage: number) => void;
  private _pageControl: any;
  constructor({ props, layout, events = {} }: {
    props: {
      numberOfPages?: number;
      currentPage?: number;
      pageIndicatorTintColor?: UIColor;
      currentPageIndicatorTintColor?: UIColor;
    };
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events?: {
      changed?: (sender: PageControl, currentPage: number) => void;
    }
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

  _createPageControl() {
    const pageControl = $objc("UIPageControl").$new();
    pageControl.$setNumberOfPages(this._numberOfPages);
    pageControl.$setCurrentPage(this._currentPage);
    if (this._pageIndicatorTintColor)
      pageControl.$setPageIndicatorTintColor(
        this._pageIndicatorTintColor.ocValue()
      );
    if (this._currentPageIndicatorTintColor)
      pageControl.$setCurrentPageIndicatorTintColor(
        this._currentPageIndicatorTintColor.ocValue()
      );

    pageControl.$addEventHandler({
      events: $UIEvent.valueChanged,
      handler: $block("void", () => {
        const currentPage = pageControl.$currentPage();
        this._currentPage = currentPage
        if (this._changed) this._changed(this, currentPage);
      })
    });
    return pageControl;
  }

  get currentPage() {
    return this._currentPage;
  }

  set currentPage(num) {
    this._currentPage = num
    if (this._pageControl) this._pageControl.$setCurrentPage(num);
  }
}
