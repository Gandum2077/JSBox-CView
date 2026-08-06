import { AndroidStyleSpinner } from "../../index";

const spinner = new AndroidStyleSpinner({
  props: {
    diameter: 44,
    weight: 2.5,
    color: $color("systemLink"),
  },
  layout: (make, view) => {
    make.centerX.equalTo(view.super);
    make.centerY.equalTo(view.super).offset(-16);
    make.size.equalTo($size(44, 44));
  },
});

$ui.render({
  props: { title: "Android Style Spinner" },
  views: [
    spinner.definition,
    {
      type: "label",
      props: {
        text: "由 Lottie 驱动的伸缩圆环",
        align: $align.center,
        textColor: $color("secondaryText"),
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).offset(16);
        make.centerX.equalTo(view.super);
      },
    },
  ],
});
