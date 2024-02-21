/**
 * # CView Form Dialog
 * 
 * 显示一个表单
 */

import { PreferenceListView, PreferenceSection } from "../static-preference-listview";
import { DialogSheet } from "./dialog-sheet";


export function formDialog({ sections, title }: { sections: PreferenceSection[]; title: string }) {
  const view = new PreferenceListView({ sections });
  const sheet = new DialogSheet({
    title,
    bgcolor: $color("insetGroupedBackground"),
    cview: view,
    doneHandler: () => view.values
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}
