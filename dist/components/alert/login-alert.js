"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAlert = void 0;
const uialert_1 = require("./uialert");
const l10n_1 = require("../../utils/l10n");
/**
 * 显示一个登录输入框提示
 *
 * @param title 标题
 * @param message 内容
 * @param placeholder1 输入框1的占位符
 * @param placeholder2 输入框2的占位符
 * @param cancelText 取消按钮文字
 * @param confirmText 确认按钮文字
 */
function loginAlert({ title = "", message = "", placeholder1 = "", placeholder2 = "", cancelText = (0, l10n_1.l10n)("CANCEL"), confirmText = (0, l10n_1.l10n)("OK"), } = {}) {
    return new Promise((resolve, reject) => {
        const alertVC = new uialert_1.UIAlertController(title, message, uialert_1.UIAlertControllerStyle.Alert);
        alertVC.addTextField({
            placeholder: placeholder1,
        });
        alertVC.addTextField({
            placeholder: placeholder2,
            secure: true,
            events: {
                shouldReturn: () => {
                    const username = alertVC.getText(0);
                    const password = alertVC.getText(1);
                    const isValid = username.length > 0 && password.length > 0;
                    return isValid;
                },
            },
        });
        alertVC.addAction(new uialert_1.UIAlertAction(cancelText, uialert_1.UIAlertActionStyle.Destructive, cancelEvent));
        alertVC.addAction(new uialert_1.UIAlertAction(confirmText, uialert_1.UIAlertActionStyle.Default, confirmEvent));
        alertVC.present();
        function confirmEvent() {
            const username = alertVC.getText(0);
            const password = alertVC.getText(1);
            resolve({
                username,
                password,
            });
        }
        function cancelEvent() {
            reject("cancel");
        }
    });
}
exports.loginAlert = loginAlert;
