import { textDialog } from "../../../index";

$ui.render({
  props: { title: "Text Dialog" },
  views: [
    {
      type: "button",
      props: { title: "编辑文本" },
      layout: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(160, 44));
      },
      events: {
        tapped: () => {
          textDialog({
            title: "备忘录",
            text: "这是可编辑的多行文本。",
            placeholder: "输入内容",
          })
            .then((text) => $ui.alert({ title: "编辑结果", message: text }))
            .catch(() => $ui.toast("已取消"));
        },
      },
    },
  ],
});
