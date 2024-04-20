/** 
 * # CView PageViewer Controller
 * 
 * 一个可以左右滑动翻页的控制器。
 * 
 * Props:
 * 
 * - items: { controller: Controller, title: string }[]
 * - navBarProps: {} 可用于 navBar 的其他属性，不包括 title 和 titleView
 */

import { BaseController, BaseControllerProps, BaseControllerEvents, ControllerRootView } from "./base-controller";
import { PageViewer } from "../components/pageviewer";
import { PageViewerTitleBar } from "../components/pageviewer-titlebar";
import { CustomNavigationBar, NavigationBarProps } from "../components/custom-navigation-bar";

interface PageViewerControllerProps extends BaseControllerProps {
  items: { controller: BaseController, title: string }[];
  navBarProps?: NavigationBarProps;
  index?: number;
}

export class PageViewerController extends BaseController {
  protected _props: PageViewerControllerProps;
  cviews: {
    pageviewer: PageViewer;
    titlebar: PageViewerTitleBar;
    navbar: CustomNavigationBar;
  }
  constructor({ props, layout, events = {} }: {
    props: PageViewerControllerProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: BaseControllerEvents;
  }) {
    super({ props: {
      id: props.id,
      bgcolor: props.bgcolor
    }, layout, events });
    this._props = props;
    this.cviews = {} as {
      pageviewer: PageViewer;
      titlebar: PageViewerTitleBar;
      navbar: CustomNavigationBar;
    };
    this.cviews.pageviewer = new PageViewer({
      props: {
        page: this._props.index || 0,
        cviews: this._props.items.map(n => n.controller.rootView)
      },
      layout: (make, view) => {
        make.left.right.bottom.inset(0)
        make.top.equalTo(view.prev.bottom)
      },
      events: {
        floatPageChanged: (cview, floatPage) => (this.cviews.titlebar.floatedIndex = floatPage)
      }
    });
    this.cviews.titlebar = new PageViewerTitleBar({
      props: {
        items: this._props.items.map(n => n.title),
        index: this._props.index || 0
      },
      layout: $layout.fill,
      events: {
        changed: (cview, index) => this.cviews.pageviewer.scrollToPage(index)
      }
    });
    this.cviews.navbar = new CustomNavigationBar({
      props: {
        ...this._props.navBarProps,
        titleView: this.cviews.titlebar
      }
    });
    this.rootView.views = [this.cviews.navbar, this.cviews.pageviewer]
  }

  get index() {
    return this._props.index || 0
  }

  set index(num) {
    this.cviews.titlebar.index = num
    this.cviews.pageviewer.page = num
    this._props.index = num
  }
}
