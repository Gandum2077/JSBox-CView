/**
 * # CView PageViewer
 * 
 * props:
 * - 读写 page: number  
 * - 只写 cviews: cview[] cview的布局会被自动指定为占用一整页
 * 
 * events: 
 * - changed: (cview, page) => void 页面改变时回调
 * - floatPageChanged: (cview, floatPage) => void 滚动时回调（用于绑定其他联合滚动的控件）
 * 
 * methods:
 * - scrollToPage(page: number) 滚动到某一页（带有动画效果）
 */

import { Base } from './base';
import { ContentView, Scroll } from "./single-views";

export class PageViewer extends Base<UIView, UiTypes.ViewOptions> {
  private _props: {
    page: number;
    cviews: Base<any, any>[];
  };
  private _events: {
    changed?: (cview: PageViewer, page: number) => void;
    floatPageChanged?: (cview: PageViewer, floatPage: number) => void;
  };
  private _pageWidth: number;
  private _floatPage: number;
  scroll: Scroll;
  _defineView: () => UiTypes.ViewOptions;

  constructor({ props, layout, events = {} }: {
    props: {
      page?: number;
      cviews: Base<any, any>[];
    };
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events: {
      changed?: (cview: PageViewer, page: number) => void;
      floatPageChanged?: (cview: PageViewer, floatPage: number) => void;
    };
  }) {
    super();
    this._props = {
      page: 0,
      ...props
    };
    this._events = events;
    this._pageWidth = 0;
    this._floatPage = this._props.page;
    const contentViews = this._props.cviews.map(n => {
      n._layout = $layout.fill;
      return new ContentView({
        views: [n.definition],
        layout: (make, view) => {
          make.height.width.equalTo(view.super);
          make.left.equalTo(view.prev ? view.prev.right : view.super);
          make.top.equalTo(view.super);
        }
      });
    });
    this.scroll = new Scroll({
      props: {
        alwaysBounceVertical: false,
        alwaysBounceHorizontal: true,
        showsHorizontalIndicator: false,
        pagingEnabled: true
      },
      events: {
        layoutSubviews: sender => {
          this._pageWidth = sender.frame.width;
          if (this._pageWidth)
            sender.contentSize = $size(this._pageWidth * this._props.cviews.length, 0);
        },
        willEndDragging: (sender, velocity, target) => {
          const oldPage = this.page;
          this._props.page = Math.round(target.x / this._pageWidth);
          if (oldPage !== this.page && this._events.changed)
            this._events.changed(this, this.page);
        },
        didScroll: sender => {
          const rawPage = sender.contentOffset.x / this._pageWidth;
          this._floatPage = Math.min(Math.max(0, rawPage), this._props.cviews.length - 1);
          if (this._events.floatPageChanged)
            this._events.floatPageChanged(this, this._floatPage);
        }
      },
      layout: $layout.fill,
      views: [...contentViews.map(n => n.definition)]
    });
    this._defineView = () => {
      return {
        type: "view",
        props: { id: this.id },
        layout: this._layout,
        views: [this.scroll.definition],
        events: {
          layoutSubviews: sender => {
            sender.relayout();
            this.page = this.page
            $delay(0.2, () => (this.page = this.page))

          }
        }
      };
    }
  }

  get page() {
    return this._props.page;
  }

  set page(page) {
    this._props.page = page;
    if (this.scroll.view.contentOffset.x !== page * this._pageWidth)
      this.scroll.view.contentOffset = $point(page * this._pageWidth, 0);
  }

  scrollToPage(page: number) {
    this.scroll.view.scrollToOffset($point(page * this._pageWidth, 0));
    this._props.page = page;
  }
}