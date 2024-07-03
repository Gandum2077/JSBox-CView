import { Text } from "../single-views";
import { DialogSheet } from "./dialog-sheet";

/**
 * 返回一个Promise用于输入文本
 * @param title 标题
 * @param text 初始文本
 * @param placeholder 占位符
 * @param editable 是否可编辑
 */
export function textDialog({ title, text = "", placeholder = "", editable = true }: {
  title: string;
  text?: string;
  placeholder?: string;
  editable?: boolean;
}) {
  const textView = new Text({
    props: {
      text,
      placeholder,
      editable
    },
    events: {
      ready: sender => {
        if (sender.editable) sender.focus()
      }
    }
  });

  const sheet = new DialogSheet({
    title,
    cview: textView,
    doneHandler: () => textView.view.text
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}