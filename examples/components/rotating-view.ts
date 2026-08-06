import { Image, RotatingView } from "../../index";

const rotatingView = new RotatingView({
  props: {
    cview: new Image({
      props: {
        symbol: "arrow.triangle.2.circlepath",
        tintColor: $color("systemLink"),
        contentMode: $contentMode.scaleAspectFit,
      },
      layout: $layout.fill,
    }),
    rps: 0.4,
    autoStart: true,
  },
  layout: (make, view) => {
    make.centerX.equalTo(view.super);
    make.centerY.equalTo(view.super).offset(-32);
    make.size.equalTo($size(72, 72));
  },
});

let rotating = true;

$ui.render({
  props: { title: "Rotating View" },
  views: [
    rotatingView.definition,
    {
      type: "button",
      props: { title: "停止" },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).offset(24);
        make.centerX.equalTo(view.super);
        make.size.equalTo($size(140, 44));
      },
      events: {
        tapped: (sender) => {
          rotating = !rotating;
          if (rotating) {
            sender.title = "停止";
            rotatingView.startRotating();
          } else {
            rotatingView.stopRotating();
            sender.title = "正在停止…";
            sender.enabled = false;
            // stopRotating 会让当前整圈动画自然完成；等待一圈后再允许重新开始，避免并行动画链。
            $delay(2.6, () => {
              sender.title = "开始";
              sender.enabled = true;
            });
          }
        },
      },
    },
  ],
});
