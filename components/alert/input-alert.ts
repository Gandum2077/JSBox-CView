/**
 * # CView InputAlert
 * 
 * 显示一个输入框提示
 */

import {
  UIAlertActionStyle,
  UIAlertControllerStyle,
  UIAlertAction,
  UIAlertController
} from "./uialert";

import { l10n } from "../../utils/l10n";

export function inputAlert({
  title = "",
  message = "",
  text = "",
  placeholder,
  type = 0,
  secure = false,
  cancelText = l10n("CANCEL"),
  confirmText = l10n("OK")
}: {
  title?: string;
  message?: string;
  text?: string;
  placeholder?: string;
  type?: number;
  secure?: boolean;
  cancelText?: string;
  confirmText?: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(
      title,
      message,
      UIAlertControllerStyle.Alert
    );
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
        }
      }
    });

    alertVC.addAction(
      new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent)
    );
    alertVC.addAction(
      new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent)
    );
    alertVC.present();

    function confirmEvent() {
      const input: string = alertVC.getText(0);
      resolve(input);
    }
    function cancelEvent() {
      reject("cancel");
    }
  });
}


