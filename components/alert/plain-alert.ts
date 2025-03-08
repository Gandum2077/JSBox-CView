import {
  UIAlertActionStyle,
  UIAlertControllerStyle,
  UIAlertAction,
  UIAlertController,
} from "./uialert";

import { l10n } from "../../utils/l10n";

/**
 * 显示一个文字提示
 *
 * @param title 标题
 * @param message 内容
 * @param cancelText 取消按钮文字
 * @param confirmText 确认按钮文字
 * @returns Promise
 */
export function plainAlert({
  title = "",
  message = "",
  cancelText = l10n("CANCEL"),
  confirmText = l10n("OK"),
}: {
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
} = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(
      title,
      message,
      UIAlertControllerStyle.Alert
    );

    alertVC.addAction(
      new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent)
    );
    alertVC.addAction(
      new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent)
    );
    alertVC.present();

    function confirmEvent() {
      resolve("ok");
    }
    function cancelEvent() {
      reject("cancel");
    }
  });
}
