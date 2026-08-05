import { UIAlertActionStyle, UIAlertControllerStyle, UIAlertAction, UIAlertController } from "./uialert";

import { l10n } from "../../utils/l10n";

/** 文字 Alert 的标题、消息和按钮配置。 */
export interface PlainAlertOptions {
  /** Alert 标题。 */
  title?: string;
  /** Alert 消息。 */
  message?: string;
  /** 取消按钮文本，默认为本地化的“取消”。 */
  cancelText?: string;
  /** 确认按钮文本，默认为本地化的“好的”。 */
  confirmText?: string;
}

/**
 * 显示带确认和取消操作的原生文字 Alert。
 *
 * 确认时返回 `"ok"`；取消时 Promise 以 `"cancel"` 拒绝。
 * @param options - Alert 的标题、消息和按钮配置。
 * @returns 在用户确认时解析为 `"ok"` 的 Promise。
 */
export function plainAlert({
  title = "",
  message = "",
  cancelText = l10n("CANCEL"),
  confirmText = l10n("OK"),
}: PlainAlertOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(title, message, UIAlertControllerStyle.Alert);

    alertVC.addAction(new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent));
    alertVC.addAction(new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent));
    alertVC.present();

    function confirmEvent() {
      resolve("ok");
    }
    function cancelEvent() {
      reject("cancel");
    }
  });
}
