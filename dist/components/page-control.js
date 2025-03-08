"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageControl = void 0;
const single_views_1 = require("./single-views");
/**
 *
 * 基于 Runtime 构建 PageControl
 *
 * 请注意本视图如果没有足够的横向宽度，会显示不全
 *
 * @property currentPage: number
 *
 */
class PageControl extends single_views_1.Runtime {
    /**
     *
     * @param props 属性
     * - numberOfPages: 页面数量
     * - currentPage: 当前页面
     * - pageIndicatorTintColor?: 页面指示器颜色
     * - currentPageIndicatorTintColor?: 当前页面指示器颜色
     * @param layout 布局
     * @param events 事件
     * - changed: (sender: PageControl, currentPage: number) => void
     *
     */
    constructor({ props, layout, events = {}, }) {
        const { numberOfPages = 3, currentPage = 0, pageIndicatorTintColor, currentPageIndicatorTintColor } = props, restProps = __rest(props, ["numberOfPages", "currentPage", "pageIndicatorTintColor", "currentPageIndicatorTintColor"]);
        const { changed } = events, restEvents = __rest(events, ["changed"]);
        super({ props: restProps, layout, events: restEvents });
        this._numberOfPages = numberOfPages;
        this._currentPage = currentPage;
        this._pageIndicatorTintColor = pageIndicatorTintColor;
        this._currentPageIndicatorTintColor = currentPageIndicatorTintColor;
        this._changed = changed;
        this._pageControl = this._createPageControl();
        if (this._props)
            this._props.view = this._pageControl;
    }
    _createPageControl() {
        const pageControl = $objc("UIPageControl").$new();
        pageControl.$setNumberOfPages(this._numberOfPages);
        pageControl.$setCurrentPage(this._currentPage);
        if (this._pageIndicatorTintColor)
            pageControl.$setPageIndicatorTintColor(this._pageIndicatorTintColor.ocValue());
        if (this._currentPageIndicatorTintColor)
            pageControl.$setCurrentPageIndicatorTintColor(this._currentPageIndicatorTintColor.ocValue());
        pageControl.$addEventHandler({
            events: $UIEvent.valueChanged,
            handler: $block("void", () => {
                const currentPage = pageControl.$currentPage();
                this._currentPage = currentPage;
                if (this._changed)
                    this._changed(this, currentPage);
            }),
        });
        return pageControl;
    }
    get currentPage() {
        return this._currentPage;
    }
    set currentPage(num) {
        this._currentPage = num;
        if (this._pageControl)
            this._pageControl.$setCurrentPage(num);
    }
}
exports.PageControl = PageControl;
