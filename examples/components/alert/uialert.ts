import { UIAlertAction, UIAlertActionStyle, UIAlertController, UIAlertControllerStyle } from "../../../index";

const showAlert = () => {
  const alert = new UIAlertController("底层 Alert", "这个示例直接组合原生操作和文本框。", UIAlertControllerStyle.Alert);

  alert.addTextField({
    placeholder: "备注",
    text: "由 UIAlertController 创建",
  });
  alert.addAction(
    new UIAlertAction("取消", UIAlertActionStyle.Cancel, () => {
      $ui.toast("已取消");
    }),
  );
  alert.addAction(
    new UIAlertAction("读取文本", UIAlertActionStyle.Default, () => {
      $ui.alert({ title: "文本内容", message: alert.getText(0) });
    }),
  );
  alert.present();
};

$ui.render({
  props: { title: "UIAlertController" },
  views: [
    {
      type: "button",
      props: { title: "显示底层 Alert" },
      layout: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(180, 44));
      },
      events: { tapped: showAlert },
    },
  ],
});
