import {
  UIAlertActionStyle,
  UIAlertControllerStyle,
  UIAlertAction,
  UIAlertController,
} from "./uialert";

import { l10n } from "../../utils/l10n";

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
export function loginAlert({
  title = "",
  message = "",
  placeholder1 = "",
  placeholder2 = "",
  cancelText = l10n("CANCEL"),
  confirmText = l10n("OK"),
}: {
  title?: string;
  message?: string;
  placeholder1?: string;
  placeholder2?: string;
  cancelText?: string;
  confirmText?: string;
} = {}): Promise<{ username: string; password: string }> {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(
      title,
      message,
      UIAlertControllerStyle.Alert
    );

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

    alertVC.addAction(
      new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent)
    );
    alertVC.addAction(
      new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent)
    );
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
