"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabBarController = void 0;
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
const base_controller_1 = require("./base-controller");
const single_views_1 = require("../components/single-views");
const tabbar_1 = require("../components/tabbar");
class TabBarController extends base_controller_1.BaseController {
    constructor({ props, layout, events = {} }) {
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
        this.cviews = {};
        this.cviews.tabbar = new tabbar_1.TabBar({
            props: {
                items: this._props.items,
                index: this._props.index
            },
            events: {
                changed: (cview, index) => (this.index = index)
            }
        });
        this.pages = this._props.items.map((n, i) => {
            return new single_views_1.ContentView({
                props: {
                    bgcolor: n.bgcolor || this._props.bgcolor,
                    hidden: i !== this._props.index
                },
                layout: $layout.fill,
                views: [n.controller.rootView.definition]
            });
        });
        this.cviews.pageContentView = new single_views_1.ContentView({
            props: {
                bgcolor: $color("clear")
            },
            layout: $layout.fill,
            views: this.pages.map(n => n.definition)
        });
        this.rootView.views = [this.cviews.pageContentView, this.cviews.tabbar];
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
exports.TabBarController = TabBarController;
