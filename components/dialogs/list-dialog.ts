import { DialogSheet } from "./dialog-sheet";
import { List } from "../single-views";

/** 列表 Dialog 共用的选项。 */
interface ListDialogBaseOptions {
  /** 可选文本列表。 */
  items: string[];
  /** 弹出页标题。 */
  title: string;
}

/** 多选列表 Dialog 的选项。 */
export interface ListDialogMultiSelectOptions extends ListDialogBaseOptions {
  /** 启用多选模式。 */
  multiSelectEnabled: true;
  value?: never;
  /** 默认选中的索引列表。 */
  values?: number[];
}

/** 单选列表 Dialog 的选项。 */
export interface ListDialogSingleSelectOptions extends ListDialogBaseOptions {
  /** 禁用多选模式。 */
  multiSelectEnabled?: false | undefined;
  /** 默认选中的索引。 */
  value?: number;
  values?: never;
}

/** 列表 Dialog 支持的单选和多选配置。 */
export type ListDialogOptions = ListDialogSingleSelectOptions | ListDialogMultiSelectOptions;

/**
 * 显示可单选或多选的列表弹出页。
 *
 * `value` 用于单选默认值，`values` 用于多选默认值。
 * 多选模式返回索引数组，单选模式返回一个索引；取消时 Promise 以 `"cancel"` 拒绝。
 * @param options - 列表内容、选择模式、默认值和标题配置。
 * @returns 在用户完成选择时解析为已选索引的 Promise。
 */
export function listDialog(options: ListDialogMultiSelectOptions): Promise<number[]>;
export function listDialog(options: ListDialogSingleSelectOptions): Promise<number>;
export function listDialog({
  items,
  multiSelectEnabled,
  value,
  values = [],
  title,
}: ListDialogOptions): Promise<number | number[]> {
  if (value !== undefined) values = [value];
  const listView = new List({
    props: {
      style: 2,
      data: items.map((n, i) => {
        return {
          label: { text: n },
          image: { hidden: !values.includes(i) },
        };
      }),
      template: {
        views: [
          {
            type: "label",
            props: {
              id: "label",
            },
            layout: (make, view) => {
              make.top.bottom.inset(0);
              make.left.inset(20);
              make.right.inset(50);
            },
          },
          {
            type: "image",
            props: {
              id: "image",
              symbol: "checkmark",
              contentMode: 1,
              tintColor: $color("systemLink"),
            },
            layout: (make, view) => {
              make.top.bottom.right.inset(10);
              make.width.equalTo(30);
            },
          },
        ],
      },
    },
    events: {
      didSelect: (sender, indexPath) => {
        const data = sender.data;
        if (multiSelectEnabled) {
          data[indexPath.item].image.hidden = !data[indexPath.item].image.hidden;
        } else {
          data.forEach((n, i) => {
            n.image.hidden = i !== indexPath.item;
          });
        }
        sender.data = data;
      },
    },
  });
  const sheet = new DialogSheet({
    title,
    bgcolor: $color("insetGroupedBackground"),
    cview: listView,
    doneHandler: () => {
      const filtered = listView.view.data.map((n, i) => (n.image.hidden ? -1 : i)).filter((n) => n !== -1);
      if (multiSelectEnabled) return filtered;
      else return filtered[0];
    },
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}
