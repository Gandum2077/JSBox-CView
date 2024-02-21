/** 
 * # cview Dynamic RowHeight List
 * 
 * 可以自动更新 rowHeight 的 list
 * 
 * 核心策略为 list 的所有行均为 cview，且每一个 cview 需要实现一个方法：heightToWidth(width: number) => number  
 * 通过这个方法汇报自己在某个宽度的时候所需要的高度，这必须任何时候均立即可用；
 * 如果这个方法不可用，那么行高设为 44
 * 
 * 特别参数
 * sections: {title: string, rows: cview[]}[]
 * 
 * 除了 props.data, props.template 和 events.rowHeight 不可用，其他均和 list 一致
 */

import { Base } from './base';

interface DynamicRowHeightListProps extends Omit<UiTypes.ListProps, "data" | "template"> {}
interface DynamicRowHeightListEvents extends Omit<UiTypes.ListEvents, "rowHeight"> {}
interface DynamicRowHeightListCView extends Base<any, any> {
  heightToWidth: (width: number) => number;
}

export class DynamicRowHeightList extends Base<UIListView, UiTypes.ListOptions>{
  _sections: {title: string, rows: DynamicRowHeightListCView[]}[];
  _defineView: () => UiTypes.ListOptions;
  constructor({ sections, props, layout, events }: {
    sections: {title: string, rows: DynamicRowHeightListCView[]}[];
    props: DynamicRowHeightListProps;
    layout: (make: MASConstraintMaker, view: UIListView) => void;
    events: DynamicRowHeightListEvents;
  }) {
    super();
    this._sections = sections;
    this._defineView = () => {
      const data = this._sections.map(n => ({
        title: n.title,
        rows: n.rows.map(r => r.definition)
      }));
      return {
        type: "list",
        props: {
          data,
          ...props
        },
        layout,
        events: {
          rowHeight: (sender, indexPath) => {
            const cview = this._sections[indexPath.section].rows[indexPath.row];
            if (
              cview.heightToWidth &&
              typeof cview.heightToWidth === "function"
            )
              return cview.heightToWidth(sender.frame.width);
            else return 44;
          },
          ...events
        }
      };
    }
  }
}