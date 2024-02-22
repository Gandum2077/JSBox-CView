"use strict";
/**
 * # CView PageViewer TitleBar
 *
 * props:
 *
 * - 只写 items: string[]
 * - 读写 index: number
 * - 只写 selectedItemColor
 * - 只写 defaultItemColor
 *
 * events:
 *
 * - changed: (cview, index) => void 在点击变更 index 的时候回调
 */
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
exports.PageViewerTitleBar = void 0;
const base_1 = require("./base");
const single_views_1 = require("./single-views");
//const { getTextWidth } = require("cview-util-ui");
function weightedAverageColors(c0, c1, w) {
    const red = c0.components.red * w + c1.components.red * (1 - w);
    const green = c0.components.green * w + c1.components.green * (1 - w);
    const blue = c0.components.blue * w + c1.components.blue * (1 - w);
    return $rgb(red, green, blue);
}
class PageViewerTitleBar extends base_1.Base {
    constructor({ props, layout, events = {} }) {
        super();
        this._props = Object.assign({ index: 0, selectedItemColor: $color("systemLink"), defaultItemColor: $color("secondaryText") }, props);
        const { changed } = events, restEvents = __rest(events, ["changed"]);
        this._floatedIndex = this._props.index;
        this._lineStartLocationPercentage = this._floatedIndex / this._props.items.length;
        this.labels = this._props.items.map((n, i) => {
            return new single_views_1.Label({
                props: {
                    text: n,
                    font: $font("bold", 17),
                    textColor: i === this.index
                        ? this._props.selectedItemColor
                        : this._props.defaultItemColor,
                    align: $align.center,
                    userInteractionEnabled: true
                },
                events: {
                    tapped: sender => {
                        this.index = i;
                        if (changed)
                            changed(this, i);
                    }
                }
            });
        });
        this.stack = new single_views_1.Stack({
            props: {
                axis: $stackViewAxis.horizontal,
                distribution: $stackViewDistribution.fillEqually,
                stack: {
                    views: this.labels.map(n => n.definition)
                }
            },
            layout: $layout.fill
        });
        this.placeholderView = new single_views_1.ContentView({
            props: {
                bgcolor: $color("clear")
            },
            layout: (make, view) => {
                make.left.bottom.inset(0);
                make.width.equalTo(view.super).multipliedBy(this._floatedIndex / this._props.items.length);
            }
        });
        this.line = new single_views_1.ContentView({
            props: {
                bgcolor: this._props.selectedItemColor
            },
            layout: (make, view) => {
                make.height.equalTo(4);
                make.width.equalTo(view.super).dividedBy(this._props.items.length);
                make.bottom.inset(0);
                make.left.equalTo(view.prev.right);
            }
        });
        this._defineView = () => {
            return {
                type: "view",
                props: {
                    id: this.id
                },
                layout,
                events: restEvents,
                views: [
                    this.stack.definition,
                    this.placeholderView.definition,
                    this.line.definition
                ]
            };
        };
    }
    get lineStartLocationPercentage() {
        return this._lineStartLocationPercentage;
    }
    set lineStartLocationPercentage(percent) {
        this._lineStartLocationPercentage = percent;
        this.placeholderView.view.remakeLayout((make, view) => {
            make.left.bottom.inset(0);
            make.width.equalTo(view.super).multipliedBy(percent);
        });
    }
    get floatedIndex() {
        return this._floatedIndex;
    }
    set floatedIndex(floatedIndex) {
        this._floatedIndex = floatedIndex;
        this.lineStartLocationPercentage = floatedIndex / this._props.items.length;
        this.labels.forEach((n, i) => {
            if (Math.abs(floatedIndex - i) < 1) {
                n.view.textColor = weightedAverageColors(this._props.selectedItemColor, this._props.defaultItemColor, floatedIndex - i > 0 ? 1 - (floatedIndex - i) : 1 - (i - floatedIndex));
            }
            else {
                n.view.textColor = this._props.defaultItemColor;
            }
        });
    }
    get index() {
        return this._props.index;
    }
    set index(index) {
        this._props.index = index;
    }
}
exports.PageViewerTitleBar = PageViewerTitleBar;
