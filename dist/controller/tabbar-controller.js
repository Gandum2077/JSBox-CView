"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabBarController = void 0;
const base_controller_1 = require("./base-controller");
const single_views_1 = require("../components/single-views");
const tabbar_1 = require("../components/tabbar");
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
class TabBarController extends base_controller_1.BaseController {
    constructor({ props, layout, events = {} }) {
        super({
            props: {
                id: props.id,
                bgcolor: props.bgcolor
            },
            layout,
            events: Object.assign(Object.assign({}, events), { didAppear: () => {
                    var _a, _b;
                    this._props.items[this.index].controller.appear();
                    (_b = (_a = this._events).didAppear) === null || _b === void 0 ? void 0 : _b.call(_a, this);
                } })
        });
        this._props = {
            items: props.items,
            index: props.index || 0
        };
        this._events = events;
        this.cviews = {};
        this.cviews.tabbar = new tabbar_1.TabBar({
            props: {
                items: this._props.items,
                index: this._props.index
            },
            events: {
                changed: (cview, index) => {
                    var _a, _b, _c;
                    this.index = index;
                    (_a = this._props.items.find(item => item.controller.status === 2)) === null || _a === void 0 ? void 0 : _a.controller.disappear();
                    this._props.items[index].controller.appear();
                    (_c = (_b = this._events).changed) === null || _c === void 0 ? void 0 : _c.call(_b, this, index);
                },
                doubleTapped: (cview, index) => {
                    var _a, _b;
                    (_b = (_a = this._events).doubleTapped) === null || _b === void 0 ? void 0 : _b.call(_a, this, index);
                }
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
