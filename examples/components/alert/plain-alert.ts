import { plainAlert } from "../../../index";

$ui.render({
  props: { title: "Plain Alert" },
  views: [
    {
      type: "button",
      props: { title: "显示确认框" },
      layout: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(160, 44));
      },
      events: {
        tapped: () => {
          plainAlert({
            title: "确认操作",
            message: "plainAlert 会用 Promise 返回用户选择。",
          })
            .then(() => $ui.toast("已确认"))
            .catch(() => $ui.toast("已取消"));
        },
      },
    },
  ],
});
