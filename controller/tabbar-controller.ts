import { BaseController, BaseControllerProps, BaseControllerEvents } from "./base-controller";
import { ContentView } from "../components/single-views";
import { TabBar } from "../components/tabbar";

interface TabBarControllerProps extends BaseControllerProps {
  items: {
    title?: string;
    symbol?: string;
    image?: UIImage;
    tintColor?: UIColor;
    bgcolor?: UIColor;
    controller: BaseController;
  }[];
  index?: number;
}

/** 
 * # CView TabBar Controller
 *
 * TabBarController 是一个 PagingController
 *
 * ## 属性
 * 
 * - items: {title?: string, 
 *           symbol?: string, 
 *           image?: UIImage, 
 *           tintColor?: UIColor, 
 *           bgcolor?: UIColor, 
 *           controller: Controller}[]
 * - index: number = 0
 */
export class TabBarController extends BaseController {
  _props: TabBarControllerProps;
  cviews: {
    tabbar: TabBar;
    pageContentView: ContentView;
  }
  pages: ContentView[];
  constructor({ props, layout, events = {} }: {
    props: TabBarControllerProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: BaseControllerEvents;
  }) {
    super({
      props: {
        id: props.id,
        bgcolor: props.bgcolor
      }, layout, events
    });
    this._props = {
      items: props.items,
      index: props.index || 0
    };
    this.cviews = {} as {
      tabbar: TabBar;
      pageContentView: ContentView;
    };
    this.cviews.tabbar = new TabBar({
      props: {
        items: this._props.items,
        index: this._props.index
      },
      events: {
        changed: (cview, index) => (this.index = index)
      }
    });

    this.pages = this._props.items.map((n, i) => {
      return new ContentView({
        props: {
          bgcolor: n.bgcolor || this._props.bgcolor,
          hidden: i !== this._props.index
        },
        layout: $layout.fill,
        views: [n.controller.rootView.definition]
      });
    });
    this.cviews.pageContentView = new ContentView({
      props: {
        bgcolor: $color("clear")
      },
      layout: $layout.fill,
      views: this.pages.map(n => n.definition)
    });
    this.rootView.views = [this.cviews.pageContentView, this.cviews.tabbar]
  }

  set index(num) {
    this.cviews.tabbar.index = num;
    this.pages.forEach((n, i) => {
      n.view.hidden = i !== num;
    });
    this._props.index = num;
  }

  get index() {
    return this._props.index || 0;
  }
}
