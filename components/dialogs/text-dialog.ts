/**
 * # CView Text Dialog
 * 
 * 返回一个Promise用于输入文本
 */

import { Text } from "../single-views";
import { DialogSheet } from "./dialog-sheet";

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
      ready: sender => sender.focus()
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