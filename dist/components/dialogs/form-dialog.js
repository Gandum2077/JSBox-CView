"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formDialog = void 0;
const static_preference_listview_1 = require("../static-preference-listview");
const dialog_sheet_1 = require("./dialog-sheet");
/**
 * 显示一个表单
 * @param sections 表单分组, 请参考`PreferenceListView`中的`PreferenceSection`
 * @param title 标题
 */
function formDialog({ sections, title }) {
    const view = new static_preference_listview_1.PreferenceListView({ sections });
    const sheet = new dialog_sheet_1.DialogSheet({
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
exports.formDialog = formDialog;
