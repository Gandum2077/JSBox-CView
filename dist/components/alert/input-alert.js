"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputAlert = void 0;
const uialert_1 = require("./uialert");
const l10n_1 = require("../../utils/l10n");
/**
 * 显示一个输入框提示
 *
 * @param title 标题
 * @param message 内容
 * @param text 输入框默认文字
 * @param placeholder 输入框占位符
 * @param type 输入框类型
 * @param secure 是否安全输入
 * @param cancelText 取消按钮文字
 * @param confirmText 确认按钮文字
 */
function inputAlert({ title = "", message = "", text = "", placeholder, type = 0, secure = false, cancelText = (0, l10n_1.l10n)("CANCEL"), confirmText = (0, l10n_1.l10n)("OK"), }) {
    return new Promise((resolve, reject) => {
        const alertVC = new uialert_1.UIAlertController(title, message, uialert_1.UIAlertControllerStyle.Alert);
        alertVC.addTextField({
            placeholder,
            text,
            type,
            secure,
            events: {
                shouldReturn: () => {
                    const input = alertVC.getText(0);
                    const isValid = input.length > 0;
                    return isValid;
                },
            },
        });
        alertVC.addAction(new uialert_1.UIAlertAction(cancelText, uialert_1.UIAlertActionStyle.Destructive, cancelEvent));
        alertVC.addAction(new uialert_1.UIAlertAction(confirmText, uialert_1.UIAlertActionStyle.Default, confirmEvent));
        alertVC.present();
        function confirmEvent() {
            const input = alertVC.getText(0);
            resolve(input);
        }
        function cancelEvent() {
            reject("cancel");
        }
    });
}
exports.inputAlert = inputAlert;
