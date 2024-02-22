"use strict";
/**
 * # CView PlainAlert
 *
 * 显示一个文字提示
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.plainAlert = void 0;
const uialert_1 = require("./uialert");
const l10n_1 = require("../../utils/l10n");
function plainAlert({ title = "", message = "", cancelText = (0, l10n_1.l10n)("CANCEL"), confirmText = (0, l10n_1.l10n)("OK") } = {}) {
    return new Promise((resolve, reject) => {
        const alertVC = new uialert_1.UIAlertController(title, message, uialert_1.UIAlertControllerStyle.Alert);
        alertVC.addAction(new uialert_1.UIAlertAction(cancelText, uialert_1.UIAlertActionStyle.Destructive, cancelEvent));
        alertVC.addAction(new uialert_1.UIAlertAction(confirmText, uialert_1.UIAlertActionStyle.Default, confirmEvent));
        alertVC.present();
        function confirmEvent() {
            resolve("ok");
        }
        function cancelEvent() {
            reject("cancel");
        }
    });
}
exports.plainAlert = plainAlert;
