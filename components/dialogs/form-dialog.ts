import { Base } from "../base";
import { PreferenceListView, PreferenceSection } from "../static-preference-listview";
import { DialogSheet } from "./dialog-sheet";

/** 表单 Dialog 收集的键值对象。 */
export type FormDialogValues = { [key: string]: any };

/** 表单 Dialog 的分区、标题和完成验证配置。 */
export interface FormDialogOptions {
  /** `PreferenceListView` 表单分组。 */
  sections: PreferenceSection[];
  /** 弹出页标题。 */
  title: string;
  /** 完成前调用的值验证函数。 */
  checkHandler?: (values: FormDialogValues) => boolean;
}

class DialogSheetForm extends DialogSheet {
  private _checkHandler: (values: FormDialogValues) => boolean;
  constructor(
    sheetProps: {
      title: string;
      cview: Base<any, any>;
      doneHandler?: () => void;
      presentMode?: number;
      bgcolor?: UIColor;
      doneButtonHidden?: boolean;
    },
    checkHandler: (values: FormDialogValues) => boolean,
  ) {
    super(sheetProps);
    this._checkHandler = checkHandler;
  }

  done() {
    if (this.resolve && this._props.doneHandler) {
      const values = this._props.doneHandler();
      const success = this._checkHandler(values);
      if (success) {
        this._done = true;
        this.resolve(values);
        this.dismiss();
      }
    }
  }
}

/**
 * 使用 `PreferenceListView` 显示分组表单弹出页。
 *
 * `checkHandler` 返回 `false` 时不会关闭弹出页。用户取消时 Promise 以 `"cancel"` 拒绝。
 * @param options - 表单分区、标题和完成验证配置。
 * @returns 在验证通过后解析为表单值对象的 Promise。
 */
export function formDialog({ sections, title, checkHandler }: FormDialogOptions): Promise<FormDialogValues> {
  const view = new PreferenceListView({ sections });
  const sheet = new DialogSheetForm(
    {
      title,
      bgcolor: $color("insetGroupedBackground"),
      cview: view,
      doneHandler: () => view.values,
    },
    checkHandler || (() => true),
  );
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}
