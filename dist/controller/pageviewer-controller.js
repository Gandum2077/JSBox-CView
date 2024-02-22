"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageViewerController = void 0;
const base_controller_1 = require("./base-controller");
const pageviewer_1 = require("../components/pageviewer");
const pageviewer_titlebar_1 = require("../components/pageviewer-titlebar");
const custom_navigation_bar_1 = require("../components/custom-navigation-bar");
class PageViewerController extends base_controller_1.BaseController {
    constructor({ props, layout, events = {} }) {
        super({ props: {
                id: props.id,
                bgcolor: props.bgcolor
            }, layout, events });
        this._props = props;
        this.cviews = {};
        this.cviews.pageviewer = new pageviewer_1.PageViewer({
            props: {
                page: this._props.index,
                cviews: this._props.items.map(n => n.controller.rootView)
            },
            layout: (make, view) => {
                make.left.right.bottom.inset(0);
                make.top.equalTo(view.prev.bottom);
            },
            events: {
                floatPageChanged: (cview, floatPage) => (this.cviews.titlebar.floatedIndex = floatPage)
            }
        });
        this.cviews.titlebar = new pageviewer_titlebar_1.PageViewerTitleBar({
            props: {
                items: this._props.items.map(n => n.title),
                index: this._props.index
            },
            layout: $layout.fill,
            events: {
                changed: (cview, index) => this.cviews.pageviewer.scrollToPage(index)
            }
        });
        this.cviews.navbar = new custom_navigation_bar_1.CustomNavigationBar({
            props: Object.assign(Object.assign({}, this._props.navBarProps), { titleView: this.cviews.titlebar })
        });
        this.rootView.views = [this.cviews.navbar, this.cviews.pageviewer];
    }
    get index() {
        return this._props.index || 0;
    }
    set index(num) {
        this.cviews.titlebar.index = num;
        this.cviews.pageviewer.page = num;
        this._props.index = num;
    }
}
exports.PageViewerController = PageViewerController;
