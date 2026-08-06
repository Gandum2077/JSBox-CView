import { BaseController, Button, Label, PresentedPageController } from "../../index";

const host = new BaseController({
  props: { bgcolor: $color("primarySurface") },
});

const presentButton = new Button({
  props: { title: "展示模态控制器" },
  layout: (make, view) => {
    make.center.equalTo(view.super);
    make.size.equalTo($size(200, 44));
  },
  events: {
    tapped: () => {
      const modal = new PresentedPageController({
        props: {
          presentMode: 1,
          bgcolor: $color("secondarySurface"),
        },
        events: {
          didLoad: () => console.log("PresentedPageController didLoad"),
          didAppear: () => console.log("PresentedPageController didAppear"),
          dismissed: () => $ui.toast("模态控制器已关闭"),
          didRemove: () => console.log("PresentedPageController didRemove"),
        },
      });

      const title = new Label({
        props: {
          text: "PresentedPageController\n拥有完整的 Controller 生命周期",
          align: $align.center,
          font: $font("bold", 22),
          lines: 0,
        },
        layout: (make, view) => {
          make.left.right.inset(24);
          make.centerY.equalTo(view.super).offset(-36);
        },
      });
      const dismissButton = new Button({
        props: { title: "关闭" },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(20);
          make.centerX.equalTo(view.super);
          make.size.equalTo($size(140, 44));
        },
        events: { tapped: () => modal.dismiss() },
      });

      modal.rootView.views = [title, dismissButton];
      modal.present();
    },
  },
});

host.rootView.views = [presentButton];
host.uirender({ title: "Presented Page Controller" });
