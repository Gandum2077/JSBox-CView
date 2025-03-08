import { Base } from "../base";
import {
  PreferenceListView,
  PreferenceSection,
} from "../static-preference-listview";
import { DialogSheet } from "./dialog-sheet";

class DialogSheetForm extends DialogSheet {
  private _checkHandler: (values: { [key: string]: any }) => boolean;
  constructor(
    sheetProps: {
      title: string;
      cview: Base<any, any>;
      doneHandler?: () => void;
      presentMode?: number;
      bgcolor?: UIColor;
      doneButtonHidden?: boolean;
    },
    checkHandler: (values: { [key: string]: any }) => boolean
  ) {
    super(sheetProps);
    this._checkHandler = checkHandler;
  }

  done() {
    this._done = true;
    if (this.resolve && this._props.doneHandler) {
      const values = this._props.doneHandler();
      const success = this._checkHandler(values);
      if (success) {
        this.resolve(values);
        this.dismiss();
      }
    }
  }
}

/**
 * 显示一个表单
 * @param sections 表单分组, 请参考`PreferenceListView`中的`PreferenceSection`
 * @param title 标题
 */
export function formDialog({
  sections,
  title,
  checkHandler,
}: {
  sections: PreferenceSection[];
  title: string;
  checkHandler?: (values: { [key: string]: any }) => boolean;
}): Promise<{ [key: string]: any }> {
  const view = new PreferenceListView({ sections });
  const sheet = new DialogSheetForm(
    {
      title,
      bgcolor: $color("insetGroupedBackground"),
      cview: view,
      doneHandler: () => view.values,
    },
    checkHandler || (() => true)
  );
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}
