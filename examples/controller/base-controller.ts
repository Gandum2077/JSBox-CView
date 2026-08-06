import { BaseController, Button, Label, controllerStatus, router } from "../../index";

const statusLabel = new Label({
  props: {
    text: "created",
    align: $align.center,
    font: $font("bold", 22),
    lines: 0,
  },
  layout: (make, view) => {
    make.left.right.inset(20);
    make.centerY.equalTo(view.super).offset(-40);
  },
});

const controller = new BaseController({
  props: {
    id: "base-controller-example",
    bgcolor: $color("primarySurface"),
  },
  events: {
    didLoad: () => {
      statusLabel.view.text = "didLoad：控制器已登记到 router";
      console.log("BaseController didLoad");
    },
    didAppear: () => {
      statusLabel.view.text = "didAppear：页面当前可见";
      console.log("BaseController didAppear");
    },
    didDisappear: () => console.log("BaseController didDisappear"),
    didRemove: () => console.log("BaseController didRemove"),
  },
});

const inspectButton = new Button({
  props: { title: "检查 Router 与状态" },
  layout: (make, view) => {
    make.top.equalTo(view.prev.bottom).offset(24);
    make.centerX.equalTo(view.super);
    make.size.equalTo($size(200, 44));
  },
  events: {
    tapped: () => {
      const registered = router.get(controller.id) === controller;
      const appeared = controller.status === controllerStatus.appeared;
      $ui.alert({
        title: "Controller 状态",
        message: `router 已登记：${registered}\n当前已显示：${appeared}\n已显示控制器数：${router.appeared.length}`,
      });
    },
  },
});

controller.rootView.views = [statusLabel, inspectButton];
controller.uirender({ title: "Base Controller" });
