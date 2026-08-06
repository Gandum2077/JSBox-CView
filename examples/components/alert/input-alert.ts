import { inputAlert } from "../../../index";

$ui.render({
  props: { title: "Input Alert" },
  views: [
    {
      type: "button",
      props: { title: "输入昵称" },
      layout: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(160, 44));
      },
      events: {
        tapped: () => {
          inputAlert({
            title: "个人资料",
            message: "请输入要显示的昵称",
            placeholder: "昵称",
            text: "CView User",
          })
            .then((value) => $ui.alert({ title: "输入结果", message: value }))
            .catch(() => $ui.toast("已取消"));
        },
      },
    },
  ],
});
