import { Input, KeyboardAvoidanceController, Scroll } from "../../index";

const contentHeight = 760;
const containerId = "keyboard-avoidance-example-container";
let scrollView: UIScrollView | undefined;

const bottomInput = new Input({
  props: {
    placeholder: "位于滚动内容底部的输入框",
    bgcolor: $color("secondarySurface"),
    cornerRadius: 10,
  },
  layout: (make, view) => {
    make.left.right.inset(20);
    make.top.equalTo(680);
    make.height.equalTo(44);
  },
  events: {
    didBeginEditing: () => {
      // 等待 KeyboardAvoidanceController 收到键盘高度并完成根视图布局。
      $delay(0.1, () => {
        const scroll = scrollView;
        if (!scroll) return;
        const maximumOffset = Math.max(0, scroll.contentSize.height - scroll.frame.height);
        scroll.scrollToOffset($point(0, maximumOffset));
      });
    },
    returned: (sender) => sender.blur(),
  },
});

const formScroll = new Scroll({
  props: {
    alwaysBounceVertical: true,
    keyboardDismissMode: 2,
  },
  layout: $layout.fill,
  events: {
    layoutSubviews: (sender) => {
      scrollView = sender;
      const container = $(containerId) as UIView;
      if (sender.frame.width <= 0 || !container) return;
      container.frame = $rect(0, 0, sender.frame.width, contentHeight);
      sender.contentSize = $size(sender.frame.width, contentHeight);
    },
  },
  views: [
    {
      type: "view",
      props: { id: containerId },
      views: [
        {
          type: "label",
          props: {
            text: "根视图会避开停靠键盘；ScrollView 再把当前输入框滚动到新的可见区域。",
            lines: 0,
            font: $font(17),
          },
          layout: (make, view) => {
            make.left.right.inset(20);
            make.top.equalTo(24);
            make.height.equalTo(60);
          },
        },
        {
          type: "input",
          props: {
            placeholder: "中间的输入框",
            bgcolor: $color("secondarySurface"),
            cornerRadius: 10,
          },
          layout: (make, view) => {
            make.left.right.inset(20);
            make.top.equalTo(330);
            make.height.equalTo(44);
          },
        },
        bottomInput.definition,
      ],
    },
  ],
});

const controller = new KeyboardAvoidanceController({
  events: {
    keyboardHeightChanged: (_controller, height) => console.log(`keyboard height: ${height}`),
  },
});

controller.rootView.views = [formScroll];
controller.uirender({ title: "Keyboard Avoidance" });
