"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textDialog = void 0;
const single_views_1 = require("../single-views");
const dialog_sheet_1 = require("./dialog-sheet");
/**
 * 返回一个Promise用于输入文本
 * @param title 标题
 * @param text 初始文本
 * @param placeholder 占位符
 * @param editable 是否可编辑
 */
function textDialog({ title, text = "", placeholder = "", editable = true, }) {
    const textView = new single_views_1.Text({
        props: {
            text,
            placeholder,
            editable,
        },
        events: {
            ready: (sender) => {
                if (sender.editable)
                    sender.focus();
            },
        },
    });
    const sheet = new dialog_sheet_1.DialogSheet({
        title,
        cview: textView,
        doneHandler: () => textView.view.text,
    });
    return new Promise((resolve, reject) => {
        sheet.promisify(resolve, reject);
        sheet.present();
    });
}
exports.textDialog = textDialog;
