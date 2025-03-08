import {
  UIAlertActionStyle,
  UIAlertControllerStyle,
  UIAlertAction,
  UIAlertController,
} from "./uialert";

import { l10n } from "../../utils/l10n";

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
export function inputAlert({
  title = "",
  message = "",
  text = "",
  placeholder,
  type = 0,
  secure = false,
  cancelText = l10n("CANCEL"),
  confirmText = l10n("OK"),
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
      const input: string = alertVC.getText(0);
      resolve(input);
    }
    function cancelEvent() {
      reject("cancel");
    }
  });
}
