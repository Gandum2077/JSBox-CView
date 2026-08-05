import { Base } from "./base";

/** 除 `data` 和 `template` 外可传入动态行高列表的原生 List 属性。 */
export interface DynamicRowHeightListProps extends Omit<UiTypes.ListProps, "data" | "template"> {}

/** 除 `rowHeight` 外可传入动态行高列表的原生 List 事件。 */
export interface DynamicRowHeightListEvents extends Omit<UiTypes.ListEvents, "rowHeight"> {}

/** 可根据可用宽度同步计算自身高度的行组件。 */
interface DynamicRowHeightListCView extends Base<any, any> {
  /** 根据行可用宽度返回所需高度。 */
  heightToWidth: (width: number) => number;
}

/**
 * 使用 CView 行组件按列表宽度动态计算行高的 List。
 *
 * 每一行都必须实现同步且随时可调用的 `heightToWidth(width)`，组件会在原生 `rowHeight` 事件中传入
 * List 当前宽度。必须且只能提供扁平 `rows` 或带标题的 `sections` 其中一种。
 *
 * `data`、`template` 和 `rowHeight` 由组件接管，其他 List 属性与事件保持可用。没有提供任何非空行数据时，
 * 访问 `definition` 会抛出错误。行组件应完整约束内部内容，并让高度计算只依赖参数和自身状态。
 * @example
 * ```ts
 * const list = new DynamicRowHeightList({
 *   rows: [summaryRow, detailRow],
 *   props: {},
 *   layout: $layout.fill,
 *   events: {},
 * });
 * ```
 */
export class DynamicRowHeightList extends Base<UIListView, UiTypes.ListOptions> {
  /** 创建由 CView 行定义和动态 `rowHeight` 事件组成的 List。 */
  _defineView: () => UiTypes.ListOptions;

  /** 创建按可用宽度动态计算行高的列表。 */
  constructor({
    sections,
    rows,
    props,
    layout,
    events,
  }: (
    | {
        /** 带标题的行组件分区。 */
        sections: { title: string; rows: DynamicRowHeightListCView[] }[];
        rows?: never;
      }
    | {
        /** 不分区的行组件。 */
        rows: DynamicRowHeightListCView[];
        sections?: never;
      }
  ) & {
    /** 未被组件接管的原生 List 属性。 */
    props: DynamicRowHeightListProps;
    /** List 布局。 */
    layout: (make: MASConstraintMaker, view: UIListView) => void;
    /** 未被组件接管的原生 List 事件。 */
    events: DynamicRowHeightListEvents;
  }) {
    super();
    this._defineView = () => {
      let data: any;
      if (sections && sections.length > 0) {
        data = sections.map((n) => ({
          title: n.title,
          rows: n.rows.map((r) => r.definition),
        }));
      } else if (rows && rows.length > 0) {
        data = rows.map((r) => r.definition);
      } else {
        throw new Error("sections or rows must be provided");
      }
      return {
        type: "list",
        props: {
          ...props,
          data,
        },
        layout,
        events: {
          ...events,
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
        },
      };
    };
  }
}
