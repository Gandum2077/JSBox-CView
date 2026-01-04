"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formDialog = void 0;
const static_preference_listview_1 = require("../static-preference-listview");
const dialog_sheet_1 = require("./dialog-sheet");
class DialogSheetForm extends dialog_sheet_1.DialogSheet {
    constructor(sheetProps, checkHandler) {
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
 * 显示一个表单
 * @param sections 表单分组, 请参考`PreferenceListView`中的`PreferenceSection`
 * @param title 标题
 */
function formDialog({ sections, title, checkHandler, }) {
    const view = new static_preference_listview_1.PreferenceListView({ sections });
    const sheet = new DialogSheetForm({
        title,
        bgcolor: $color("insetGroupedBackground"),
        cview: view,
        doneHandler: () => view.values,
    }, checkHandler || (() => true));
    return new Promise((resolve, reject) => {
        sheet.promisify(resolve, reject);
        sheet.present();
    });
}
exports.formDialog = formDialog;
