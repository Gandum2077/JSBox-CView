import { UIAlertActionStyle, UIAlertControllerStyle, UIAlertAction, UIAlertController } from "./uialert";

import { l10n } from "../../utils/l10n";

/** 登录 Alert 的显示和输入框配置。 */
export interface LoginAlertOptions {
  /** Alert 标题。 */
  title?: string;
  /** Alert 消息。 */
  message?: string;
  /** 用户名输入框占位符。 */
  placeholder1?: string;
  /** 密码输入框占位符。 */
  placeholder2?: string;
  /** 取消按钮文本，默认为本地化的“取消”。 */
  cancelText?: string;
  /** 确认按钮文本，默认为本地化的“好的”。 */
  confirmText?: string;
}

/**
 * 显示带用户名和密码输入框的原生 Alert。
 *
 * 第二个输入框使用安全文本输入。取消时 Promise 以 `"cancel"` 拒绝。
 * @param options - Alert 的显示和输入框配置。
 * @returns 在用户确认时解析为用户名和密码的 Promise。
 */
export function loginAlert({
  title = "",
  message = "",
  placeholder1 = "",
  placeholder2 = "",
  cancelText = l10n("CANCEL"),
  confirmText = l10n("OK"),
}: LoginAlertOptions = {}): Promise<{ username: string; password: string }> {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(title, message, UIAlertControllerStyle.Alert);

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

    alertVC.addAction(new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent));
    alertVC.addAction(new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent));
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
