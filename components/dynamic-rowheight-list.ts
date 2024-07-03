import { Base } from './base';

interface DynamicRowHeightListProps extends Omit<UiTypes.ListProps, "data" | "template"> { }
interface DynamicRowHeightListEvents extends Omit<UiTypes.ListEvents, "rowHeight"> { }
interface DynamicRowHeightListCView extends Base<any, any> {
  heightToWidth: (width: number) => number;
}

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
export class DynamicRowHeightList extends Base<UIListView, UiTypes.ListOptions> {
  _defineView: () => UiTypes.ListOptions;
  constructor({ sections, rows, props, layout, events }: {
    sections?: { title: string, rows: DynamicRowHeightListCView[] }[];
    rows?: DynamicRowHeightListCView[];
    props: DynamicRowHeightListProps;
    layout: (make: MASConstraintMaker, view: UIListView) => void;
    events: DynamicRowHeightListEvents;
  }) {
    super();
    this._defineView = () => {
      let data: any;
      if (sections && sections.length > 0) {
        data = sections.map(n => ({
          title: n.title,
          rows: n.rows.map(r => r.definition)
        }));
      } else if (rows && rows.length > 0) {
        data = rows.map(r => r.definition);
      } else {
        throw new Error("sections or rows must be provided");
      }
      return {
        type: "list",
        props: {
          data,
          ...props
        },
        layout,
        events: {
          rowHeight: (sender, indexPath) => {
            if (sections) {
              const cview = sections[indexPath.section].rows[indexPath.row];
              return cview.heightToWidth(sender.frame.width);
            } else if (rows) {
              return rows[indexPath.row].heightToWidth(sender.frame.width);
            } else {
              throw new Error("sections or rows must be provided");
            }
          },
          ...events
        }
      };
    }
  }
}