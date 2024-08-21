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
exports.DynamicItemSizeMatrix = void 0;
const base_1 = require("./base");
const single_views_1 = require("./single-views");
function _getColumnsAndItemSizeWidth(containerWidth, minItemWidth, maxColumns, spacing) {
    if (minItemWidth > containerWidth - 2 * spacing) {
        return {
            columns: 1,
            itemSizeWidth: containerWidth - 2 * spacing
        };
    }
    const columns = Math.max(Math.min(Math.floor((containerWidth - spacing) / (minItemWidth + spacing)), maxColumns), 1 // 最少一列
    );
    const itemSizeWidth = Math.max(Math.floor((containerWidth - spacing * (columns + 1)) / columns), minItemWidth // 最小宽度
    );
    return {
        columns,
        itemSizeWidth
    };
}
/**
 * # CView Dynamic ItemSize Matrix
 *
 * 此组件是为了解决让 Matrix 的 ItemSize 跟随重新布局而动态变化的问题
 *
 * 动态的改变自己的 itemSize，从而使得 spacing 被优先满足。
 * 思路为在 matrix 上层套一个 superView，在旋转的时候 superView 会调用 matrix.relayout() 和 matrix.reload()
 * 从而触发 itemSize 事件
 *
 * 此视图的高度可以自动调整，需要 dynamicHeightEnabled 设为 true，且 layout 中要有关于 height 的约束
 *
 * 其排布逻辑是这样的:
 *
 * 1. 由 minItemWidth，spacing，maxColumns 这三个参数决定 cloumns，并结合 totalWidth 确定 itemSize.width
 * 2. 确定 itemHeight 有两种方法:
 *    - fixedItemHeight 固定高度，优先级第二
 *    - event: itemHeight(width) => height 通过 width 动态计算，优先级最高
 * 3. 如果 minItemWidth 比 totalWidth - 2 * spacing 还要小，那么 itemSize.width 会被设定为 totalWidth - 2 * spacing，以保证item不会超出边框
 *
 * props:
 *
 * 可以使用 matrix 的全部属性
 *
 * 特殊属性:
 *
 * - fixedItemHeight 固定 itemSize 高度
 * - minItemWidth 最小的 itemSize 宽度
 * - maxColumns 最大列数
 * - spacing
 * - dynamicHeightEnabled 此项为 true，那么 scrollEnabled 自动设为 false，且高度可以自动调整
 *
 * events:
 *
 * 可以使用 matrix 除 itemSize 以外的全部事件
 *
 * 其他特殊事件:
 *
 * - itemHeight: width => height 通过 itemWidth 动态计算 itemHeight
 *
 *
 * 方法:
 * - heightToWidth(width) 计算特定width时的应有的高度
 */
class DynamicItemSizeMatrix extends base_1.Base {
    constructor({ props, layout, events = {} }) {
        super();
        this._totalWidth = 0;
        this._columns = 1;
        this._props = Object.assign({ fixedItemHeight: 40, minItemWidth: 96, maxColumns: 5, spacing: 6, dynamicHeightEnabled: false }, props);
        this._events = events;
        const _a = this._events, { itemHeight, heightChanged } = _a, rest = __rest(_a, ["itemHeight", "heightChanged"]);
        const _matrixEvents = rest;
        this._itemSizeWidth = 0;
        this._itemSizeHeight = 0;
        this.matrix = new single_views_1.Matrix({
            props: Object.assign(Object.assign({}, this._props), { scrollEnabled: !this._props.dynamicHeightEnabled }),
            layout: $layout.fill,
            events: Object.assign(Object.assign({}, _matrixEvents), { itemSize: sender => $size(this._itemSizeWidth, this._itemSizeHeight) })
        });
        this._defineView = () => {
            return {
                type: "view",
                props: {
                    bgcolor: $color("clear"),
                    id: this.id
                },
                layout,
                events: {
                    layoutSubviews: sender => {
                        sender.relayout();
                        if (sender.frame.width === this._totalWidth)
                            return;
                        const { columns, itemSizeWidth } = _getColumnsAndItemSizeWidth(sender.frame.width, this._props.minItemWidth, this._props.maxColumns, this._props.spacing);
                        this._columns = columns;
                        this._itemSizeWidth = itemSizeWidth;
                        this._itemSizeHeight = this._events.itemHeight
                            ? this._events.itemHeight(this._itemSizeWidth)
                            : this._props.fixedItemHeight;
                        this.matrix.view.reload();
                        if (this._props.dynamicHeightEnabled) {
                            const height = this.heightToWidth(sender.frame.width);
                            sender.updateLayout(make => make.height.equalTo(height));
                            if (this._events.heightChanged)
                                this._events.heightChanged(this, height);
                        }
                    }
                },
                views: [this.matrix.definition]
            };
        };
    }
    heightToWidth(width) {
        const { columns, itemSizeWidth } = _getColumnsAndItemSizeWidth(width, this._props.minItemWidth, this._props.maxColumns, this._props.spacing);
        const rows = Math.ceil(this._props.data.length / columns);
        const itemSizeHeight = this._events.itemHeight
            ? this._events.itemHeight(itemSizeWidth)
            : this._props.fixedItemHeight;
        return rows * itemSizeHeight + (rows + 1) * this._props.spacing;
    }
    get data() {
        return this.matrix.view.data;
    }
    set data(data) {
        this._props.data = data;
        this.matrix.view.data = data;
    }
    get columns() {
        return this._columns;
    }
    get itemSize() {
        return $size(this._itemSizeWidth, this._itemSizeHeight);
    }
}
exports.DynamicItemSizeMatrix = DynamicItemSizeMatrix;
