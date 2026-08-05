import { Text } from "../single-views";
import { DialogSheet } from "./dialog-sheet";

/** 文本 Dialog 的标题、内容和编辑状态配置。 */
export interface TextDialogOptions {
  /** 弹出页标题。 */
  title: string;
  /** 初始文本。 */
  text?: string;
  /** 文本占位符。 */
  placeholder?: string;
  /** 是否允许编辑，默认为 `true`。 */
  editable?: boolean;
}

/**
 * 显示用于查看或编辑文本的弹出页。
 *
 * 可编辑时会在视图就绪后自动获取焦点。取消时 Promise 以 `"cancel"` 拒绝。
 * @param options - 标题、初始文本、占位符和编辑状态配置。
 * @returns 在用户完成时解析为当前文本的 Promise。
 */
export function textDialog({
  title,
  text = "",
  placeholder = "",
  editable = true,
}: TextDialogOptions): Promise<string> {
  const textView = new Text({
    props: {
      text,
      placeholder,
      editable,
    },
    events: {
      ready: (sender) => {
        if (sender.editable) sender.focus();
      },
    },
  });

  const sheet = new DialogSheet({
    title,
    cview: textView,
    doneHandler: () => textView.view.text,
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}
