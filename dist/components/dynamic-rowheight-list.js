"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicRowHeightList = void 0;
const base_1 = require("./base");
/**
 * # cview Dynamic RowHeight List
 *
 * 可以自动更新 rowHeight 的 list
 *
 * 核心策略为 list 的所有行均为 cview，且每一个 cview 需要实现一个方法：heightToWidth(width: number) => number
 * 通过这个方法汇报自己在某个宽度的时候所需要的高度，这必须任何时候均立即可用；
 *
 * 特别参数
 * sections: {title: string, rows: cview[]}[]
 * rows: cview[]
 * 两者不能同时存在，否则rows不起作用
 *
 * 除了 props.data, props.template 和 events.rowHeight 不可用，其他均和 list 一致
 */
class DynamicRowHeightList extends base_1.Base {
    constructor({ sections, rows, props, layout, events }) {
        super();
        this._defineView = () => {
            let data;
            if (sections && sections.length > 0) {
                data = sections.map(n => ({
                    title: n.title,
                    rows: n.rows.map(r => r.definition)
                }));
            }
            else if (rows && rows.length > 0) {
                data = rows.map(r => r.definition);
            }
            else {
                throw new Error("sections or rows must be provided");
            }
            return {
                type: "list",
                props: Object.assign({ id: this.id, data }, props),
                layout,
                events: Object.assign({ rowHeight: (sender, indexPath) => {
                        if (sections) {
                            const cview = sections[indexPath.section].rows[indexPath.row];
                            return cview.heightToWidth(sender.frame.width);
                        }
                        else if (rows) {
                            return rows[indexPath.row].heightToWidth(sender.frame.width);
                        }
                        else {
                            throw new Error("sections or rows must be provided");
                        }
                    } }, events)
            };
        };
    }
}
exports.DynamicRowHeightList = DynamicRowHeightList;
