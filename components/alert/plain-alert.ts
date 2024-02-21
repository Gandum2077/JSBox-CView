/**
 * # CView PlainAlert
 * 
 * 显示一个文字提示
 */

import {
  UIAlertActionStyle,
  UIAlertControllerStyle,
  UIAlertAction,
  UIAlertController
} from "./uialert";

import { l10n } from "../../utils/l10n";

export function plainAlert({
  title = "",
  message = "",
  cancelText = l10n("CANCEL"),
  confirmText = l10n("OK")
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
