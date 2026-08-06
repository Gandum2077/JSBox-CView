import { ContentView, Sheet } from "../../index";

const presentSheet = () => {
  let sheet: Sheet<ContentView, UIView, UiTypes.ViewOptions>;

  const content = new ContentView({
    props: { bgcolor: $color("secondarySurface") },
    layout: $layout.fill,
    views: [
      {
        type: "label",
        props: {
          text: "任意 CView 都可以由 Sheet 模态展示。",
          align: $align.center,
          lines: 0,
        },
        layout: (make, view) => {
          make.left.right.inset(24);
          make.centerY.equalTo(view.super).offset(-28);
        },
      },
      {
        type: "button",
        props: { title: "关闭" },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(20);
          make.centerX.equalTo(view.super);
          make.size.equalTo($size(140, 44));
        },
        events: { tapped: () => sheet.dismiss() },
      },
    ],
  });

  sheet = new Sheet({
    presentMode: 1,
    cview: content,
    dismissalHandler: () => $ui.toast("Sheet 已关闭"),
  });
  sheet.present();
};

$ui.render({
  props: { title: "Sheet" },
  views: [
    {
      type: "button",
      props: { title: "显示 Sheet" },
      layout: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(160, 44));
      },
      events: { tapped: presentSheet },
    },
  ],
});
