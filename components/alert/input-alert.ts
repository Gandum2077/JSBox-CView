import { UIAlertActionStyle, UIAlertControllerStyle, UIAlertAction, UIAlertController } from "./uialert";

import { l10n } from "../../utils/l10n";

/** 单输入框 Alert 的显示和输入配置。 */
export interface InputAlertOptions {
  /** Alert 标题。 */
  title?: string;
  /** Alert 消息。 */
  message?: string;
  /** 输入框的初始文本。 */
  text?: string;
  /** 输入框占位符。 */
  placeholder?: string;
  /** UIKit 键盘类型值。 */
  type?: number;
  /** 是否使用安全文本输入。 */
  secure?: boolean;
  /** 取消按钮文本，默认为本地化的“取消”。 */
  cancelText?: string;
  /** 确认按钮文本，默认为本地化的“好的”。 */
  confirmText?: string;
}

/**
 * 显示带单个文本输入框的原生 Alert。
 *
 * 确认时返回当前文本；取消时 Promise 以 `"cancel"` 拒绝。
 * @param options - Alert 的显示和输入配置。
 * @returns 在用户确认时解析为输入文本的 Promise。
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
}: InputAlertOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(title, message, UIAlertControllerStyle.Alert);
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

    alertVC.addAction(new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent));
    alertVC.addAction(new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent));
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
