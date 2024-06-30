"use strict";
/**
 * # CView Text Dialog
 *
 * 返回一个Promise用于输入文本
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.textDialog = void 0;
const single_views_1 = require("../single-views");
const dialog_sheet_1 = require("./dialog-sheet");
function textDialog({ title, text = "", placeholder = "", editable = true }) {
    const textView = new single_views_1.Text({
        props: {
            text,
            placeholder,
            editable
        },
        events: {
            ready: sender => {
                if (sender.editable)
                    sender.focus();
            }
        }
    });
    const sheet = new dialog_sheet_1.DialogSheet({
        title,
        cview: textView,
        doneHandler: () => textView.view.text
    });
    return new Promise((resolve, reject) => {
        sheet.promisify(resolve, reject);
        sheet.present();
    });
}
exports.textDialog = textDialog;
